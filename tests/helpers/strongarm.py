import os
import time

import helpers.constants as tc


def start():
    """starts stongarm subsystem as a detached process using same start script used to start on the bot"""
    cmd = f"LOG_ALL_MESSAGES=1 HUB_PORT={tc.CENTRAL_HUB_TEST_PORT} ./start.sh src/strongarm.py"
    exit_code = os.system(cmd)
    assert exit_code == 0
    time.sleep(1)


def stop():
    """stops behavior subsystem"""
    exit_code = os.system("./stop.sh src/strongarm.py")

    # note that this only shows up when a test module fails
    print("\n Strongarm subsystem logs")
    print("===================================================================")
    os.system("cat logs/strongarm.py.log")
    print("===================================================================")

    assert exit_code == 0
