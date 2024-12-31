import xml.etree.ElementTree as ET


def indent_xml(elem, level=0):
    """Helper function to indent XML elements"""
    i = "\n" + level * "    "
    if len(elem):
        if not elem.text or not elem.text.strip():
            elem.text = i + "    "
        if not elem.tail or not elem.tail.strip():
            elem.tail = i
        for subelem in elem:
            indent_xml(subelem, level + 1)
        if not elem.tail or not elem.tail.strip():
            elem.tail = i
    else:
        if level and (not elem.tail or not elem.tail.strip()):
            elem.tail = i


def create_urdf_from_config(arm_config):
    # Create root element
    robot = ET.Element("robot")
    robot.set("name", "robot_arm")

    # Create all links first
    for part in arm_config["arm_parts"]:
        link = ET.SubElement(robot, "link")
        link.set("name", part["name"])

        # Visual element
        visual = ET.SubElement(link, "visual")
        geometry = ET.SubElement(visual, "geometry")
        mesh = ET.SubElement(geometry, "mesh")
        mesh.set("filename", part["file"])

        # Origin for visual
        origin = ET.SubElement(visual, "origin")
        pos = part["position"]
        origin.set(
            "xyz", f"{pos['x']/1000} {pos['y']/1000} {pos['z']/1000}"
        )  # Convert to meters

        # Handle initial rotation if present
        if "initialRotation" in part:
            rot = part["initialRotation"]
            origin.set(
                "rpy",
                f"{rot['x']*3.14159/180} {rot['y']*3.14159/180} {rot['z']*3.14159/180}",
            )

    # Create joints between consecutive parts
    for i in range(len(arm_config["arm_parts"]) - 1):
        current_part = arm_config["arm_parts"][i]
        next_part = arm_config["arm_parts"][i + 1]

        # Skip if current part is marked as fixed
        if current_part.get("fixed", False):
            continue

        joint = ET.SubElement(robot, "joint")
        joint.set("name", f'joint_{current_part["name"]}_{next_part["name"]}')

        # Set joint type
        if next_part.get("fixed", False):
            joint.set("type", "fixed")
        else:
            joint.set("type", "revolute")

        # Parent and child links
        parent = ET.SubElement(joint, "parent")
        parent.set("link", current_part["name"])
        child = ET.SubElement(joint, "child")
        child.set("link", next_part["name"])

        # Joint origin
        origin = ET.SubElement(joint, "origin")
        pos = next_part["position"]
        origin.set("xyz", f"{pos['x']/1000} {pos['y']/1000} {pos['z']/1000}")

        if "rotationOffset" in next_part:
            rot = next_part["rotationOffset"]
            origin.set(
                "rpy",
                f"{rot['x']*3.14159/180} {rot['y']*3.14159/180} {rot['z']*3.14159/180}",
            )

        # Add axis if rotational joint
        if not next_part.get("fixed", False):
            axis = ET.SubElement(joint, "axis")
            rotation_axis = next_part.get("rotationAxis", "z")  # Default to z-axis
            axis.set(
                "xyz",
                (
                    "0 0 1"
                    if rotation_axis == "z"
                    else "0 1 0" if rotation_axis == "y" else "1 0 0"
                ),
            )

            # Add limits if specified
            if "minAngle" in next_part:
                limit = ET.SubElement(joint, "limit")
                limit.set("lower", str(next_part["minAngle"] * 3.14159 / 180))
                limit.set("upper", str(3.14159))
                limit.set("effort", "100")
                limit.set("velocity", "1")

    # Format XML tree
    indent_xml(robot)
    xmlstr = ET.tostring(robot, encoding="unicode")

    return xmlstr


# Example arm_config JSON
arm_config = {
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

# Generate and save the URDF
if __name__ == "__main__":
    urdf_str = create_urdf_from_config(arm_config)
    with open("robot_arm.urdf", "w") as f:
        f.write(urdf_str)
