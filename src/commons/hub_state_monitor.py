"""
This class updates the local copy of the hub state as subscribed keys are changed.

A thread is created to listen for state updates from the central hub.
When a state update is received, the local state is updated and the
state_updated_at timestamp is updated.
"""

import time
import threading
import asyncio
import websockets
import traceback
import json

from commons import constants, messages, log, hub_state


class HubStateMonitor:
    """
    This class updates the process local copy of the hub state as subscribed keys
    are changed.  It starts a thread to listen for state updates from the central
    hub and applies them to the local state via hub_state.update_state_from_message_data.

    This class is a singleton.  Only one instance should be created per process.
    """

    # background thread connects to central_hub and listens for state updates
    thread = None

    # web socket if we are connected, None otherwise
    connected_socket = None

    # these should be provided to the constructor
    identity = "hub_state_monitor"
    # "*" subscribes to all keys or you can pass an array of keys
    subscribed_keys = "*"

    def __init__(self, identity, subscribed_keys):
        HubStateMonitor.identity = identity
        HubStateMonitor.subscribed_keys = subscribed_keys

        if HubStateMonitor.thread is None:
            HubStateMonitor.thread = threading.Thread(target=self._thread)
            HubStateMonitor.thread.start()

    @classmethod
    async def monitor_state(cls):
        while True:
            try:
                log.info(
                    f"hub_state_monitor connecting to hub central at {constants.HUB_URI}"
                )
                async with websockets.connect(constants.HUB_URI) as websocket:
                    cls.connected_socket = websocket
                    await messages.send_identity(websocket, cls.identity)
                    await messages.send_get_state(websocket)
                    await messages.send_subscribe(websocket, cls.subscribed_keys)
                    async for message in websocket:
                        data = json.loads(message)
                        if data.get("type") == "state":
                            message_data = data.get("data")
                            hub_state.update_state_from_message_data(message_data)
                        await asyncio.sleep(0)

            except:
                traceback.print_exc()

            cls.connected_socket = None
            log.info("central_hub socket disconnected.  Reconnecting in 5 sec...")
            time.sleep(5)

    @classmethod
    def _thread(cls):
        log.info("Starting recognition thread.")
        asyncio.run(cls.monitor_state())
