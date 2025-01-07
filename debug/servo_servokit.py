#!/usr/bin/env python3

import sys

from adafruit_servokit import ServoKit

if len(sys.argv) < 3:
    print("usage:  test_servo <channel> <angle>")
    exit(1)

kit = ServoKit(channels=16)


kit.servo[int(sys.argv[1])].angle = int(sys.argv[2])
