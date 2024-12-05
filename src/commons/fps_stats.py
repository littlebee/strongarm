"""
FpsStats - A class to track overall and floating frames per seconds
"""
import time

# last n seconds to use for fps calc
FPS_WINDOW = 60


class FpsStats(object):
    def __init__(self):
        self.start()

    # can call start after init, or pause and start for more accuracy
    def start(self):
        self.started_at = time.time()
        self.total_frames = 0
        self.floating_frames_count = 0
        self.floating_started_at = time.time()
        self.last_floating_fps = 0

    def increment(self):
        self.total_frames += 1
        self.floating_frames_count += 1

        fps_time = time.time() - self.floating_started_at
        if fps_time > FPS_WINDOW:
            self.last_floating_fps = self.floating_frames_count / fps_time
            self.floating_started_at = time.time()
            self.floating_frames_count = 0

    def stats(self):
        now = time.time()
        total_time = now - self.started_at
        return {
            "totalFramesRead": self.total_frames,
            "totalTime": total_time,
            "overallFps": self.total_frames / total_time,
            "fpsStartedAt": self.floating_started_at,
            "floatingFps": self.last_floating_fps,
        }
