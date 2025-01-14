#!/usr/bin/env python3

import asyncio
import json
import os
import time
import traceback
import websockets

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from commons import constants as c, messages, log, hub_state


arm_config_files = []
current_arm_config = None
connected_socket = None
has_received_state = False


def load_arm_config_filenames():
    global arm_config_files
    log.info(f"loading arm_configs from {c.ARM_CONFIGS_DIR}")
    arm_config_files = [f for f in os.listdir(c.ARM_CONFIGS_DIR) if f.endswith(".json")]
    log.info(f"loaded arm_configs: {arm_config_files}")
    return arm_config_files


async def send_arm_config_filenames(websocket):
    global arm_config_files
    log.info(f"sending arm_config_files: {arm_config_files}")
    await messages.send_state_update(websocket, {"arm_config_files": arm_config_files})


async def load_and_send_arm_config_filenames(websocket):
    load_arm_config_filenames()
    await send_arm_config_filenames(websocket)


async def load_arm_config(arm_config_json_file):
    log.info("loading arm_config: " + arm_config_json_file)

    with open(f"{c.ARM_CONFIGS_DIR}/{arm_config_json_file}") as f:
        global current_arm_config
        log.info(f"loading arm config: {arm_config_json_file}")
        loaded_arm_config = json.load(f)
        current_arm_config = {
            "filename": arm_config_json_file,
            "updated_at": time.time(),
            "description": loaded_arm_config["description"],
            "arm_parts": [],
        }

        for jsonPartFile in loaded_arm_config["arm_parts"]:
            log.info("jsonPartFile: " + jsonPartFile)
            new_arm_part = {
                "part_json_file": jsonPartFile,
            }
            with open(f"{c.ARM_PARTS_DIR}/{jsonPartFile}") as f:
                loaded_part_file = json.load(f)
                new_arm_part.update(loaded_part_file)
            current_arm_config["arm_parts"].append(new_arm_part)

        log.info(f"loaded arm config: {current_arm_config}")


async def send_arm_config(websocket):
    global current_arm_config
    log.info(f"sending arm_config: {current_arm_config}")
    await messages.send_state_update(websocket, {"arm_config": current_arm_config})


async def load_and_send_arm_config(websocket, arm_config_json_file):
    await load_arm_config(arm_config_json_file)
    await send_arm_config(websocket)


async def send_selected_arm_config(websocket):
    global current_arm_config
    log.info(f"sending selected arm_config: {current_arm_config['filename']}")
    await messages.send_state_update(
        websocket, {"arm_config_selected": current_arm_config["filename"]}
    )


async def handle_selected_arm_config(websocket, message_data):
    global current_arm_config

    if "arm_config_selected" in message_data:
        arm_config_selected = message_data["arm_config_selected"]
        if (
            not current_arm_config
            or arm_config_selected != current_arm_config["filename"]
        ):
            log.info(f"changing arm_config to {arm_config_selected}")
            try:
                await load_arm_config(arm_config_selected)
                await send_arm_config(websocket)

            except:
                log.error(
                    f"error loading arm config: {message_data}, resetting to {current_arm_config['filename']}"
                )
                await send_selected_arm_config(websocket)
                # correct the erroneous selected_arm_config that led to this
                await hub_state.send_state_update(
                    {"arm_config_selected": current_arm_config["filename"]}
                )
                traceback.print_exc()


async def handle_message(websocket, data):
    global has_received_state

    message_type = data.get("type")
    message_data = data.get("data", {})

    if message_type in [
        messages.MessageType.STATE_UPDATE.value,
        messages.MessageType.STATE.value,
    ]:
        await handle_selected_arm_config(websocket, message_data)
        hub_state.update_state_from_message_data(message_data)
    else:
        if c.LOG_ALL_MESSAGES:
            log.info(f"ignoring message: {message_type=} {message_data=}")


async def consumer_task():
    global connected_socket
    while True:
        try:
            log.info(f"connecting to {c.HUB_URI}")
            async with websockets.connect(c.HUB_URI) as websocket:
                await messages.send_identity(websocket, "arm_configs_provider")
                await messages.send_subscribe(websocket, ["arm_config_selected"])
                await load_and_send_arm_config_filenames(websocket)
                await messages.send_get_state(websocket)

                connected_socket = websocket

                async for message in websocket:
                    messageDict = json.loads(message)
                    if c.LOG_ALL_MESSAGES:
                        log.info(f"received {messageDict}")
                    await handle_message(websocket, messageDict)

        except:
            traceback.print_exc()

        if connected_socket:
            connected_socket.close()
            connected_socket = None

        print("socket disconnected.  Reconnecting in 5 sec...")
        time.sleep(5)


class FileChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        global connected_socket
        global current_arm_config

        if not connected_socket:
            return

        if event.is_directory:
            log.info(f"directory modified: {event.src_path}")
            asyncio.run(load_and_send_arm_config_filenames(connected_socket))
        else:
            filename = os.path.basename(event.src_path)
            if filename == current_arm_config["filename"]:
                log.info(f"current arm config modified: {filename}")
                asyncio.run(load_and_send_arm_config(connected_socket, filename))


event_handler = FileChangeHandler()
observer = Observer()
observer.schedule(event_handler, path=c.ARM_CONFIGS_DIR, recursive=True)
observer.schedule(event_handler, path=c.ARM_PARTS_DIR, recursive=True)
observer.start()


asyncio.run(consumer_task())
