#!/usr/bin/env python3

import os
import sys
import time
import threading
import traceback

import commons.log as log

# TODO - I worry that this will frustrate the experience of running
#  the system on a Raspberry Pi that has not had the adafruit_servokit
#  library installed.  It will silently just not work.
try:
    from adafruit_servokit import ServoKit  # type: ignore
except:
    log.error(
        "Failed to import adafruit_servokit.  Is it installed?  Running with mock_servokit"
    )
    from commons.mock_servokit import ServoKit

# env var to turn on console debug output
DEBUG_MOTORS = os.getenv("DEBUG_MOTORS") or False
# it takes about 3 seconds for the servo to move 180deg
SECONDS_PER_DEGREE = 3 / 180
# how many deg to turn per step (abs)
STEP_DEGREES = 1
# how long to wait between steps (default; use step_delay setter to change at run time)
DEFAULT_STEP_DELAY = 0.0001


servo_kit = ServoKit(channels=16)


def limit_angle(angle, min_angle, max_angle):
    limited_angle = angle
    if angle < min_angle:
        limited_angle = min_angle
    elif angle > max_angle:
        limited_angle = max_angle

    return limited_angle


# The servo motors & gearing for shelly-bot's neck ended up
# being way too fast and jerky.  This is a hacky attempt
# to slow it down to about 180deg in 3 seconds versus 1 sec


class Servo:
    def __init__(self, motor_channel, min_angle=0, max_angle=180):
        self.thread = None  # background thread that steps motor to destination
        self.pause_event = threading.Event()
        self.stopped_event = threading.Event()
        self.force_stop = False
        self._step_delay = DEFAULT_STEP_DELAY

        self.motor_channel = motor_channel
        self.min_angle = min_angle
        self.max_angle = max_angle
        self.destination_angle = min_angle + ((max_angle - min_angle) / 2)
        self.thread = threading.Thread(target=self._thread)
        self.thread.start()

    @property
    def current_angle(self):
        try:
            return servo_kit.servo[self.motor_channel].angle
        except OSError as error:
            # Was getting intermittent exception from adafruit servo kit
            # originating from i2c_bus.read_i2c_block_data()
            log.error(f"OSError caught in current_angle: {error}\n")
            # just pretend we are at the destination (stop moving) and carry on
            return self.destination_angle

    @property
    def step_delay(self):
        return self._step_delay

    @step_delay.setter
    def step_delay(self, value):
        self._step_delay = value

    def move_to(self, angle):
        self.destination_angle = limit_angle(angle, self.min_angle, self.max_angle)
        if DEBUG_MOTORS:
            log.info(
                f"move_to {self.motor_channel}, {self.current_angle}, {angle}, {self.destination_angle}, {self.min_angle}, {self.max_angle}"
            )

        self.stopped_event.clear()
        self.resume()

    def pause(self):
        self.pause_event.clear()

    def resume(self):
        self.pause_event.set()

    def stop_thread(self):
        self.stopped_event.set()
        self.force_stop = True
        # thread could be waiting on pause_event, resume to quit
        self.resume()

    def wait_for_motor_stopped(self):
        if DEBUG_MOTORS:
            log.info(f"waiting on stopped event on channel {self.motor_channel}")
        self.stopped_event.wait()
        if DEBUG_MOTORS:
            log.info(f"after wait: {self.motor_channel} {self.stopped_event.is_set()}")

    def _thread(self):
        log.info(f"Starting servo movement thread. {self.current_angle}")
        self.started_at = time.time()

        if DEBUG_MOTORS:
            log.info(
                f"initializing motor {self.motor_channel} to {self.destination_angle}deg"
            )
        servo_kit.servo[self.motor_channel].angle = self.destination_angle
        time.sleep(0.5)
        # need to establish initial position of motor

        # start running
        self.pause_event.set()
        while not self.force_stop:
            self.pause_event.wait()
            direction = 1
            if self.current_angle > self.destination_angle:
                direction = -1

            if DEBUG_MOTORS:
                log.info(
                    f"servo.py thread loop: direction={direction} {self.current_angle} {self.destination_angle} "
                )
            if not self._step_move(direction):
                if DEBUG_MOTORS:
                    log.info(f"setting stopped event on channel {self.motor_channel}")
                self.stopped_event.set()
                self.pause_event.clear()

        log.info("servo thread exit")

    def _step_move(self, direction):
        """direction = -1 = left; 1 = right.  returns true if did move"""
        try:
            would_overshoot = self._step_would_overshoot_dest(direction)
            if DEBUG_MOTORS:
                log.info(
                    f"stepping motor {self.motor_channel}, {direction}, {self.current_angle}, {self.destination_angle}, {would_overshoot}"
                )

            if self.current_angle == self.destination_angle or would_overshoot:
                return False

            new_angle = self.current_angle + (STEP_DEGREES * direction)

            servo_kit.servo[self.motor_channel].angle = new_angle
            time.sleep(self._step_delay)

            return True
        except Exception:
            log.error(f"Exception caught in _step_move: {traceback.format_exc()}")
            return False

    def _step_would_overshoot_dest(self, direction):
        current_angle = self.current_angle
        new_angle = current_angle + STEP_DEGREES * direction
        return (direction == -1 and new_angle < self.destination_angle) or (
            direction == 1 and new_angle > self.destination_angle
        )


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("usage:  servo.py <channel> (<angle>)")
        exit(1)

    motor_channel = int(sys.argv[1])
    log.info("Ctrl+c to quit")
    test_angles = [
        0,
        180,
    ]
    log.info(f"initializing servo class on motor channel {motor_channel}")
    servo = Servo(motor_channel)

    try:
        if len(sys.argv) > 2:
            new_angle = int(sys.argv[2])
            log.info(f"channel {motor_channel} to {new_angle}deg")
            servo.move_to(new_angle)
            log.info("waiting for motor stopped event")
            servo.wait_for_motor_stopped()
            log.info("got stopped event.")
            servo.stop_thread()
            exit()

        else:
            while True:
                for angle in test_angles:
                    log.info(f"channel {motor_channel} to {angle}deg")
                    servo.move_to(angle)
                    log.info("waiting for motor stopped event")
                    servo.wait_for_motor_stopped()
                    log.info("got stopped event.")
                    # log.info("got stopped event. waiting...")
                    # time.sleep(3)

    except KeyboardInterrupt:
        servo.stop_thread()
