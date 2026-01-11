# Changelog

## [0.1.8] - 2026-01-11
- **UI/UX Mega-Update**: Rebuilt the entire interface from the ground up inspired by modern fintech dashboards ("Vaultify" aesthetic).
- **Sidebar Navigation**: Implemented a persistent sidebar for clearer navigation and system status monitoring.
- **Fintech Summary Cards**: New high-fidelity cards for volume and moisture tracking with real-time trending indicators.
- **"Active Zones" Table**: Replaced zone cards with a professional table view for better data density and control accessibility.
- **Enhanced Charting**: Area charts now use splines, gradients, and custom tooltips for a premium look.
- **Outfit Typography**: Switched to 'Outfit' font family for a modern, sleek feel.
- **Refined Config Wizard**: Split-screen configuration layout for rooms and hydraulic segments.

## [0.1.7] - 2026-01-11
- **UI/UX Overhaul**: Redesigned Dashboard and Config Wizard for a much cleaner, professional "Pro Command" look.
- **Fixed Layout Issues**: Resolved squashed inputs and overlapping labels in the configuration wizard.
- **Improved Entity Picker**: Enhanced robustness and styling of the HA entity selection component.
- **Enhanced Telemetry Display**: Added a dedicated Event Stream sidebar and improved real-time sensor visualization.
- **Backend Logging**: Added deep logging for HA API communication to assist in debugging connection issues.
- **Optimization**: Better 12-column grid layout for higher density displays.

## [0.1.5] - 2026-01-11
- **New Feature**: Fixed Light Schedules. Set explicit ON/OFF times for room photoperiods.
- **New Feature**: Dripper Telemetry. Input dripper rates and counts to track total ML fed and ML per plant.
- **New Feature**: Substrate Monitoring. Integrate Soil Moisture (RH) and EC sensors per zone.
- **UI Redesign**: High-precision telemetry dashboard with predicted next run times and volume tracking.
- **UI Enhancement**: Room-level daily volume (Liters) summary.

## 0.1.2
- **New Feature**: Sequential Zone Staggering. Automatically enforces a 3-minute gap between zones in the same room to prevent concurrent runs.
- **New Feature**: Activity History. Track the last 50 irrigation events with timestamps and durations.
- **UI Redesign**: Complete overhaul of the Dashboard and Room Management with a "High-Precision" aesthetic.
- **UI Enhancement**: Added "Last Run" and "Time Ago" tracking for all zones.
- **UI Enhancement**: Improved config editor with better layout and informative tooltips.

## 0.1.0
- Added Room and Zone editing/deletion.
- Integrated Home Assistant entity selection with live search.
- Added support for Pump and Solenoid (Valve) entities per zone.
- Improved Ingress UI with relative path handling.
- Optimized backend for Home Assistant Supervisor API.

## 0.0.2

- Fix: Critical build fixes (System packages, Dockerfile permissions).
- Fix: Frontend build process.

## 0.0.1

- Initial release.
