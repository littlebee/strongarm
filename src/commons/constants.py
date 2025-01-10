import os

print("Environment variables:")
for name, value in os.environ.items():
    print("{0}: {1}".format(name, value))


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

ARM_CONFIGS_DIR = env_string("ARM_CONFIGS_DIR", "./src/webapp_vite/public/arm-configs")
ARM_PARTS_DIR = env_string("ARM_PARTS_DIR", "./src/webapp_vite/public/arm-parts")

DEFAULT_MOTOR_RANGE = env_int("DEFAULT_MOTOR_RANGE", 270)
DEFAULT_MIN_ANGLE = env_int("DEFAULT_MIN_ANGLE", 0)
DEFAULT_MAX_ANGLE = DEFAULT_MOTOR_RANGE

# This is used to stub out the motor controller for testing and local (mac/windows) development
#   This is set to True in env vars on the raspberry pi by the default rc.local script
#
STRONGARM_ENV = env_string("STRONGARM_ENV", "development")
