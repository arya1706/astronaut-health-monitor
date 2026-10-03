import React from 'react';
import { AlertOctagon, X, BellRing, ShieldAlert, ArrowRight } from 'lucide-react';
import { AlertEvent } from '../types/health';

interface AlertBannerProps {
  alert: AlertEvent | null;
  onDismiss: () => void;
  onAcknowledge: (id: string) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onDismiss, onAcknowledge }) => {
  if (!alert) return null;

  const isCritical = alert.severity === 'CRITICAL';

  return (
    <div
      className={`w-full rounded-xl border p-4 mb-6 transition-all duration-300 ${
        isCritical
          ? 'bg-red-950/90 border-red-500/80 text-red-100 shadow-2xl shadow-red-500/30 animate-pulse-slow'
          : 'bg-amber-950/90 border-amber-500/80 text-amber-100 shadow-xl shadow-amber-500/20'
      } backdrop-blur-2xl relative overflow-hidden`}
    >
      {/* Background glowing sweep line */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-scanline pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        
        <div className="flex items-start space-x-3.5">
          <div className={`p-2.5 rounded-lg border ${isCritical ? 'bg-red-900/60 border-red-400/50' : 'bg-amber-900/60 border-amber-400/50'} flex-shrink-0 mt-0.5`}>
            {isCritical ? (
              <AlertOctagon className="w-6 h-6 text-red-300 animate-spin-slow" />
            ) : (
              <BellRing className="w-6 h-6 text-amber-300 animate-bounce" />
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span
                className={`px-2 py-0.5 text-[10px] font-mono font-bold tracking-wider rounded uppercase ${
                  isCritical ? 'bg-red-500 text-black' : 'bg-amber-500 text-black'
                }`}
              >
                {alert.severity} EMERGENCY ALERT
              </span>
              <span className="text-xs font-mono opacity-80 flex items-center space-x-1">
                <ShieldAlert className="w-3 h-3" />
                <span>TIMESTAMP: {alert.timestamp}</span>
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-display font-bold tracking-wide mt-1 text-white">
              {alert.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-200 mt-0.5 max-w-3xl">
              {alert.message}
            </p>
          </div>
        </div>

        {/* Current Metric Value & Action buttons */}
        <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
          <div className="text-right px-3 py-1.5 rounded-lg bg-black/40 border border-white/10">
            <div className="text-[10px] font-mono opacity-70 uppercase">CURRENT VALUE</div>
            <div className="text-lg font-mono font-bold text-white">{alert.value}</div>
          </div>

          <button
            onClick={() => onAcknowledge(alert.id)}
            className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-semibold border border-white/20 transition-all flex items-center space-x-1.5 shadow-md active:scale-95"
          >
            <span>ACKNOWLEDGE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onDismiss}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-all border border-white/10"
            title="Dismiss Banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
