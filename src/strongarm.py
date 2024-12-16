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

connected_socket = None


async def send_current_angles_if_changed(websocket):
    global last_sent_angles
    current_angles = [servo.current_angle for servo in servos]
    if any(
        angle != last_sent_angles[index] for index, angle in enumerate(current_angles)
    ):
        log.info(
            f"current_angles: {current_angles} != last_sent_angles: {last_sent_angles}"
        )
        await messages.send_state_update(websocket, {"current_angles": current_angles})
        last_sent_angles = current_angles


async def init_hubstate_angles(websocket):
    current_angles = []
    set_angles = []
    for s in servos:
        current_angles.append(s.current_angle)
        set_angles.append(s.destination_angle)

    await messages.send_state_update(
        websocket, {"current_angles": current_angles, "set_angles": set_angles}
    )


async def current_angles_provider_task():
    while True:
        if connected_socket:
            await send_current_angles_if_changed(connected_socket)
        await asyncio.sleep(0.1)


async def set_angles_consumer_task():
    global connected_socket
    while True:
        try:
            log.info(f"connecting to {c.HUB_URI}")
            async with websockets.connect(c.HUB_URI) as websocket:
                await messages.send_identity(websocket, "strongarm")
                await messages.send_subscribe(websocket, ["set_angles"])
                await init_hubstate_angles(websocket)
                connected_socket = websocket

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

        if connected_socket:
            connected_socket.close()
            connected_socket = None

        print("socket disconnected.  Reconnecting in 5 sec...")
        time.sleep(5)


async def main():
    log.info("creating task current_angles_provider_task")
    t1 = asyncio.create_task(current_angles_provider_task())
    log.info("created task current_angles_provider_task")
    t2 = asyncio.create_task(set_angles_consumer_task())

    # Wait for all tasks to complete
    await asyncio.gather(t1, t2)


asyncio.run(main())
