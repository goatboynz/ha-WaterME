# WaterME Documentation

## Core Concepts

### Irrigation Phases
WaterME follows the standard crop steering methodology:
- **P1 (Maintenance)**: High-frequency shots starting ~1 hour after lights on. Designed to saturate the medium to field capacity.
- **P2 (Dryback)**: Lower frequency maintenance shots throughout the day.
- **P3 (Night)**: No irrigation (usually) to allow for the overnight dry-back.

### Hardware Interlocks
The system uses a specific sequence to protect your plumbing:
1. **Pump Starts**: The main pressure pump is activated.
2. **Valve Delay**: Wait a few milliseconds (default 100ms) for pressure to build.
3. **Valve Opens**: The specific zone solenoid opens.
4. **Irrigation**: The valve stays open for the duration of the shot (Minutes + Seconds).
5. **Valve Closes**: The solenoid closes first.
6. **Drain Down**: Wait for the delay period again.
7. **Pump Stops**: The pump turns off.

## Configuration Guide

### 1. Room Setup
- **Lights ON Entity**: A binary sensor or light entity that tells WaterME when the lights are on. This resets the "Shots Today" counter and starts the P1 countdown.

### 2. Zone Setup
- **Pump Entity**: (Required) The switch controlling your main water pump.
- **Valve Entity**: (Optional) The solenoid valve for this specific zone. If left blank, only the pump is toggled.
- **Valve Delay**: Time in milliseconds between pump and valve actions.
- **P1/P2 Shots**: Number of shots to take during each phase.
- **Shot Duration**: How long the water flows (Minutes:Seconds).

## Safety Features
- **Global Kill Switch**: Located at the top of the UI. Activating this immediately kills all running pumps and valves and prevents new ones from starting.
- **Connection Watchdog**: If the add-on loses connection to the Home Assistant Supervisor for more than 60 seconds, it will automatically shut off all active irrigation.
