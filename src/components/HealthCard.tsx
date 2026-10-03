import React from 'react';
import {
  Activity,
  Droplets,
  Thermometer,
  Moon,
  Dumbbell,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { VitalMetric } from '../types/health';
import { getStatusColorClasses } from '../utils/healthLogic';

interface HealthCardProps {
  metric: VitalMetric;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Activity,
  Droplets,
  Thermometer,
  Moon,
  Dumbbell,
};

export const HealthCard: React.FC<HealthCardProps> = ({ metric }) => {
  const IconComponent = ICON_MAP[metric.icon] || Activity;
  const style = getStatusColorClasses(metric.status);

  // Calculate percentage range for progress bar
  const getProgressPercentage = () => {
    if (metric.id === 'spo2') return Math.min(100, Math.max(0, metric.value));
    if (metric.id === 'heartRate') {
      return Math.min(100, Math.max(0, ((metric.value - 40) / 100) * 100));
    }
    if (metric.id === 'temperature') {
      return Math.min(100, Math.max(0, ((metric.value - 34) / 6) * 100));
    }
    if (metric.id === 'sleepDuration') {
      return Math.min(100, Math.max(0, (metric.value / 12) * 100));
    }
    if (metric.id === 'exerciseTime') {
      return Math.min(100, Math.max(0, (metric.value / 150) * 100));
    }
    return 50;
  };

  const percent = getProgressPercentage();

  // Render trend icon
  const renderTrend = () => {
    if (metric.trend === 'up') {
      return (
        <span className="flex items-center text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
          <TrendingUp className="w-3.5 h-3.5 mr-1 text-cyan-400" />
          RISING
        </span>
      );
    }
    if (metric.trend === 'down') {
      return (
        <span className="flex items-center text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
          <TrendingDown className="w-3.5 h-3.5 mr-1 text-slate-400" />
          FALLING
        </span>
      );
    }
    return (
      <span className="flex items-center text-xs font-mono text-emerald-400/80 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
        <Minus className="w-3.5 h-3.5 mr-1" />
        STABLE
      </span>
    );
  };

  // Render mini sparkline bar graphs using metric.history
  const history = metric.history || [];
  const maxHist = Math.max(...history, 1);
  const minHist = Math.min(...history, 0);

  return (
    <div
      className={`glass-panel glass-panel-hover rounded-2xl p-5 border ${style.border} transition-all duration-300 relative overflow-hidden flex flex-col justify-between`}
    >
      {/* Top Header Row: Icon, Title, Status Pill */}
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl border ${style.border} ${style.bg} backdrop-blur-md`}>
              <IconComponent className={`w-5 h-5 ${style.text}`} />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-slate-100 uppercase tracking-wide">
                {metric.name}
              </h3>
              <p className="text-[11px] font-mono text-slate-400">
                Range: {metric.referenceRange}
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-0.5 text-[11px] font-mono font-bold tracking-wide rounded-full border ${style.badgeBg} ${style.badgeText} flex items-center gap-1 shadow-sm`}
          >
            {metric.status === 'NORMAL' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
            {metric.status !== 'NORMAL' && <AlertCircle className="w-3 h-3" />}
            {metric.status}
          </span>
        </div>

        {/* Large Value & Unit Display */}
        <div className="mt-4 flex items-baseline justify-between">
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-mono font-extrabold tracking-tight text-white drop-shadow-sm">
              {metric.value}
            </span>
            <span className="text-base font-mono font-semibold text-slate-400">
              {metric.unit}
            </span>
          </div>

          {renderTrend()}
        </div>
      </div>

      {/* Bottom Section: Progress Bar & Mini Sparkline Bar Chart */}
      <div className="mt-5 pt-3 border-t border-slate-800/80 space-y-2.5">
        
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-1">
            <span>METRIC SCALE</span>
            <span>{percent.toFixed(0)}%</span>
          </div>
          <div className="w-full bg-space-950 rounded-full h-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                metric.status === 'CRITICAL'
                  ? 'bg-gradient-to-r from-red-600 to-rose-400 shadow-lg shadow-red-500/50'
                  : metric.status === 'WARNING'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-400 shadow-lg shadow-amber-500/40'
                  : 'bg-gradient-to-r from-emerald-600 to-cyan-400'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>

        {/* Mini sparkline bars */}
        {history.length > 0 && (
          <div className="flex items-end justify-between gap-1 h-6 pt-1 opacity-75 hover:opacity-100 transition-opacity">
            {history.slice(-12).map((val, idx) => {
              const barHeight = maxHist === minHist ? 50 : Math.max(15, ((val - minHist) / (maxHist - minHist)) * 100);
              return (
                <div
                  key={idx}
                  className={`w-full rounded-t-xs transition-all duration-300 ${
                    metric.status === 'CRITICAL'
                      ? 'bg-red-500/60 hover:bg-red-400'
                      : metric.status === 'WARNING'
                      ? 'bg-amber-500/60 hover:bg-amber-400'
                      : 'bg-cyan-500/40 hover:bg-cyan-400'
                  }`}
                  style={{ height: `${barHeight}%` }}
                  title={`${val} ${metric.unit}`}
                />
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
