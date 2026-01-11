# WaterME: Technical Protocol Documentation

## 🧬 Core Methodology

WaterME implements advanced **Crop Steering** logic, a horticultural practice of managing environmental factors to influence plant growth patterns. 

### 1. Irrigation Phases
The system divides the "Lights On" period into distinct hydraulic phases:

| Phase | Window | Purpose |
| :--- | :--- | :--- |
| **P1 (Build)** | +60m → +165m | Saturate substrate to "Field Capacity" to initiate metabolic activity. |
| **GAP** | +165m → +225m | 60-minute pause to observe stack/runoff. |
| **P2 (Dryback)** | +225m → OFF | Maintain optimal moisture levels while allowing oxygen back into the root zone. |

### 2. Hardware Synchronization (The Interlock)
To protect solenoids and pumps from water hammer and dry-run damage, WaterME uses a calculated sequence:

1.  **Pressure Build**: Pump activates first.
2.  **Valve Delay**: Wait (X)ms (default 100ms) for pressure to stabilize.
3.  **Active Injection**: Solenoid opens for the designated duration (total seconds calculated from M+S).
4.  **Hardware Release**: Solenoid closes first, then pump stops after the release delay.

---

## 🛠️ Configuration Syntax

### Room Management
Rooms are the top-level entity. They track the "Photoperiod" (Light Cycle).
- **Control Source**: Can be a "Fixed Clock" (e.g., 06:00 → 18:00) or a "Linked Sensor" (e.g., `binary_sensor.grow_room_lights`).
- **Emergency Stop**: Each room can be independently locked/enabled.

### Zone Management (Hydraulic Segments)
Each room contains 1 or more zones.
- **Hardware Links**: You must link each zone to a `switch` (Pump) and optionally another `switch` (Valve).
- **Telemetry Links**: Link a `sensor` for Moisture (VWC) and EC to enable dashboard tracking.
- **Dripper Rates**: Input your LPH (Liters Per Hour) and dripper count per plant for accurate liter-tracking on the dashboard.

---

## 🔒 Safety & Redundancy

*   **Offline Mode**: All schedules are stored locally. If the frontend is closed, irrigation continues.
*   **Watchdog Interlock**: If the system loses connection to the Home Assistant API for >60s, it automatically enters "Failsafe Mode" and shuts off all active switches.
*   **Protocol Conflict Resolution**: Zones are staggered by (X) minutes to prevent concurrent pump draws unless specifically configured otherwise.
