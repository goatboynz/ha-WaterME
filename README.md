# WaterME - Precision Irrigation Controller

WaterME is a professional-grade Home Assistant add-on designed for high-precision horticultural irrigation, specifically optimized for **Athena-style Crop Steering** (P1/P2/P3 logic).

## Features
- **P1/P2 Logic**: Automated maintenance and dryback irrigation cycles.
- **Hardware Interlocks**: Smart sequencing of Pumps and Solenoid valves.
- **Micro-Timing**: Millisecond-accurate valve delays to prevent pressure spikes.
- **Ingress UI**: Modern React dashboard integrated directly into Home Assistant.
- **Safety First**: Global Kill Switch and automatic safety-stop on connection loss.

## Hardware Support
- **Relay Boards**: Any Home Assistant compatible relay (ESP32, Zigbee, Z-Wave).
- **Sensors**: Light sensors (lux or binary) used to time irrigation phases.

## Getting Started
1. Add this repository to your Home Assistant Add-on Store.
2. Install the **WaterME** add-on.
3. Use the **Config** tab to define your Rooms and Zones.
4. Use the **Entity Picker** to link your Home Assistant switches and sensors.
