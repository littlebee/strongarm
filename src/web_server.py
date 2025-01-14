#!/usr/bin/env python3
"""

   Simple http server for serving the react web app from build dir

"""

import os
import threading
import logging

import psutil

from flask import Flask, send_from_directory
from flask_cors import CORS

from commons import web_utils, hub_state
from commons.hub_state_monitor import HubStateMonitor

app = Flask(__name__, static_url_path="/static")
CORS(app, supports_credentials=True)

_hub_state_monitor = HubStateMonitor("webserver", "*")

dir_path = os.path.dirname(os.path.realpath(__file__)) + "/webapp_vite/dist"


@app.route("/stats")
def send_stats():
    (cpu_temp, *rest) = [
        int(i) / 1000
        for i in os.popen("cat /sys/devices/virtual/thermal/thermal_zone*/temp")
        .read()
        .split()
    ]
    return web_utils.json_response(
        app,
        {
            "system": {
                "cpuPercent": psutil.cpu_percent(),
                "ram": psutil.virtual_memory()[2],
                "temp": {
                    "CPU": cpu_temp,
                },
            },
        },
    )


@app.route("/state")
def send_state():
    return web_utils.json_response(app, hub_state.state)


@app.route("/<path:filename>")
def send_file(filename):
    return send_from_directory(dir_path, filename)


@app.route("/static/js/<path:path>")
def send_static_js(path):
    return send_from_directory(dir_path + "/static/js", path)


@app.route("/static/css/<path:path>")
def send_static_css(path):
    return send_from_directory(dir_path + "/static/css", path)


@app.route("/")
def index():
    return send_from_directory(dir_path, "index.html")


class webapp:
    def __init__(self):
        pass

    def thread(self):
        app.run(host="0.0.0.0", port=80, threaded=True)

    def start_thread(self):
        thread = threading.Thread(target=self.thread)
        # 'True' means it is a front thread,it would close when the mainloop() closes
        thread.setDaemon(False)
        thread.start()  # Thread starts


def start_app():
    logger = logging.getLogger(__name__)
    logger.info(f"webapp started. serving {dir_path}")

    flask_app = webapp()
    flask_app.start_thread()


if __name__ == "__main__":
    start_app()
