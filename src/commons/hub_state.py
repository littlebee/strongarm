import json
import time
from typing import Dict, Any, List
from logging import getLogger

from commons import constants as c

log = getLogger(__name__)

PERSISTED_STATE_FILE = "./persisted_state.json"
TEST_PERSISTED_STATE_INPUT_FILE = "./tests/persisted_state.json"
TEST_PERSISTED_STATE_OUTPUT_FILE = "./tests/persisted_state_out.json"


state: Dict[str, Any] = {
    # provided by central_hub/
    "hub_stats": {"state_updates_recv": 0},
    # last requested angles
    "set_angles": [],
    # actual angles last reported by servos
    "current_angles": [],
    # which subsystems are online and have indentified themselves
    "subsystem_stats": {},
    # array of json file names provided to central hub
    # by arms_config_provider
    "arm_config_files": [],
    # initially by arms_config_provider to last selected, can be changed
    # to any of the arm_configs
    "arm_config_selected": "",
    # currently selected arm config provided by arms_config_provider
    "arm_config": {
        "filename": None,
        "updated_at": None,
        # the arm ports associated with selected arm configuration
        "arm_parts": [],
    },
    # Structure of the objects in the array is consumed and controlled
    # by the UI.
    #
    # See hubState.js for details on the structure of the objects.
    "saved_positions": [],
}

persisted_state_keys: List[str] = [
    "arm_config_selected",
    "saved_positions",
]


# This should only be called by central_hub
def init_persisted_state() -> None:
    file = PERSISTED_STATE_FILE
    if c.STRONGARM_ENV == "test":
        log.info(
            f"Running in test mode, using {TEST_PERSISTED_STATE_INPUT_FILE} persisted state file"
        )
        file = TEST_PERSISTED_STATE_INPUT_FILE

    try:
        with open(file, "r") as f:
            persisted_state = json.load(f)
            for key in persisted_state_keys:
                if key in persisted_state:
                    state[key] = persisted_state[key]
    except FileNotFoundError:
        log.info("No persisted state file found")
    except Exception as e:
        log.error(f"Error loading persisted state: {e}")

    log.info(f"initial state: {state}")


# This should only be called by central_hub
def persist_state() -> None:
    """Persist specified state keys to file."""
    file = PERSISTED_STATE_FILE
    if c.STRONGARM_ENV == "test":
        log.info(
            f"Running in test mode, using {TEST_PERSISTED_STATE_OUTPUT_FILE} file to persist state"
        )
        file = TEST_PERSISTED_STATE_INPUT_FILE

    try:
        persisted_state = {
            key: state[key] for key in persisted_state_keys if key in state
        }
        with open(file, "w") as f:
            json.dump(persisted_state, f, indent=4)
    except (IOError, json.JSONDecodeError) as e:
        log.error(f"Failed to persist state: {e}")


def serialize_state(keysRequested=None) -> str:
    """Serialize current state to JSON string."""

    requestedState = state
    if keysRequested:
        requestedState = {key: state[key] for key in keysRequested if key in state}

    try:
        return json.dumps({"type": "state", "data": requestedState})
    except json.JSONDecodeError as e:
        log.error(f"Failed to serialize state: {e}")
        return json.dumps({"type": "state", "data": {}})


def update_state_from_message_data(message_data: Dict[str, Any]) -> None:
    global state
    """Update state from received message data."""
    for key, data in message_data.items():
        state[key] = data
        state[f"{key}_updated_at"] = time.time()
