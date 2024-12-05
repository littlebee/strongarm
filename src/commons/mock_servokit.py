# Mock class for ServoKit to allow testing without the actual hardware
class ServoMock:
    def __init__(self, channel=None):
        self._angle = 0

    @property
    def angle(self):
        return self._angle

    @angle.setter
    def angle(self, value):
        # log.info(f"mock_servokit: angle setter called: {value}")
        self._angle = value

    # def set_pulse_width_range(self, min_pulse, max_pulse):
    #     pass

    # def actuation_range(self, range):
    #     pass


class ServoKit:
    def __init__(self, channels):
        self.servo = [ServoMock(i) for i in range(channels)]
