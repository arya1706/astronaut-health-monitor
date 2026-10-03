import React, { useState, useEffect } from 'react';
import { Rocket, User, Compass, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { formatMissionElapsed } from '../utils/healthLogic';

export const MissionInfo: React.FC = () => {
  // Base mission elapsed in seconds (127 days, 14 hours, 32 minutes)
  const baseSeconds = 127 * 86400 + 14 * 3600 + 32 * 60;
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(baseSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const totalMissionDays = 500;
  const currentDay = 127;
  const progressPercent = Math.min(100, Math.round((currentDay / totalMissionDays) * 100));

  return (
    <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden flex flex-col justify-between">
      
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30">
              <Rocket className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-display font-extrabold text-white tracking-wider uppercase">
                MISSION BRIEF
              </h2>
              <p className="text-[11px] font-mono text-slate-400">TELEMETRY REGISTRY</p>
            </div>
          </div>

          <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ACTIVE
          </span>
        </div>

        {/* Info Grid */}
        <div className="mt-4 space-y-3 font-mono text-xs">
          
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-space-950/70 border border-slate-800/80">
            <span className="text-slate-400 flex items-center space-x-2">
              <Rocket className="w-3.5 h-3.5 text-cyan-400" />
              <span>MISSION</span>
            </span>
            <span className="font-bold text-cyan-300">ARES-01</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-space-950/70 border border-slate-800/80">
            <span className="text-slate-400 flex items-center space-x-2">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>ASTRONAUT</span>
            </span>
            <span className="font-bold text-white">Commander Alex Carter</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-space-950/70 border border-slate-800/80">
            <span className="text-slate-400 flex items-center space-x-2">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>MISSION DAY</span>
            </span>
            <span className="font-bold text-cyan-300">DAY {currentDay}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-space-950/70 border border-slate-800/80">
            <span className="text-slate-400 flex items-center space-x-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>LOCATION</span>
            </span>
            <span className="font-semibold text-slate-200">Low Earth Orbit (LEO)</span>
          </div>

          <div className="p-2.5 rounded-xl bg-space-950/70 border border-slate-800/80">
            <div className="text-slate-400 text-[10px] uppercase mb-1">MISSION ELAPSED TIME</div>
            <div className="text-sm font-bold text-cyan-300 tracking-wide">
              {formatMissionElapsed(elapsedSeconds)}
            </div>
          </div>

        </div>
      </div>

      {/* Mission Timeline Progress Bar */}
      <div className="mt-5 pt-3 border-t border-slate-800">
        <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1.5">
          <span>MISSION PROGRESS</span>
          <span className="text-cyan-400 font-bold">{progressPercent}% (Day {currentDay} / {totalMissionDays})</span>
        </div>
        <div className="w-full bg-space-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 shadow-md shadow-cyan-500/40"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

    </div>
  );
};
