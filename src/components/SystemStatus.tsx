import React from 'react';
import { Activity, ShieldCheck, Heart, Radio, Cpu, Zap, Wifi } from 'lucide-react';
import { SubsystemStatus } from '../types/health';

const SUBSYSTEMS: SubsystemStatus[] = [
  {
    id: 'life-support',
    name: 'Life Support System',
    status: 'ONLINE',
    metrics: 'O₂ Recirculation 99.8%',
    category: 'ECLSS Primary',
  },
  {
    id: 'telemetry',
    name: 'Telemetry Link',
    status: 'ONLINE',
    metrics: 'Latency 12ms · Bandwidth 500 Mbps',
    category: 'Orbital Comm Relay',
  },
  {
    id: 'medical-system',
    name: 'Medical Bio-Diagnostics',
    status: 'ONLINE',
    metrics: 'AI Bio-Engine Active',
    category: 'Health Diagnostics',
  },
  {
    id: 'suit-comm',
    name: 'Biometric Suit Sensors',
    status: 'ONLINE',
    metrics: 'Array Calibrated 100%',
    category: 'EVA Dermal Suit',
  },
  {
    id: 'radiation-shield',
    name: 'Radiation Shielding',
    status: 'ONLINE',
    metrics: '0.04 mSv / hr (Safe)',
    category: 'Galactic Shield',
  },
];

export const SystemStatus: React.FC = () => {
  return (
    <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden flex flex-col justify-between">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30">
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-display font-extrabold text-white tracking-wider uppercase">
                SYSTEM DIAGNOSTICS
              </h2>
              <p className="text-[11px] font-mono text-slate-400">HARDWARE SUBSYSTEMS</p>
            </div>
          </div>

          <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
            <Wifi className="w-3.5 h-3.5" />
            <span>ALL ONLINE</span>
          </span>
        </div>

        {/* Subsystems List */}
        <div className="mt-4 space-y-2.5 font-mono text-xs">
          {SUBSYSTEMS.map((sys) => (
            <div
              key={sys.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-space-950/70 border border-slate-800/80 hover:border-cyan-500/30 transition-all"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-bold text-slate-100">{sys.name}</span>
                </div>
                <div className="text-[10px] text-slate-400 ml-4">{sys.metrics}</div>
              </div>

              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                {sys.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer System summary */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <span>AUTO-DIAGNOSTIC INTERVAL</span>
        <span className="text-cyan-400 font-semibold">1,000 ms</span>
      </div>

    </div>
  );
};
