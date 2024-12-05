#!/usr/bin/env python3

import time
import json
import asyncio
import traceback
import websockets

from commons import constants as c, messages, log, servo

servos = []
for i in range(c.SERVO_CHANNELS):
    servos.append(servo.Servo(i))

last_sent_angles = [servo.current_angle for servo in servos]


async def send_current_angles_if_changed(websocket):
    global last_sent_angles
    current_angles = [servo.current_angle for servo in servos]
    if current_angles != last_sent_angles:
        log.info(
            f"current_angles: {current_angles} != last_sent_angles: {last_sent_angles}"
        )
        await messages.send_state_update(websocket, {"current_angles": current_angles})
        last_sent_angles = current_angles


async def current_angles_provider_task(websocket):
    while True:
        await send_current_angles_if_changed(websocket)
        await asyncio.sleep(0.05)


async def set_angles_consumer_task():
    while True:
        try:
            log.info(f"connecting to {c.HUB_URI}")
            async with websockets.connect(c.HUB_URI) as websocket:

                await messages.send_identity(websocket, "strongarm")
                await messages.send_subscribe(websocket, ["set_angles"])

                log.info("creating task current_angles_provider_task")
                await asyncio.create_task(current_angles_provider_task(websocket))

                async for message in websocket:
                    data = json.loads(message)
                    message_data = data.get("data")
                    if c.LOG_ALL_MESSAGES:
                        log.info(f"received {message_data}")
                    if "set_angles" in message_data:
                        angles = message_data["set_angles"]
                        for i, angle in enumerate(angles):
                            servos[i].move_to(angle)

        except:
            traceback.print_exc()

        print("socket disconnected.  Reconnecting in 5 sec...")
        time.sleep(5)


asyncio.run(set_angles_consumer_task())
