import json
from enum import Enum

from commons import log, constants as c


class MessageType(Enum):
    STATE_UPDATE = "stateUpdate"
    STATE = "state"
    IDENTITY = "iseeu"


async def send_message(websocket, message):
    json_message = json.dumps(message)
    if c.LOG_ALL_MESSAGES:
        log.info(f"sent {json_message} to {websocket.remote_address[1]}")
    await websocket.send(json_message)


async def send_identity(websocket, name):
    await send_message(
        websocket,
        {
            "type": "identity",
            "data": name,
        },
    )


# subscriptionNames should be an array or "*"
async def send_subscribe(websocket, subscriptionNames):
    await send_message(
        websocket,
        {
            "type": "subscribeState",
            "data": subscriptionNames,
        },
    )


async def send_get_state(websocket):
    await send_message(
        websocket,
        {
            "type": "getState",
        },
    )


async def send_state_update(websocket, stateData):
    await send_message(
        websocket,
        {
            "type": "updateState",
            "data": stateData,
        },
    )
