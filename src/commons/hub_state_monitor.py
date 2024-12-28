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
    This class updates the local copy of the hub state as subscribed keys are changed.
    """

    thread = None  # background thread that reads frames from camera
    identity = "hub_state_monitor"
    subscribed_keys = "*"  # all keys

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

            log.info("central_hub socket disconnected.  Reconnecting in 5 sec...")
            time.sleep(5)

    @classmethod
    def _thread(cls):
        log.info("Starting recognition thread.")
        asyncio.run(cls.monitor_state())
