import os


def env_string(name, default):
    env_val = os.getenv(name) or str(default)
    return env_val


def env_int(name, default):
    try:
        return int(env_string(name, default))
    except:
        return default


def env_float(name, default):
    try:
        return float(env_string(name, default))
    except:
        return default


def env_bool(name, default):
    value = env_string(name, default).lower()
    if value in ("true", "1"):
        return True
    else:
        return False


SERVO_CHANNELS = env_int("SERVO_CHANNELS", 6)


# Connect to central hub websocket
HUB_PORT = env_int("HUB_PORT", 5800)
HUB_URI = f"ws://127.0.0.1:{HUB_PORT}/ws"

LOG_ALL_MESSAGES = env_bool("LOG_ALL_MESSAGES", False)
