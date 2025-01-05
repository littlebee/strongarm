#!/usr/bin/env python
import json
import os
from pathlib import Path

# Define the input and output paths
input_files = [
    "./src/webapp/public/arm-configs/4dof-no-effector.json",
    "./src/webapp/public/arm-configs/4dof-iphone.json",
]
output_dir = "./src/webapp/public/arm-parts"

# Create the output directory if it doesn't exist
os.makedirs(output_dir, exist_ok=True)

# Read the input JSON file
for input_file in input_files:
    with open(input_file, "r") as f:
        data = json.load(f)

    # Extract the arm_parts array
    arm_parts = data.get("arm_parts", [])

    output_files = []
    # Write each object in the arm_parts array to a separate JSON file
    for i, part in enumerate(arm_parts):
        part_file_name = part["file"]
        # use the base name without extenstion of the file as the output file name
        output_file = os.path.join(output_dir, f"{Path(part_file_name).stem}.json")
        output_files.append(output_file)

        with open(output_file, "w") as f:
            json.dump(part, f, indent=4)

    data["arm_parts"] = output_files
    with open(input_file, "w") as f:
        json.dump(data, f, indent=4)

    print(f"Successfully created {len(arm_parts)} JSON files in {output_dir}")
