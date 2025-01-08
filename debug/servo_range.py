#!/usr/bin/env python3

# modified by bee from https://github.com/adafruit/Adafruit_CircuitPython_Motor/blob/main/examples/motor_pca9685_servo_sweep.py

# SPDX-FileCopyrightText: 2021 ladyada for Adafruit Industries
# SPDX-License-Identifier: MIT

import sys
import time

from board import SCL, SDA
import busio

# Import the PCA9685 module. Available in the bundle and here:
#   https://github.com/adafruit/Adafruit_CircuitPython_PCA9685
from adafruit_pca9685 import PCA9685
from adafruit_motor import servo


# if less than 2 arguments are provided, print the usage and exit
if len(sys.argv) < 2:
    print("usage:  servo.py <channel> (<min_pulse> <max_pulse>))")
    exit(1)

(motor_channel, min_pulse, max_pulse) = (
    None if i >= len(sys.argv) else int(sys.argv[i]) for i in range(1, 4)
)

#  bee: these are the defaults list in the comment below and I confirmed that
#     adafruit servo_kit uses these defaults
min_pulse = min_pulse if min_pulse else 750
max_pulse = max_pulse if max_pulse else 2250


i2c = busio.I2C(SCL, SDA)

# Create a simple PCA9685 class instance.
pca = PCA9685(i2c)
# You can optionally provide a finer tuned reference clock speed to improve the accuracy of the
# timing pulses. This calibration will be specific to each board and its environment. See the
# calibration.py example in the PCA9685 driver.
# pca = PCA9685(i2c, reference_clock_speed=25630710)
pca.frequency = 50

# To get the full range of the servo you will likely need to adjust the min_pulse and max_pulse to
# match the stall points of the servo.
# This is an example for the Sub-micro servo: https://www.adafruit.com/product/2201
# servo7 = servo.Servo(pca.channels[7], min_pulse=580, max_pulse=2350)
# This is an example for the Micro Servo - High Powered, High Torque Metal Gear:
#   https://www.adafruit.com/product/2307
# servo7 = servo.Servo(pca.channels[7], min_pulse=500, max_pulse=2600)
# This is an example for the Standard servo - TowerPro SG-5010 - 5010:
#   https://www.adafruit.com/product/155
# servo7 = servo.Servo(pca.channels[7], min_pulse=400, max_pulse=2400)
# This is an example for the Analog Feedback Servo: https://www.adafruit.com/product/1404
# servo7 = servo.Servo(pca.channels[7], min_pulse=600, max_pulse=2500)
# This is an example for the Micro servo - TowerPro SG-92R: https://www.adafruit.com/product/169
# servo7 = servo.Servo(pca.channels[7], min_pulse=500, max_pulse=2400)
# The pulse range is 750 - 2250 by default. This range typically gives 135 degrees of
# range, but the default is to use 180 degrees. You can specify the expected range if you wish:
# servo7 = servo.Servo(pca.channels[7], actuation_range=135)

print(f"initializing servo {motor_channel} to {min_pulse} - {max_pulse} pulse widths")
servo = servo.Servo(
    pca.channels[motor_channel], min_pulse=min_pulse, max_pulse=max_pulse
)

# !!!!  The code below fails with the following error when the angle > 180:
#   File "/home/pi/.local/lib/python3.7/site-packages/adafruit_motor/servo.py", line 129, in angle
#     raise ValueError("Angle out of range")

# print(f"Servo {motor_channel} sweeping using servo.angle")
# # We sleep in the loops to give the servo time to move into position.
# for i in range(max_angle):
#     servo.angle = i
#     time.sleep(0.03)
# for i in range(max_angle):
#     servo.angle = max_angle - i
#     time.sleep(0.03)

# You can also specify the movement fractionally.
print(f"Servo {motor_channel} sweeping using servo.fraction")
fraction = 0.0
while fraction < 1.0:
    servo.fraction = fraction
    fraction += 0.01
    time.sleep(0.1)

print("sleeping for 5 sec")
time.sleep(5)
print("sweeping to 0 full speed")
servo.fraction = 0
time.sleep(5)

pca.deinit()
