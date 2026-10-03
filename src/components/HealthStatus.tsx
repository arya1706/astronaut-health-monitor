import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, HeartPulse, CheckCircle2 } from 'lucide-react';
import { HealthStatusType, VitalMetric } from '../types/health';
import { getStatusColorClasses } from '../utils/healthLogic';

interface HealthStatusProps {
  overallStatus: HealthStatusType;
  metrics: Record<string, VitalMetric>;
}

export const HealthStatus: React.FC<HealthStatusProps> = ({ overallStatus, metrics }) => {
  const metricList = Object.values(metrics);
  const normalCount = metricList.filter((m) => m.status === 'NORMAL').length;
  const warningCount = metricList.filter((m) => m.status === 'WARNING').length;
  const criticalCount = metricList.filter((m) => m.status === 'CRITICAL').length;

  const style = getStatusColorClasses(overallStatus);

  const getStatusContent = () => {
    switch (overallStatus) {
      case 'CRITICAL':
        return {
          title: 'CRITICAL HEALTH STATUS',
          subtitle: 'Immediate medical attention or suit tele-intervention required',
          icon: <AlertOctagon className="w-9 h-9 text-red-400 animate-bounce" />,
          accentBg: 'bg-red-950/80 border-red-500/60 shadow-red-500/20',
          badgeText: 'CRITICAL',
        };
      case 'WARNING':
        return {
          title: 'WARNING: VITAL SIGNS DEGRADED',
          subtitle: 'Physiological drift detected across primary biometrics',
          icon: <AlertTriangle className="w-9 h-9 text-amber-400 animate-pulse" />,
          accentBg: 'bg-amber-950/70 border-amber-500/50 shadow-amber-500/20',
          badgeText: 'WARNING',
        };
      case 'NORMAL':
      default:
        return {
          title: 'ASTRONAUT VITAL STATUS: OPTIMAL',
          subtitle: 'All physiological parameters operating within nominal space mission ranges',
          icon: <ShieldCheck className="w-9 h-9 text-emerald-400" />,
          accentBg: 'bg-emerald-950/50 border-emerald-500/40 shadow-emerald-500/10',
          badgeText: 'NOMINAL / NORMAL',
        };
    }
  };

  const content = getStatusContent();

  return (
    <div
      className={`relative w-full rounded-2xl p-5 border ${content.accentBg} ${style.glow} transition-all duration-500 backdrop-blur-xl overflow-hidden`}
    >
      {/* Background ambient lighting */}
      <div className="absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-3xl opacity-25 bg-current pointer-events-none text-current" />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
        
        {/* Main Status Information */}
        <div className="flex items-center space-x-4">
          <div className={`p-3.5 rounded-2xl border ${style.border} ${style.bg} backdrop-blur-md`}>
            {content.icon}
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <span className={`px-2.5 py-0.5 text-xs font-mono font-bold tracking-wider rounded-md border ${style.badgeText} ${style.badgeBg} uppercase shadow-sm`}>
                ● {content.badgeText}
              </span>
              <span className="text-xs font-mono text-slate-400">
                SYSTEM EVALUATION ENGINE v4.2
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-white tracking-wide mt-1">
              {content.title}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-2xl font-sans">
              {content.subtitle}
            </p>
          </div>
        </div>

        {/* Biometric Counter Breakdown Pills */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 self-stretch md:self-auto justify-between sm:justify-end border-t md:border-t-0 border-slate-800/80 pt-3 md:pt-0">
          
          <div className="flex flex-col items-center px-3.5 py-2 rounded-xl bg-space-900/80 border border-emerald-500/30 min-w-[75px]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">NORMAL</span>
            <span className="text-lg font-mono font-bold text-emerald-400">{normalCount}</span>
          </div>

          <div className="flex flex-col items-center px-3.5 py-2 rounded-xl bg-space-900/80 border border-amber-500/30 min-w-[75px]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">WARNING</span>
            <span className="text-lg font-mono font-bold text-amber-400">{warningCount}</span>
          </div>

          <div className="flex flex-col items-center px-3.5 py-2 rounded-xl bg-space-900/80 border border-red-500/30 min-w-[75px]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">CRITICAL</span>
            <span className="text-lg font-mono font-bold text-red-400">{criticalCount}</span>
          </div>

        </div>

      </div>
    </div>
  );
};
