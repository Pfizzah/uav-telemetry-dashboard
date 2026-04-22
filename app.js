// ---- DOM ----
const connEl = document.getElementById("conn");
const rateEl = document.getElementById("rate");
const uavEl = document.getElementById("uav");
const resetEl = document.getElementById("resetBtn");

const batteryEl = document.getElementById("battery");
const statusEl = document.getElementById("status");
const altEl = document.getElementById("alt");
const speedEl = document.getElementById("speed");
const posEl = document.getElementById("pos");
const headingEl = document.getElementById("heading");
const updatedEl = document.getElementById("updated");
const logEl = document.getElementById("log");

let timer = null;

// ---- Chart.js ----
const ctx = document.getElementById("altChart").getContext("2d");

const altData = {
  labels: [],
  datasets: [
    {
      label: "Altitude (m)",
      data: [],
      tension: 0.35,
      pointRadius: 2,
      pointHoverRadius: 4
    }
  ]
};

const altChart = new Chart(ctx, {
  type: "line",
  data: altData,
  options: {
    responsive: true,
    animation: false,
    plugins: {
      legend: {
        labels: {
          color: "#eaf0ff"
        }
      }
    },
    scales: {
      x: {
        display: false,
        ticks: { color: "rgba(234,240,255,.55)" },
        grid: { color: "rgba(255,255,255,.07)" }
      },
      y: {
        beginAtZero: false,
        ticks: { color: "rgba(234,240,255,.55)" },
        grid: { color: "rgba(255,255,255,.07)" }
      }
    }
  }
});

// ---- Helpers ----
function log(msg) {
  const ts = new Date().toLocaleTimeString();
  logEl.textContent = `[${ts}] ${msg}\n` + logEl.textContent;
}

// Converts dropdown value to milliseconds.
// Supports:
// - value="1000" (ms)
// - value="1" meaning 1 Hz (converted to 1000ms)
function rateToMs(value) {
  const n = Number(value);
  if (Number.isFinite(n) && n >= 50) return n;            // already ms
  if (Number.isFinite(n) && n > 0) return Math.round(1000 / n); // Hz -> ms
  return 1000;
}

function setConnected(isConnected) {
  if (isConnected) {
    connEl.textContent = "● Connected";
    connEl.classList.add("connected");   // used by your CSS to show green dot
  } else {
    connEl.textContent = "● Disconnected";
    connEl.classList.remove("connected");
  }
}

// ---- Core ----
async function fetchTelemetry() {
  const uavId = uavEl.value;

  try {
    const res = await fetch(`/api/telemetry?uav_id=${encodeURIComponent(uavId)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const t = await res.json();

    setConnected(true);

    // Update stat cards (match your backend JSON keys)
    batteryEl.textContent = `${t.battery_pct}%`;
    statusEl.textContent = t.status;
    altEl.textContent = `${t.altitude_m} m`;
    speedEl.textContent = `${t.speed_mps} m/s`;
    posEl.textContent = `x=${t.x}, y=${t.y}`;
    headingEl.textContent = `${t.heading_deg}°`;

    // Your backend ts is seconds; convert to ms
    updatedEl.textContent = new Date(t.ts * 1000).toLocaleTimeString();

    // Chart: keep last ~60 samples
    altData.labels.push("");
    altData.datasets[0].data.push(t.altitude_m);

    if (altData.labels.length > 60) {
      altData.labels.shift();
      altData.datasets[0].data.shift();
    }

    altChart.update();
    // log("Telemetry update received"); // optional (can spam)
  } catch (e) {
    setConnected(false);
    log(`Error fetching telemetry: ${e.message}`);
  }
}

function startPolling() {
  if (timer) clearInterval(timer);

  const intervalMs = rateToMs(rateEl.value);
  timer = setInterval(fetchTelemetry, intervalMs);

  fetchTelemetry(); // immediate
}

// ---- Events ----
resetEl.addEventListener("click", async () => {
  try {
    await fetch("/api/reset", { method: "POST" });

    // Clear chart
    altData.labels.length = 0;
    altData.datasets[0].data.length = 0;
    altChart.update();

    log("Simulator reset");
  } catch (e) {
    log(`Reset failed: ${e.message}`);
  }
});

rateEl.addEventListener("change", startPolling);
uavEl.addEventListener("change", fetchTelemetry);

// ---- Start ----
startPolling();