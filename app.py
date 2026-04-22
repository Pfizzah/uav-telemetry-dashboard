from flask import Flask, jsonify, request, send_from_directory
from simulator import TelemetrySimulator
import os

app = Flask(__name__)

# Initialize simulator
sim = TelemetrySimulator("UAV-01")


# ----------------------------
# API ROUTES
# ----------------------------

@app.get("/api/telemetry")
def api_telemetry():
    """
    Returns one telemetry sample as JSON.
    Optional query param: uav_id (future multi-UAV extension)
    """
    _uav_id = request.args.get("uav_id", "UAV-01")
    t = sim.step()
    return jsonify(TelemetrySimulator.to_dict(t))


@app.post("/api/reset")
def api_reset():
    """
    Resets the simulator state.
    """
    global sim
    sim = TelemetrySimulator("UAV-01")
    return jsonify({"ok": True})


# ----------------------------
# FRONTEND ROUTES
# ----------------------------

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), "..", "frontend")


@app.get("/")
def index():
    """
    Serve main dashboard page
    """
    return send_from_directory(FRONTEND_DIR, "index.html")


@app.get("/<path:path>")
def static_files(path):
    """
    Serve JS/CSS assets
    """
    return send_from_directory(FRONTEND_DIR, path)


# ----------------------------
# RUN SERVER
# ----------------------------

if __name__ == "__main__":
    app.run(debug=True)