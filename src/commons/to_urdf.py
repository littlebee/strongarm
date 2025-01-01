#!/usr/bin/env python3

import xml.etree.ElementTree as ET
from typing import Dict, Any


def create_urdf_from_config(arm_config: Dict[str, Any]) -> ET.Element:
    # Create root robot element
    robot = ET.Element("robot")
    robot.set("name", "strongarm")

    prev_link_name = None

    for part in arm_config["arm_parts"]:
        # Create link element
        link = ET.SubElement(robot, "link")
        link.set("name", part["name"])

        # Add visual element
        visual = ET.SubElement(link, "visual")

        # Add geometry with mesh
        geometry = ET.SubElement(visual, "geometry")
        mesh = ET.SubElement(geometry, "mesh")
        mesh.set("filename", f"package://strongarm/meshes/{part['file']}")

        # Add origin transform
        origin = ET.SubElement(visual, "origin")
        pos = part["position"]
        origin.set("xyz", f"{pos['x']/1000} {pos['y']/1000} {pos['z']/1000}")

        if "initialRotation" in part:
            rot = part["initialRotation"]
            origin.set(
                "rpy",
                f"{rot['x']*3.14159/180} {rot['y']*3.14159/180} {rot['z']*3.14159/180}",
            )

        # Create joint connecting to previous link
        if prev_link_name:
            joint = ET.SubElement(robot, "joint")
            joint.set("name", f"{prev_link_name}_to_{part['name']}")

            if part.get("fixed", False):
                joint.set("type", "fixed")
            else:
                joint.set("type", "revolute")

                # Add joint limits
                limit = ET.SubElement(joint, "limit")
                limit.set("lower", str(part.get("minAngle", -180) * 3.14159 / 180))
                limit.set("upper", str(part.get("maxAngle", 180) * 3.14159 / 180))
                limit.set("effort", "100")
                limit.set("velocity", "1")

            # Set joint parent and child
            parent = ET.SubElement(joint, "parent")
            parent.set("link", prev_link_name)

            child = ET.SubElement(joint, "child")
            child.set("link", part["name"])

            # Add joint origin transform
            j_origin = ET.SubElement(joint, "origin")
            j_origin.set("xyz", f"{pos['x']/1000} {pos['y']/1000} {pos['z']/1000}")

            if "rotationOffset" in part:
                rot = part["rotationOffset"]
                j_origin.set(
                    "rpy",
                    f"{rot['x']*3.14159/180} {rot['y']*3.14159/180} {rot['z']*3.14159/180}",
                )

            # Add rotation axis
            if not part.get("fixed", False):
                axis = ET.SubElement(joint, "axis")
                axis.set("xyz", f"0 0 {-1 if part.get('invertRotation', False) else 1}")

        prev_link_name = part["name"]

    return robot


def save_urdf(arm_config: Dict[str, Any], filename: str):
    robot = create_urdf_from_config(arm_config)
    tree = ET.ElementTree(robot)
    ET.indent(tree, space="  ")
    tree.write(filename, encoding="utf-8", xml_declaration=True)


if __name__ == "__main__":
    mock_arm_config = {
        "description": "4dof arm with iPhone pan and tilt holder",
        "arm_parts": [
            {
                "name": "base",
                "file": "turntable-bottom.stl",
                "position": {"x": 0, "y": 0, "z": 0},
                "initialRotation": {"x": -90, "y": 0, "z": 0},
                "fixed": True,
            },
            {
                "name": "turntable",
                "file": "turntable-top.stl",
                "position": {"x": 0, "y": -27, "z": 50},
                "invertRotation": True,
                "rotationAxis": "z",
            },
            {
                "name": "arm-segment-1",
                "file": "140mm-arm.stl",
                "position": {"x": 0, "y": 0, "z": 150},
                "rotationOffset": {"x": 0, "y": 0, "z": 120},
            },
            {
                "name": "arm-segment-2",
                "file": "80mm-arm.stl",
                "position": {"x": 0, "y": 0, "z": 360},
                "rotationOffset": {"x": 0, "y": 0, "z": 90},
            },
            {
                "name": "arm-segment-3",
                "file": "forearm.stl",
                "position": {"x": 0, "y": 0, "z": 270},
                "initialRotation": {"x": 45, "y": 0, "z": 0},
                "rotationOffset": {"x": 0, "y": 0, "z": 50},
                "minAngle": 13,
            },
            {
                "name": "pan-tilt-base",
                "file": "pan-tilt-base.stl",
                "fixed": True,
                "position": {"x": 0, "y": 0, "z": 130},
                "initialRotation": {"x": 0, "y": 0, "z": 90},
            },
            {
                "name": "pan-tilt-rotator",
                "file": "pan-tilt-rotator.stl",
                "position": {"x": 2, "y": 5, "z": 39},
                "rotationOffset": {"x": 0, "y": 0, "z": 35},
            },
            {
                "name": "iphone-holder",
                "file": "iphone-holder.stl",
                "position": {"x": 0, "y": -20, "z": 120},
                "initialRotation": {"x": 0, "y": 0, "z": 90},
                "invertRotation": True,
                "rotationAxis": "z",
                "rotationOffset": {"x": 0, "y": -20, "z": 0},
            },
        ],
        "filename": "4dof-iphone.json",
        "updated_at": 1735313660.685129,
    }
    # Generate URDF file
    save_urdf(mock_arm_config, "robot_arm.urdf")
