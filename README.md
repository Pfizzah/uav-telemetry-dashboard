# UAV Telemetry Simulator + Live Dashboard 

A lightweight UAV telemetry simulation system that generates real-time(synthetic) flight data and exposes it via Flask API, with a live dashboard for visualising key state variables.

## Demo

### Live Dashboard Screenshot

![UAV Dashboard](docs/dashboard.png)

## Features
- Synthetic telemetry generation (altitude, speed, battery, position, heading)
- REST API:
    - `GET /api/telemetry`
    - `POST /api/reset`
- Web dashboard:
    -Live stat cards
    - Altitude chart  (Chart.js)
    - Event log

## Tech
- Python + Flask
- HTML + JavaScript
- Chart.js

## Run Locally
```bash
cd backend
python -m venv .venv
source .venv/bin/activate # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python app.py