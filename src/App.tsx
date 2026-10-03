import React from 'react';
import { useHealthSimulation } from './hooks/useHealthSimulation';
import { Header } from './components/Header';
import { HealthStatus } from './components/HealthStatus';
import { AlertBanner } from './components/AlertBanner';
import { HealthCard } from './components/HealthCard';
import { TelemetryChart } from './components/TelemetryChart';
import { MissionInfo } from './components/MissionInfo';
import { SystemStatus } from './components/SystemStatus';
import { AlertHistory } from './components/AlertHistory';
import { SimulationControls } from './components/SimulationControls';
import { ShieldCheck, Cpu } from 'lucide-react';

export function App() {
  const {
    metrics,
    overallStatus,
    telemetryHistory,
    alerts,
    activeAlertBanner,
    isSimulationActive,
    setIsSimulationActive,
    simulationSpeed,
    setSimulationSpeed,
    secondsSinceUpdate,
    triggerAnomaly,
    acknowledgeAlert,
    dismissAlertBanner,
  } = useHealthSimulation();

  const metricList = [
    metrics.heartRate,
    metrics.spo2,
    metrics.temperature,
    metrics.sleepDuration,
    metrics.exerciseTime,
  ];

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      
      {/* 1. Header Navigation HUD */}
      <Header
        appName="ASTRONAUT HEALTH MONITOR"
        astronautName="Commander Alex Carter"
        missionName="ARES-01"
        missionDay={127}
        isSimulationActive={isSimulationActive}
        secondsSinceUpdate={secondsSinceUpdate}
      />

      {/* 2. Main Dashboard Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Emergency Alert Banner (Appears when SpO2 < 90% or Critical state) */}
        <AlertBanner
          alert={activeAlertBanner}
          onDismiss={dismissAlertBanner}
          onAcknowledge={acknowledgeAlert}
        />

        {/* Overall Health Status Panel */}
        <HealthStatus overallStatus={overallStatus} metrics={metrics} />

        {/* Simulation Speed & Anomaly Injector Controls Bar */}
        <SimulationControls
          isSimulationActive={isSimulationActive}
          setIsSimulationActive={setIsSimulationActive}
          simulationSpeed={simulationSpeed}
          setSimulationSpeed={setSimulationSpeed}
          triggerAnomaly={triggerAnomaly}
        />

        {/* 5 Health Parameter Cards Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {metricList.map((metric) => (
            <HealthCard key={metric.id} metric={metric} />
          ))}
        </section>

        {/* Main Telemetry Teleport Layout (Charts, Event Log, Sidebars) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Column (2/3 width on desktop): Telemetry Chart + Alert History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recharts Health Telemetry Line Graph */}
            <TelemetryChart history={telemetryHistory} />

            {/* Audit Log / Event History */}
            <AlertHistory alerts={alerts} onAcknowledge={acknowledgeAlert} />
          </div>

          {/* Sidebar Column (1/3 width on desktop): Mission Brief + System Diagnostics */}
          <div className="space-y-6">
            <MissionInfo />
            <SystemStatus />
          </div>

        </div>

      </main>

      {/* 3. Sci-Fi Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-space-900/80 mt-10 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>NASA / ARES-01 ORBITAL TELEMETRY SUITE · V4.2</span>
          </div>
          <div>
            Commander Alex Carter Bio-Monitoring System · LEO Station Link
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
