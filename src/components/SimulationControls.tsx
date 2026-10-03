import React from 'react';
import { Play, Pause, FastForward, Zap, RotateCcw, AlertTriangle, ShieldCheck, Flame, ThermometerSnowflake } from 'lucide-react';
import { SimulationSpeed } from '../types/health';

interface SimulationControlsProps {
  isSimulationActive: boolean;
  setIsSimulationActive: (active: boolean) => void;
  simulationSpeed: SimulationSpeed;
  setSimulationSpeed: (speed: SimulationSpeed) => void;
  triggerAnomaly: (type: 'CRITICAL_O2' | 'TACHYCARDIA' | 'HYPOTHERMIA' | 'FEVER' | 'RESET') => void;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  isSimulationActive,
  setIsSimulationActive,
  simulationSpeed,
  setSimulationSpeed,
  triggerAnomaly,
}) => {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left Side: Play/Pause & Speed */}
        <div className="flex flex-wrap items-center gap-3">
          
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-mono font-bold uppercase text-slate-200">
              SIMULATION ENGINE:
            </span>
          </div>

          <button
            onClick={() => setIsSimulationActive(!isSimulationActive)}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold border transition-all flex items-center space-x-1.5 shadow-md ${
              isSimulationActive
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
            }`}
          >
            {isSimulationActive ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>PAUSE STREAM</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>RESUME STREAM</span>
              </>
            )}
          </button>

          {/* Speed Selection */}
          <div className="flex items-center space-x-1 bg-space-950 p-1 rounded-xl border border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 px-2">SPEED:</span>
            {([1, 2, 5] as const).map((spd) => (
              <button
                key={spd}
                onClick={() => setSimulationSpeed(spd)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  simulationSpeed === spd
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

        </div>

        {/* Right Side: Quick Anomaly Injectors for Testing */}
        <div className="flex flex-wrap items-center gap-2 border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider hidden lg:inline">
            TEST ANOMALIES:
          </span>

          <button
            onClick={() => triggerAnomaly('CRITICAL_O2')}
            className="px-2.5 py-1.5 rounded-lg bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-500/40 font-mono text-[11px] font-bold transition-all flex items-center space-x-1 shadow-sm active:scale-95"
            title="Drop SpO2 below 90% to trigger CRITICAL ALERT"
          >
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span>Drop O₂ (&lt;90%)</span>
          </button>

          <button
            onClick={() => triggerAnomaly('TACHYCARDIA')}
            className="px-2.5 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 text-amber-300 border border-amber-500/40 font-mono text-[11px] font-bold transition-all flex items-center space-x-1 shadow-sm active:scale-95"
            title="Spike Heart Rate to 126 BPM"
          >
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Tachycardia</span>
          </button>

          <button
            onClick={() => triggerAnomaly('HYPOTHERMIA')}
            className="px-2.5 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 font-mono text-[11px] font-bold transition-all flex items-center space-x-1 shadow-sm active:scale-95"
            title="Drop Temp to 35.2°C"
          >
            <ThermometerSnowflake className="w-3 h-3 text-indigo-400" />
            <span>Hypothermia</span>
          </button>

          <button
            onClick={() => triggerAnomaly('RESET')}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40 font-mono text-[11px] font-bold transition-all flex items-center space-x-1 shadow-sm active:scale-95"
            title="Reset metrics back to nominal center ranges"
          >
            <RotateCcw className="w-3 h-3 text-emerald-400" />
            <span>Normalize</span>
          </button>
        </div>

      </div>

    </div>
  );
};
