import os
import time

from typing import List

import helpers.constants as tc


def start_services(service_list: List[str]):
    """
    starts subsystems as a detached process using same start script used to start on the bot

    Args:
        service_list = the names of the subsystems to start.  Which should be the base file names of the
                service main file in src/ directory.
    """
    for service_name in service_list:
        cmd = f"LOG_ALL_MESSAGES=1 HUB_PORT={tc.CENTRAL_HUB_TEST_PORT} ./start.sh src/{service_name}.py"
        exit_code = os.system(cmd)
        assert exit_code == 0
        time.sleep(1)


def stop_services(service_list: List[str]):
    """
    stops subsystems

    Args:
        service_list = the names of the subsystems to start.  Which should be the base file names of the
                service main file in src/ directory.
    """
    for service_name in service_list:
        exit_code = os.system(f"./stop.sh src/{service_name}.py")

        # note that this only shows up when a test module fails
        print(f"\n {service_name} subsystem logs")
        print("===================================================================")
        os.system(f"cat logs/{service_name}.py.log")
        print("===================================================================")

        assert exit_code == 0
