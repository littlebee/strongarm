import time
import json

from commons import log
from commons.arm_parts import arm_parts, movable_parts

state = {
    # provided by central_hub/
    "hub_stats": {"state_updates_recv": 0},
    # last requested angles
    "set_angles": [],
    # actual angles last reported by servos
    "current_angles": [],
    # centralized config
    "config": {"min_servo_angle": 0, "max_servo_angle": 180},
    "subsystem_stats": {},
    "arm_parts": arm_parts,
}

log.info(f"initial state: {state}")


def serializeState():
    return json.dumps({"type": "state", "data": state})


def update_state_from_message_data(message_data):
    for key in message_data:
        data = message_data[key]
        if key == "set_angles":
            # clamp angles to min/max
            for i in range(len(movable_parts)):
                partMin = movable_parts[i].get("minAngle") or 0
                partMax = movable_parts[i].get("maxAngle") or 180
                log.info(f"clamping {data[i]} to {partMin} to {partMax}")
                if data[i] < 0:
                    # TODO : this case is specific to how the ArmAngleControl is implemented
                    #    and should probably be moved there
                    data[i] = partMax if data[i] < -(180 - 45) else partMin
                else:
                    data[i] = max(partMin, min(partMax, data[i]))
                log.info(f"clamped={data[i]}")

        state[key] = data
        state[f"{key}_updated_at"] = time.time()
    return
