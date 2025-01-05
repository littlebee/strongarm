#!/usr/bin/env python3

"""
    This python process is responsible for controlling the servos on the arm.

    It subscribes to the central_hub for `set_angles` m
    and publishes `current_angles`

"""

import asyncio
import json
import signal
import sys
import traceback
import websockets

from typing import List

from commons import constants as c, messages as m, log, servo, hub_state

force_stop = False

servos = []
for i in range(c.SERVO_CHANNELS):
    servos.append(servo.Servo(i))

last_sent_angles = [servo.current_angle for servo in servos]

connected_socket = None


async def send_current_angles_if_changed(websocket):
    global last_sent_angles
    current_angles = [servo.current_angle for servo in servos]
    # if c.LOG_ALL_MESSAGES:
    #     log.info(
    #         f"send_current_angles_if_changed, current_angles={current_angles}, last_sent_angles={last_sent_angles}"
    #     )
    if current_angles != last_sent_angles:
        log.info(
            f"current_angles: {current_angles} != last_sent_angles: {last_sent_angles}"
        )
        await m.send_state_update(websocket, {"current_angles": current_angles})
        last_sent_angles = current_angles


async def init_hubstate_angles(websocket):
    current_angles = []
    set_angles = []
    for s in servos:
        current_angles.append(s.current_angle)
        set_angles.append(s.destination_angle)

    await m.send_state_update(
        websocket, {"current_angles": current_angles, "set_angles": set_angles}
    )


async def current_angles_provider_task(websocket):
    global force_stop
    while not force_stop:
        if websocket.closed:
            log.info("websocket closed, exiting current_angles_provider_task")
            return

        await send_current_angles_if_changed(websocket)
        await asyncio.sleep(0.1)


def clamp_angles(new_angles: List[float]) -> List[float]:
    """clamp angles to min/max values and update hub_state set_angles if clamped"""
    last_set_angles = hub_state.state.get("set_angles", [])
    arm_parts = hub_state.state.get("arm_config", {}).get("arm_parts", [])
    movable_parts = [part for part in arm_parts if not part.get("fixed")]
    log.info(f"clamp_angles movable_parts: {movable_parts}")
    clamped_angles = []
    for i in range(len(movable_parts)):
        part = movable_parts[i]
        part_min = part.get("minAngle", 0)
        part_max = part.get("maxAngle", 180)

        if i >= len(new_angles):
            if i < len(last_set_angles):
                clamped_angles.append(last_set_angles[i])
            else:
                clamped_angles.append(part_min + (part_max - part_min) / 2)
            continue
        if new_angles[i] < 0:
            # this case is kinda specific to how ArmAngleControl is implemented
            clamped_angles.append(part_max if new_angles[i] < -(180 - 45) else part_min)
        else:
            clamped_angles.append(max(part_min, min(part_max, new_angles[i])))

    return clamped_angles if len(clamped_angles) > 0 else new_angles


async def handle_set_angles(websocket, message_data) -> bool:
    """returns true if message was handled; false if not set_angles message"""
    if "set_angles" in message_data:
        hub_set_angles = hub_state.state.get("set_angles", [])
        set_angles = message_data["set_angles"]
        clamped_angles = clamp_angles(set_angles)

        if clamped_angles != set_angles:
            await m.send_state_update(websocket, {"set_angles": clamped_angles})

        if clamped_angles != hub_set_angles:
            for i, angle in enumerate(clamped_angles):
                servos[i].move_to(angle)

            hub_state.state["set_angles"] = clamped_angles

        return True

    return False


async def hubstate_consumer_task():
    global connected_socket
    while not force_stop:
        connected_socket = None
        provider_task = None
        try:
            log.info(f"connecting to {c.HUB_URI}")
            async with websockets.connect(c.HUB_URI) as websocket:
                connected_socket = websocket
                # Initial setup
                await m.send_identity(websocket, "strongarm")
                await m.send_subscribe(websocket, ["set_angles", "arm_config"])
                await m.send_get_state(websocket)
                await init_hubstate_angles(websocket)

                log.info("connected to hub. starting current_angles_provider_task")
                provider_task = asyncio.create_task(
                    current_angles_provider_task(websocket)
                )

                log.info("starting main message processing loop")

                # Main message processing loop
                async for message in websocket:
                    try:
                        data = json.loads(message)
                        if c.LOG_ALL_MESSAGES:
                            log.info(f"received {data}")

                        message_type = data.get("type")
                        message_data = data.get("data", {})

                        match message_type:
                            case m.MessageType.STATE_UPDATE.value:
                                if not await handle_set_angles(websocket, message_data):
                                    hub_state.update_state_from_message_data(
                                        message_data
                                    )
                            case m.MessageType.STATE.value:
                                hub_state.update_state_from_message_data(message_data)
                            case _:
                                if c.LOG_ALL_MESSAGES:
                                    log.info(
                                        f"ignoring message: {message_type=} {message_data=}"
                                    )

                    except json.JSONDecodeError:
                        log.error(f"Invalid JSON in message: {message}")
                        continue

                    log.info("getting next message")

        except websockets.exceptions.WebSocketException as e:
            log.error(f"WebSocket error: {e}")
        except Exception as e:
            log.error(f"Unexpected error: {e}")
            traceback.print_exc()
        finally:
            if connected_socket:
                log.info("disconnecting from hub")
                await connected_socket.close()
                connected_socket = None
            if provider_task:
                log.info("cancelling current_angles_provider_task")
                provider_task.cancel()
                provider_task = None

            if force_stop:
                log.info("Exiting hubstate_consumer_task")
                return
            else:
                log.info("Reconnecting in 5 seconds...")
                await asyncio.sleep(5)


# # Another way to run the tasks instead of creating the provider task in the consumer task
# # I switched to the current way because I wasn't sure if it was safe to share the websocket
# # between the two tasks using a global variable
# async def main():
#     log.info("creating task current_angles_provider_task")
#     t1 = asyncio.create_task(current_angles_provider_task())
#     log.info("created task current_angles_provider_task")
#     t2 = asyncio.create_task(hubstate_consumer_task())

#     # Wait for all tasks to complete
#     await asyncio.gather(t1, t2)

# asyncio.run(hubstate_consumer_task())


def signal_term_handler(signal, frame):
    global force_stop, connected_socket

    log.info("got SIGTERM")
    force_stop = True
    if connected_socket:
        asyncio.run(connected_socket.close())
    sys.exit(0)


signal.signal(signal.SIGTERM, signal_term_handler)

try:
    asyncio.run(hubstate_consumer_task())
except:
    # not sure why this is necessary, but without it the process throws an exception
    # when it exits via the sigterm signal handler
    pass
