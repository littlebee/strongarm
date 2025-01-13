#!/usr/bin/env python3

import logging
import json
import asyncio
import websockets
import traceback


from commons import constants, hub_state, log

logging.basicConfig()

connected_sockets = set()

# a dictionary of sets containing sockets by top level
# dictionary key in hub_state
subscribers = dict()

# a dictionary of websocket to subsystem name; see handle_identity
identities = dict()


def iseeu_message(websocket):
    return json.dumps(
        {
            "type": "iseeu",
            "data": {
                "ip": websocket.remote_address[0],
                "port": websocket.remote_address[1],
            },
        }
    )


async def send_message(websocket, message):
    if constants.LOG_ALL_MESSAGES and message != '{"type": "pong"}':
        log.info(
            f"sending {message} to {websocket.remote_address[0]}:{websocket.remote_address[1]}"
        )
    if websocket and websocket != "all":
        await websocket.send(message)
    elif connected_sockets:  # asyncio.wait doesn't accept an empty list
        await asyncio.wait([websocket.send(message) for websocket in connected_sockets])


async def send_state_update_to_subscribers(message_data):
    subscribed_sockets = set()
    for key in message_data:
        if key in subscribers:
            # log.info(f"subscribed sockets for {key}: {subscribers[key]}")
            for sub_socket in subscribers[key]:
                subscribed_sockets.add(sub_socket)

    relay_message = json.dumps(
        {
            "type": "stateUpdate",
            # note that we send the message as received to any subscribers
            # of **any** keys in the message. So if a subsystem sends updates
            # for two keys and a client is subscribed to one of the keys, it
            # will get both keys in the stateUpdate message.
            "data": message_data,
        }
    )
    sockets_to_close = set()
    for socket in subscribed_sockets:
        try:
            await send_message(socket, relay_message)
        except Exception as e:
            log.error(
                f"error sending message to subscriber {socket.remote_address[1]}: {e}"
            )
            traceback.print_exc()
            sockets_to_close.add(socket)

    for socket in sockets_to_close:
        log.info(f"relay error: closing socket {socket.remote_address[1]}")
        await unregister(socket)
        socket.close()


async def notify_state(websocket="all", keysRequested=None):
    await send_message(websocket, hub_state.serialize_state(keysRequested))


# NOTE that there is no "all" option here, need a websocket,
#  ye shall not ever broadcast this info
async def notify_iseeu(websocket):
    if not websocket or websocket == "all":
        return
    await send_message(websocket, iseeu_message(websocket))


async def update_online_status(subsystem_name: str, status: int):
    if subsystem_name in hub_state.state["subsystem_stats"]:
        hub_state.state["subsystem_stats"][subsystem_name]["online"] = status
    else:
        hub_state.state["subsystem_stats"][subsystem_name] = {"online": status}

    await send_state_update_to_subscribers(
        {"subsystem_stats": hub_state.state["subsystem_stats"]}
    )


async def register(websocket):
    log.info(
        f"got new connection from {websocket.remote_address[0]}:{websocket.remote_address[1]}:"
    )
    connected_sockets.add(websocket)


async def unregister(websocket):
    log.info(
        f"lost connection {websocket.remote_address[0]}:{websocket.remote_address[1]}"
    )
    try:
        connected_sockets.remove(websocket)
        for key in subscribers:
            subscribers[key].remove(websocket)
        subsystem_name = identities.pop(websocket, None)

        await update_online_status(subsystem_name, 0)
    except:
        pass


async def handle_state_request(websocket, keysRequested=None):
    await notify_state(websocket, keysRequested)


async def handle_state_update(message_data):
    global subscribers

    hub_state.update_state_from_message_data(message_data)
    hub_state.state["hub_stats"]["state_updates_recv"] += 1

    await send_state_update_to_subscribers(message_data)


async def handle_state_subscribe(websocket, data):
    global subscribers
    subscription_keys = []
    if data == "*":
        subscription_keys = hub_state.state.keys()
    else:
        subscription_keys = data

    for key in subscription_keys:
        socket_set = None
        if key in subscribers:
            socket_set = subscribers[key]
        else:
            socket_set = set()
            subscribers[key] = socket_set

        log.info(
            f"subscribing {websocket.remote_address[0]}:{websocket.remote_address[1]} to {key}"
        )
        socket_set.add(websocket)


async def handle_state_unsubscribe(websocket, data):
    global subscribers
    subscription_keys = []
    if data == "*":
        subscription_keys = subscribers.keys()
    else:
        subscription_keys = data

    for key in subscription_keys:
        if key in subscribers:
            subscribers[key].remove(websocket)


async def handle_identity(websocket, subsystem_name):
    identities[websocket] = subsystem_name
    log.info(f"setting identity of {websocket.remote_address[1]} to {subsystem_name}")
    await update_online_status(subsystem_name, 1)
    await notify_iseeu(websocket)


async def handle_ping(websocket):
    await send_message(websocket, json.dumps({"type": "pong"}))


async def handle_message(websocket):
    await register(websocket)
    try:
        async for message in websocket:
            jsonData = json.loads(message)
            messageType = jsonData.get("type")
            messageData = jsonData.get("data")

            if constants.LOG_ALL_MESSAGES and messageType != "ping":
                log.info(f"received {message} from {websocket.remote_address[1]}")

            # {type: "getState, data: [state_keys] or omitted}
            if messageType == "getState":
                await handle_state_request(websocket, messageData)
            # {type: "updateState" data: { new state }}
            elif messageType == "updateState":
                await handle_state_update(messageData)
            # {type: "subscribeState", data: [state_keys] or "*"
            elif messageType == "subscribeState":
                await handle_state_subscribe(websocket, messageData)
            # {type: "unsubscribeState", data: [state_keys] or "*"
            elif messageType == "unsubscribeState":
                await handle_state_unsubscribe(websocket, messageData)
            # {type: "identity", data: "subsystem_name"}
            elif messageType == "identity":
                await handle_identity(websocket, messageData)
            elif messageType == "ping":
                await handle_ping(websocket)
            else:
                log.error("received unsupported message: %s", messageType)

            if constants.LOG_ALL_MESSAGES and messageType != "ping":
                log.info(f"getting next message for {websocket.remote_address[1]}")

    except Exception as e:
        # don't log the exception if it's just a disconnect "no close frame"
        if "no close frame received" not in str(e):
            log.error(f"handle_message from {websocket.remote_address[1]}: {e}")
            traceback.print_exc()
            raise e

    finally:
        await unregister(websocket)
        await websocket.close()


async def persist_state_task():

    while True:
        hub_state.persist_state()
        await asyncio.sleep(1)


async def main():
    log.info("Loading persisted state")
    hub_state.init_persisted_state()
    log.info(f"Starting server on port {constants.HUB_PORT}")
    async with websockets.serve(handle_message, port=constants.HUB_PORT):
        # log.info("Starting hub stats task")
        # await send_hub_stats_task()
        await persist_state_task()
        await asyncio.Future()  # run forever


asyncio.run(main())
