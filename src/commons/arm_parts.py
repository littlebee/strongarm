"""
    This is a list of parts that make up the arm. Each part is a dictionary
    with the following keys:

    - name: (required) a name for display purposes
    - file: (required) this is the name of the 3d file that
    lives in webapp/public
    - position: (required) this is the position of the part relative to the
    part above it, in mm
    - fixed: (optional) default: false; this part does not move
    - rotationAxis: (optional) default: "x";  this is the axis of rotation
    - rotationOffset: (optional) default: 0; this is the center offset of the
    rotation axis in mm
    - initialRotation: (optional) default: 0; this is the initial rotation in degrees
    - minAngle: (optional) this is the minimum angle that the part can be rotated
    - maxAngle: (optional) this is the maximum angle that the part can be rotated

"""

import json

# Load the JSON file
with open("src/webapp/public/arm-configs/4dof-no-effector.json", "r") as file:
    data = json.load(file)

# Extract the arm_parts from the JSON data
arm_parts = data["arm_parts"]
movable_part_names = [
    part["name"] for part in arm_parts if not part.get("fixed", False)
]
