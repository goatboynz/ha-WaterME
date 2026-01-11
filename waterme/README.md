# 💧 WaterME: Precision Irrigation Control

### _Professional-grade crop steering infrastructure for Home Assistant._

WaterME is a high-fidelity irrigation controller designed for the modern greenhouse. Utilizing the "Vaultify" fintech aesthetic, it provides a command-center experience for managing complex nutrient injection protocols (Athena/Pulse style).

![Supports aarch64 Architecture][aarch64-shield]
![Supports amd64 Architecture][amd64-shield]
![Supports armhf Architecture][armhf-shield]
![Supports armv7 Architecture][armv7-shield]
![Supports i386 Architecture][i386-shield]

---

## ⚡ Key Features

*   🏎️ **Fintech-Grade Dashboard**: Real-time telemetry monitoring with high-fidelity spline charts and trending analytics.
*   🌊 **Hydraulic Staggering**: Prevent drop in line pressure by automatically staggering zone execution based on smart-offsetting logic.
*   🧪 **P1/P2 Phase Control**: Dedicated protocols for "Build Phase" (saturation) and "Dryback" (maintenance) irrigation cycles.
*   🔒 **Mainframe Kill Switch**: Instant global hardware interlock for emergency stop scenarios.
*   📊 **VWC & EC Telemetry**: Deep integration with substrate sensors to track moisture and conductivity trends.
*   🕒 **Dynamic Photoperiod Sync**: Automatically adjusts irrigation schedules based on light-cycle binary sensors or a fixed clock.

## 🛠️ Infrastructure

WaterME is built as a local-first service, synchronizing with the Home Assistant API every 2 seconds to ensure precise timing and logging. All configuration is stored locally within the add-on's persistent storage.

---

## 🚀 Quick Start

1.  Sync your **Solenoids** and **Pumps** to Home Assistant.
2.  Install the **WaterME Add-on**.
3.  Open the Ingress UI and navigate to the **Command Room**.
4.  Initialize your first **Room Protocol**.
5.  Define your **Hydraulic Segments** (Zones) with specific P1/P2 shot volumes.
6.  Commit Protocols and monitor the **Overview Dashboard**.

[aarch64-shield]: https://img.shields.io/badge/aarch64-yes-orange.svg?style=for-the-badge
[amd64-shield]: https://img.shields.io/badge/amd64-yes-orange.svg?style=for-the-badge
[armhf-shield]: https://img.shields.io/badge/armhf-yes-orange.svg?style=for-the-badge
[armv7-shield]: https://img.shields.io/badge/armv7-yes-orange.svg?style=for-the-badge
[i386-shield]: https://img.shields.io/badge/i386-yes-orange.svg?style=for-the-badge
