import React, { useState } from 'react';
import { ShieldAlert, AlertOctagon, AlertTriangle, Info, CheckCircle2, Filter, Trash2 } from 'lucide-react';
import { AlertEvent, AlertSeverity } from '../types/health';

interface AlertHistoryProps {
  alerts: AlertEvent[];
  onAcknowledge: (id: string) => void;
}

export const AlertHistory: React.FC<AlertHistoryProps> = ({ alerts, onAcknowledge }) => {
  const [filter, setFilter] = useState<'ALL' | AlertSeverity>('ALL');

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'ALL') return true;
    return a.severity === filter;
  });

  const getAlertIcon = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <AlertOctagon className="w-4 h-4 text-red-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'INFO':
      default:
        return <Info className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getAlertBadgeStyle = (severity: AlertSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      case 'WARNING':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'INFO':
      default:
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
    }
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden flex flex-col justify-between">
      
      {/* Header & Filter Controls */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-display font-extrabold text-white tracking-wider uppercase">
                ALERT HISTORY & TELEMETRY LOG
              </h2>
              <p className="text-[11px] font-mono text-slate-400">
                AUDIT TRAIL ({alerts.length} RECORDED EVENTS)
              </p>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 bg-space-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
            {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all ${
                  filter === f
                    ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Alerts Log List */}
        <div className="mt-4 space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
              No alert logs matching filter criteria.
            </div>
          ) : (
            filteredAlerts.map((evt) => (
              <div
                key={evt.id}
                className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                  evt.severity === 'CRITICAL'
                    ? 'bg-red-950/40 border-red-500/30 hover:border-red-500/60'
                    : evt.severity === 'WARNING'
                    ? 'bg-amber-950/30 border-amber-500/30 hover:border-amber-500/60'
                    : 'bg-space-950/70 border-slate-800 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-space-900 border border-slate-700">
                    {getAlertIcon(evt.severity)}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-0.2 text-[10px] font-mono font-bold rounded border uppercase ${getAlertBadgeStyle(
                          evt.severity
                        )}`}
                      >
                        {evt.severity}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {evt.timestamp}
                      </span>
                      {evt.value && (
                        <span className="px-1.5 py-0.2 text-[10px] font-mono bg-space-900 text-slate-200 rounded border border-slate-700">
                          {evt.value}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs font-mono font-bold text-white mt-1">
                      {evt.title}
                    </h4>

                    <p className="text-[11px] font-sans text-slate-300 mt-0.5">
                      {evt.message}
                    </p>
                  </div>
                </div>

                {!evt.acknowledged && (
                  <button
                    onClick={() => onAcknowledge(evt.id)}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 hover:text-white border border-slate-700 flex-shrink-0"
                    title="Acknowledge event"
                  >
                    ACK
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
};
