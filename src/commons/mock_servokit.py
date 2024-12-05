# Mock class for ServoKit to allow testing without the actual hardware
class ServoMock:
    def __init__(self):
        self.angle = 0

    # def set_pulse_width_range(self, min_pulse, max_pulse):
    #     pass

    # def actuation_range(self, range):
    #     pass


class ServoKit:
    def __init__(self, channels):
        self.servo = [ServoMock() for _ in range(channels)]
