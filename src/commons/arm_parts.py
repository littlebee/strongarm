"""
see src/webapp/public/arm-configs/README.md for more information about arm_parts
structure

"""

import json

# Load the JSON file
with open("src/webapp/public/arm-configs/4dof-iphone.json", "r") as file:
    # with open("src/webapp/public/arm-configs/4dof-no-effector.json", "r") as file:
    data = json.load(file)

# Extract the arm_parts from the JSON data
arm_parts = data["arm_parts"]
movable_parts = [part for part in arm_parts if not part.get("fixed", False)]
