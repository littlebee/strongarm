#!/usr/bin/env python3

import asyncio
import json
import time
import traceback
import websockets


from commons import constants as c, messages, log

SAVED_POSITIONS_FILE = "saved_positions.json"

connected_socket = None


# this should only need to be done when this service starts up
# from then on, the UI will send the saved positions to the service
# and the service will save them to disk
async def send_saved_positions(websocket):
    with open(SAVED_POSITIONS_FILE) as f:
        saved_positions = json.load(f)
        log.info(f"sending saved_positions: {saved_positions}")
        await messages.send_state_update(
            websocket, {"saved_positions": saved_positions}
        )


async def consumer_task():
    global connected_socket
    while True:
        try:
            log.info(f"connecting to {c.HUB_URI}")
            async with websockets.connect(c.HUB_URI) as websocket:
                await messages.send_identity(websocket, "saved_positions_provider")
                await messages.send_subscribe(websocket, ["saved_positions"])

                await send_saved_positions(websocket)
                connected_socket = websocket

                async for message in websocket:
                    data = json.loads(message)
                    message_data = data.get("data")
                    try:
                        if c.LOG_ALL_MESSAGES:
                            log.info(f"received {message_data}")
                        if "saved_positions" in message_data:
                            saved_positions = message_data["saved_positions"]
                            with open(SAVED_POSITIONS_FILE, "w") as f:
                                json.dump(saved_positions, f)
                                log.info(f"saved positions updated: {saved_positions}")

                    except:
                        log.error(f"error saving positions: {message_data}")
                        traceback.print_exc()

        except:
            traceback.print_exc()

        if connected_socket:
            connected_socket.close()
            connected_socket = None

        print("socket disconnected.  Reconnecting in 5 sec...")
        time.sleep(5)


asyncio.run(consumer_task())
