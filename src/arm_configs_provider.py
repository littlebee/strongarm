#!/usr/bin/env python3

import asyncio
import json
import os
import time
import traceback
import websockets

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

from commons import constants as c, messages, log

SAVED_CONFIG_FILE = ".current_arm_config"


arm_config_files = []
current_arm_config = None
connected_socket = None


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


async def initialize_arm_configs():
    load_arm_config_filenames()

    config_file = None
    if not c.STRONGARM_ENV == "test" and os.path.exists(SAVED_CONFIG_FILE):
        with open(SAVED_CONFIG_FILE, "r") as f:
            config_file = f.read()
    else:
        config_file = arm_config_files[0]

    await load_arm_config(config_file)


async def load_arm_config(arm_config_json_file):

    with open(f"{c.ARM_CONFIGS_DIR}/{arm_config_json_file}") as f:
        global current_arm_config
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
        with open(SAVED_CONFIG_FILE, "w") as f:
            f.write(arm_config_json_file)


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


async def consumer_task():
    global connected_socket
    while True:
        try:
            log.info(f"connecting to {c.HUB_URI}")
            async with websockets.connect(c.HUB_URI) as websocket:
                await messages.send_identity(websocket, "arm_configs_provider")
                await messages.send_subscribe(websocket, ["arm_config_selected"])
                await initialize_arm_configs()

                await send_arm_config_filenames(websocket)
                await send_arm_config(websocket)
                await send_selected_arm_config(websocket)

                connected_socket = websocket

                async for message in websocket:
                    data = json.loads(message)
                    message_data = data.get("data")
                    if c.LOG_ALL_MESSAGES:
                        log.info(f"received {message_data}")

                    if "arm_config_selected" in message_data:
                        arm_config_selected = message_data["arm_config_selected"]
                        if arm_config_selected != current_arm_config["filename"]:
                            log.info(
                                f"changing arm_config from {current_arm_config['filename']} to {arm_config_selected}"
                            )
                            try:
                                await load_arm_config(arm_config_selected)
                                await send_arm_config(websocket)

                            except:
                                log.error(
                                    f"error loading arm config: {message_data}, resetting to {current_arm_config['filename']}"
                                )
                                await send_selected_arm_config(websocket)
                                traceback.print_exc()

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
