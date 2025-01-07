# Description: This file contains utility functions for arm configuration


def get_movable_parts(hub_state):
    """Get the movable parts of the arm configuration"""
    arm_parts = hub_state.state.get("arm_config", {}).get("arm_parts", [])
    return [part for part in arm_parts if not part.get("fixed")]
