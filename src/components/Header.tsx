import React, { useState, useEffect } from 'react';
import { Radio, Wifi, Clock, ShieldAlert, Cpu } from 'lucide-react';
import { formatTimeHHMMSS } from '../utils/healthLogic';

interface HeaderProps {
  appName: string;
  astronautName: string;
  missionName: string;
  missionDay: number;
  isSimulationActive: boolean;
  secondsSinceUpdate: number;
}

export const Header: React.FC<HeaderProps> = ({
  appName = 'ASTRONAUT HEALTH MONITOR',
  astronautName = 'Commander Alex Carter',
  missionName = 'ARES-01',
  missionDay = 127,
  isSimulationActive,
  secondsSinceUpdate,
}) => {
  const [earthTime, setEarthTime] = useState<Date>(new Date());
  const [missionClockSeconds, setMissionClockSeconds] = useState<number>(14 * 3600 + 32 * 60 + 18);

  // Continuously update clocks every second
  useEffect(() => {
    const timer = setInterval(() => {
      setEarthTime(new Date());
      setMissionClockSeconds((prev) => (prev + 1) % 86400);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatMissionTime = (totalSec: number) => {
    const hrs = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSec % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
  };

  const formattedDate = earthTime.toISOString().split('T')[0];

  return (
    <header className="w-full glass-panel border-b border-cyan-500/20 bg-space-900/90 sticky top-0 z-40 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Brand Identity & Astronaut Details */}
          <div className="flex items-center space-x-3.5">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-cyan-950/80 border border-cyan-500/40 shadow-lg shadow-cyan-500/10">
              <Cpu className="w-6 h-6 text-cyan-400 animate-pulse-slow" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-space-950 animate-ping" />
            </div>
            
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest uppercase bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded">
                  NASA / ESA VITAL HUD
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center space-x-1">
                  <Wifi className="w-3 h-3 text-emerald-400" />
                  <span className="hidden sm:inline">TELEMETRY LINK:</span>
                  <span className="text-emerald-400 font-semibold">CONNECTED</span>
                </span>
              </div>
              
              <h1 className="text-lg sm:text-xl font-display font-extrabold tracking-wider text-white uppercase flex items-center gap-2 mt-0.5">
                {appName}
              </h1>
              
              <div className="text-xs font-medium text-slate-300 flex items-center gap-2 mt-0.5">
                <span className="font-semibold text-cyan-300">{astronautName}</span>
                <span className="text-slate-600">·</span>
                <span className="px-1.5 py-0.5 bg-slate-800 text-cyan-400 rounded text-[11px] font-mono border border-slate-700">
                  {missionName}
                </span>
              </div>
            </div>
          </div>

          {/* Center/Right Status Indicators & Clocks */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 sm:gap-6 border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
            
            {/* Live Monitoring Badge */}
            <div className="flex items-center space-x-2 bg-space-850 px-3 py-1.5 rounded-lg border border-cyan-500/20">
              <span className="relative flex h-3 w-3">
                {isSimulationActive ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                )}
              </span>
              <span className="text-xs font-mono font-bold tracking-wider text-slate-200 uppercase">
                {isSimulationActive ? '● LIVE MONITORING' : 'PAUSED'}
              </span>
            </div>

            {/* Mission Day Clock */}
            <div className="flex items-center space-x-2.5 bg-space-850 px-3.5 py-1.5 rounded-lg border border-cyan-500/20 shadow-inner">
              <Clock className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">
                  MISSION DAY {missionDay}
                </div>
                <div className="text-sm font-mono font-bold text-cyan-300 tracking-wider">
                  {formatMissionTime(missionClockSeconds)}
                </div>
              </div>
            </div>

            {/* Earth Date & Last Update Counter */}
            <div className="text-right font-mono text-[11px] hidden md:block">
              <div className="text-slate-400">
                Earth Date: <span className="text-slate-200">{formattedDate}</span>
              </div>
              <div className="text-slate-400">
                Last Update: <span className="text-cyan-400 font-semibold">{secondsSinceUpdate === 0 ? 'Just now' : `${secondsSinceUpdate}s ago`}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
