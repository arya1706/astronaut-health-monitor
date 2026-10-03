# Astronaut Health Monitor 🚀👨‍🚀

An interactive, space-mission telemetry dashboard built for space agency medical operations to monitor the vital signs of **Commander Alex Carter** aboard mission **ARES-01** in real time.

![Astronaut Health Monitor](https://img.shields.io/badge/Mission-ARES--01-06B6D4?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38BDF8?style=for-the-badge&logo=tailwindcss)
![Recharts](https://img.shields.io/badge/Recharts-2.12-22C55E?style=for-the-badge)

---

## 🌟 Overview

The **Astronaut Health Monitor** is a NASA-inspired, futuristic space HUD dashboard designed to evaluate biometrics continuously without requiring a backend API. Biometric data (Heart Rate, Blood Oxygen saturation $SpO_2$, Core Body Temperature, Sleep Duration, and Exercise Time) is dynamically generated and varied in real time via a physiological random-walk simulation engine.

---

## ✨ Features

- **Futuristic Space HUD UI**: Sci-fi dark mode aesthetic with glassmorphism panels, glowing status indicators, pulsing telemetry links, and responsive grid layouts.
- **5 Core Vital Parameters Cards**:
  1. **Heart Rate (BPM)**: Electrocardiogram telemetry with 60–100 BPM nominal range.
  2. **Blood Oxygen ($SpO_2$ %)**: Pulse oximetry saturation with $<90\%$ critical alert threshold.
  3. **Body Temperature ($^\circ\text{C}$)**: Core temperature dermal sensors with $36.1 - 37.5^\circ\text{C}$ range.
  4. **Sleep Duration (Hours)**: Orbital night sleep cycle telemetry.
  5. **Exercise Time (Minutes)**: ARED treadmill & countermeasure daily tracker.
- **Dynamic Overall Health Status Engine**: Evaluates vital signs continuously to transition between `NORMAL` (Green), `WARNING` (Amber), and `CRITICAL` (Red).
- **Emergency Alert System**: Automatically triggers a high-priority banner when $SpO_2 < 90\%$ or severe tachycardia/hypothermia occurs, logged in a deduplicated timeline.
- **Health Telemetry Line Graphs**: Responsive interactive charts powered by Recharts with reference threshold lines, area gradients, and rolling history buffers.
- **Interactive Anomaly Trigger Controls**: Evaluators can pause/resume simulation, change speed (1x, 2x, 5x), or trigger synthetic anomalies (*Drop $SpO_2$*, *Tachycardia*, *Hypothermia*, *Normalize*) for instant testing.
- **Continuous Mission Clock & Diagnostics**: Live ticking mission elapsed counter, Earth date display, station link ping, and spacecraft subsystem status (Life Support, Telemetry, Radiation Shielding).

---

## 🩺 Biometric Threshold & Alert Logic

| Health Parameter | NORMAL Range | WARNING Range | CRITICAL Range |
| :--- | :--- | :--- | :--- |
| **Blood Oxygen ($SpO_2$)** | $\ge 95\%$ | $90\% - 94\%$ | **$< 90\%$** |
| **Heart Rate** | $60 - 100$ BPM | $50-59$ or $101-120$ BPM | $<50$ or $>120$ BPM |
| **Body Temperature** | $36.1 - 37.5^\circ\text{C}$ | $35.5-36.0$ or $37.6-38.0^\circ\text{C}$ | $<35.5$ or $>38.0^\circ\text{C}$ |
| **Sleep Duration** | $5.0 - 9.0$ hrs | $4.0-4.9$ or $9.1-10.0$ hrs | $<4.0$ or $>10.0$ hrs |
| **Exercise Time** | $20 - 120$ min | $10-19$ min | $<10$ min |

### Overall Status Formula:
- **NORMAL**: All metrics operate within nominal range.
- **WARNING**: At least one metric enters warning range.
- **CRITICAL**: At least one metric enters critical range (e.g. $SpO_2 < 90\%$).

---

## ⚙️ How the Health Simulation Engine Works

The custom `useHealthSimulation` hook powers the telemetry simulation:
1. **Bounded Random Walk**: Every 3 seconds (or faster at 2x/5x speed), values fluctuate smoothly using bounded Gaussian deltas (e.g. Heart Rate: $76 \rightarrow 78 \rightarrow 75 \rightarrow 77$).
2. **Physiological Constraints**: Prevents unrealistic random jumping.
3. **Threshold Crossing Detection**: Only logs events to the Alert History when a metric crosses a status boundary, keeping logs clean.
4. **Manual Anomaly Injection**: Provides quick buttons for evaluators to test emergency state transitions without waiting.

---

## 🛠️ Technology Stack

- **Framework**: React 18 + Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Sci-Fi Glassmorphism CSS
- **Icons**: Lucide React
- **Charting**: Recharts
- **Build System**: Node.js / Vite bundler

---

## 🚀 How to Run Locally

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Steps

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Open Browser**:
   Navigate to `http://localhost:3000` to view the dashboard.

4. **Build for Production**:
   ```bash
   npm run build
   ```

---

## 🛰️ Mission Specifications
- **Mission**: ARES-01
- **Astronaut**: Commander Alex Carter
- **Station Location**: Low Earth Orbit (LEO)
- **Life Support Status**: ONLINE (ECLSS 99.8% Recirculation)
