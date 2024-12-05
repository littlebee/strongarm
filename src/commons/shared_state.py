import time
import json

state = {
    # provided by central_hub/
    "hub_stats": {"state_updates_recv": 0},
    # last requested angles
    "set_angles": [],
    # actual angles last reported by servos
    "current_angles": [],
    # centralised config
    "config": {"min_servo_angle": 0, "max_servo_angle": 180},
    "subsystem_stats": {},
}


def serializeState():
    return json.dumps({"type": "state", "data": state})


def update_state_from_message_data(message_data):
    for key in message_data:
        state[key] = message_data[key]
        state[f"{key}_updated_at"] = time.time()
    return
