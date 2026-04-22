import math
import random
import time
from dataclasses import dataclass, asdict

@dataclass
class Telemetry:
    uav_id: str
    ts: float
    altitude_m: float
    speed_mps: float
    battery_pct: float
    x: float
    y: float
    heading_deg: float
    status: str

class TelemetrySimulator:
    """
    Synthetic UAV telemetry generator (MVP)
    - Smooth position path (circle)
    - Altitude oscillation + small noise
    - Battery drain over time
    - Speed varies slightly
    """
    def __init__(self, uav_id: str = "UAV-01"):
        self.uav_id = uav_id
        self.start_time = time.time()
        self.last_ts = self.start_time
        self.battery = 100.0

        self.base_alt = 120.0
        self.base_speed = 10.0
        self.radius = 30.0

    def step(self) -> Telemetry:
        now = time.time()
        t = now - self.start_time
        dt = max(0.001, now - self.last_ts)
        self.last_ts = now

        # Battery drain (~0.02% per second)
        self.battery = max(0.0, self.battery - 0.02 * dt)

        altitude = self.base_alt + 10.0 * math.sin(t / 8.0) + random.uniform(-0.3, 0.3)
        speed = self.base_speed + 1.5 * math.sin(t / 5.0) + random.uniform(-0.2, 0.2)
        speed = max(0.0, speed)

        # Circular path
        x = self.radius * math.cos(t / 6.0)
        y = self.radius * math.sin(t / 6.0)

        # heading from x/y (approx)
        heading = (math.degrees(math.atan2(y, x)) + 360.0) % 360.0
        status = "OK" if self.battery > 15 else "LOW_BATTERY"

        return Telemetry(
            uav_id=self.uav_id,
            ts=now,
            altitude_m=round(altitude, 2),
            speed_mps=round(speed, 2),
            battery_pct=round(self.battery, 1),
            x=round(x, 2),
            y=round(y, 2),
            heading_deg=round(heading, 1),
            status=status,
        )

    @staticmethod
    def to_dict(t: Telemetry) -> dict:
        return asdict(t)