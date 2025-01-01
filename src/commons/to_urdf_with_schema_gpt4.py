import xml.etree.ElementTree as ET

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
            "position": {"x": 0, "y": 0, "z": 0},
        },
    ],
}


def create_urdf_element(arm_part):
    link = ET.Element("link", name=arm_part["name"])
    visual = ET.SubElement(link, "visual")
    geometry = ET.SubElement(visual, "geometry")
    mesh = ET.SubElement(geometry, "mesh", filename=arm_part["file"])  # noqa

    origin = ET.SubElement(visual, "origin")
    position = arm_part.get("position", {})
    rotation = arm_part.get("initialRotation", {})
    origin.set(
        "xyz", f"{position.get('x', 0)} {position.get('y', 0)} {position.get('z', 0)}"
    )
    origin.set(
        "rpy", f"{rotation.get('x', 0)} {rotation.get('y', 0)} {rotation.get('z', 0)}"
    )

    return link


def convert_to_urdf(arm_config):
    robot = ET.Element("robot", name="arm")
    for part in arm_config["arm_parts"]:
        link = create_urdf_element(part)
        robot.append(link)

    tree = ET.ElementTree(robot)
    tree.write("arm.urdf", xml_declaration=True, encoding="utf-8")


convert_to_urdf(arm_config)
