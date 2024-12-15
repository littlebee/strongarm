#!/usr/bin/env python3

import asyncio
import json
import os
import time
import traceback
import websockets

# from watchdog.observers import Observer
# from watchdog.events import FileSystemEventHandler
# from hachiko.hachiko import AIOWatchdog, AIOEventHandler

from watchfiles import awatch

from commons import constants as c, messages, log

SAVED_CONFIG_FILE = ".current_arm_config"
ARM_CONFIGS_DIR = "./src/webapp/public/arm-configs"


arm_config_files = []
current_arm_config = None


async def file_watcher(websocket):
    async for changes in awatch("/path/to/dir"):
        log.info(changes)


def load_arm_config_filenames():
    global arm_config_files
    arm_config_files = [f for f in os.listdir(ARM_CONFIGS_DIR) if f.endswith(".json")]
    log.info(f"loaded arm_configs: {arm_config_files}")
    return arm_config_files


async def send_arm_config_filenames(websocket):
    global arm_config_files
    log.info(f"sending arm_config_files: {arm_config_files}")
    await messages.send_state_update(websocket, {"arm_config_files": arm_config_files})


async def initialize_arm_configs():
    load_arm_config_filenames()

    config_file = None
    if os.path.exists(SAVED_CONFIG_FILE):
        with open(SAVED_CONFIG_FILE, "r") as f:
            config_file = f.read()
    else:
        config_file = arm_config_files[0]

    await load_arm_config(config_file)


async def load_arm_config(arm_config_json_file):
    with open(f"{ARM_CONFIGS_DIR}/{arm_config_json_file}") as f:
        global current_arm_config
        current_arm_config = json.load(f)
        current_arm_config["filename"] = arm_config_json_file
        current_arm_config["updated_at"] = time.time()
        log.info(f"loaded arm config: {current_arm_config}")
        with open(SAVED_CONFIG_FILE, "w") as f:
            f.write(arm_config_json_file)


async def send_arm_config(websocket):
    global current_arm_config
    log.info(f"sending arm_config: {current_arm_config}")
    await messages.send_state_update(websocket, {"arm_config": current_arm_config})


async def send_selected_arm_config(websocket):
    global current_arm_config
    log.info(f"sending selected arm_config: {current_arm_config["filename"]}")
    await messages.send_state_update(
        websocket, {"arm_config_selected": current_arm_config["filename"]}
    )


async def consumer_task():
    fileWatch = None
    while True:
        try:
            log.info(f"connecting to {c.HUB_URI}")
            async with websockets.connect(c.HUB_URI) as websocket:
                await messages.send_identity(websocket, "arms_config_provider")
                await messages.send_subscribe(websocket, ["arm_config_selected"])
                await initialize_arm_configs()

                await send_arm_config_filenames(websocket)
                await send_arm_config(websocket)
                await send_selected_arm_config(websocket)

                # class FileChangeHandler(AIOEventHandler):
                #     async def on_created(self, event):
                #         global current_arm_config
                #         log.info(f"FileChangeHandler: {event}")
                #         if event.is_directory:
                #             await load_arm_config_filenames()
                #             await send_arm_config_filenames(websocket)
                #         else:
                #             # extract base filename from event
                #             filename = os.path.basename(event.src_path)
                #             if filename == current_arm_config["filename"]:
                #                 await load_arm_config(filename)
                #                 await send_arm_config(websocket)

                # event_handler = FileChangeHandler()
                # fileWatch = AIOWatchdog(ARM_CONFIGS_DIR, event_handler)
                # fileWatch.start()

                async for message in websocket:
                    data = json.loads(message)
                    message_data = data.get("data")
                    try:
                        if c.LOG_ALL_MESSAGES:
                            log.info(f"received {message_data}")
                        if "arm_config_selected" in message_data:
                            arm_config_selected = message_data["arm_config_selected"]
                            if arm_config_selected != current_arm_config["filename"]:
                                await load_arm_config(arm_config_selected)
                                await send_arm_config(websocket)

                    except:
                        log.error(f"error loading arm config: {message_data}")
                        traceback.print_exc()

        except:
            traceback.print_exc()

        fileWatch and fileWatch.stop()

        print("socket disconnected.  Reconnecting in 5 sec...")
        time.sleep(5)


asyncio.run(consumer_task())
