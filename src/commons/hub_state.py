import time
import json

from commons import log

PERSISTED_STATE_FILE = "./persisted_state.json"

state = {
    # provided by central_hub/
    "hub_stats": {"state_updates_recv": 0},
    # last requested angles
    "set_angles": [],
    # actual angles last reported by servos
    "current_angles": [],
    # centralized config
    "config": {"min_servo_angle": 0, "max_servo_angle": 180},
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

persisted_state_keys = [
    "arm_config_selected",
    "saved_positions",
]

# if persisted state file exists, load it
try:
    with open(PERSISTED_STATE_FILE, "r") as f:
        persisted_state = json.load(f)
        for key in persisted_state_keys:
            if key in persisted_state:
                state[key] = persisted_state[key]
except FileNotFoundError:
    log.info("No persisted state file found")
except Exception as e:
    log.error(f"Error loading persisted state: {e}")

log.info(f"initial state: {state}")


def persist_state():
    persisted_state = {}
    for key in persisted_state_keys:
        persisted_state[key] = state[key]
    with open(PERSISTED_STATE_FILE, "w") as f:
        json.dump(persisted_state, f, indent=4)


def serializeState():
    return json.dumps({"type": "state", "data": state})


def update_state_from_message_data(message_data):
    for key in message_data:
        data = message_data[key]
        if key == "set_angles":
            arm_parts = state.get("arm_config", {}).get("arm_parts", [])
            movable_parts = [part for part in arm_parts if not part.get("fixed")]
            log.info(f"got set_angles {movable_parts}")
            # clamp angles to min/max
            for i in range(len(movable_parts)):
                partMin = movable_parts[i].get("minAngle") or 0
                partMax = movable_parts[i].get("maxAngle") or 180
                if data[i] < 0:
                    # TODO : this case is specific to how the ArmAngleControl is implemented
                    #    and should probably be moved there
                    data[i] = partMax if data[i] < -(180 - 45) else partMin
                else:
                    data[i] = max(partMin, min(partMax, data[i]))

        state[key] = data
        state[f"{key}_updated_at"] = time.time()
    return
