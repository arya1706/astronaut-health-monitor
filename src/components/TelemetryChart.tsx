import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { TelemetryPoint } from '../types/health';
import { Activity, Droplets, Thermometer, LineChart as ChartIcon } from 'lucide-react';

interface TelemetryChartProps {
  history: TelemetryPoint[];
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({ history }) => {
  const [activeTab, setActiveTab] = useState<'spo2' | 'heartRate' | 'temperature' | 'combined'>('spo2');

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel p-3 rounded-lg border border-cyan-500/30 text-xs font-mono shadow-2xl backdrop-blur-xl">
          <div className="text-cyan-400 font-bold mb-1 border-b border-cyan-500/20 pb-1 flex justify-between gap-4">
            <span>TIME: {label}</span>
            <span className="text-slate-400">READING #{payload[0]?.payload?.timeFormatted}</span>
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5" style={{ color: entry.color }}>
              <span className="capitalize">{entry.name}:</span>
              <span className="font-bold">
                {entry.value} {entry.name === 'heartRate' ? 'BPM' : entry.name === 'spo2' ? '%' : '°C'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-5 border border-cyan-500/20 relative overflow-hidden">
      
      {/* Chart Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <ChartIcon className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-display font-extrabold text-white tracking-wider uppercase">
              HEALTH TELEMETRY
            </h2>
            <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded">
              REAL-TIME BUFFER (25 SAMPLES)
            </span>
          </div>
          <p className="text-xs font-sans text-slate-400 mt-0.5">
            Continuous bio-sensor telemetry stream with safe physiological thresholds
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-space-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('spo2')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'spo2'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>SpO₂ (%)</span>
          </button>

          <button
            onClick={() => setActiveTab('heartRate')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'heartRate'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Heart Rate</span>
          </button>

          <button
            onClick={() => setActiveTab('temperature')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center space-x-1.5 ${
              activeTab === 'temperature'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            <span>Temp (°C)</span>
          </button>

          <button
            onClick={() => setActiveTab('combined')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
              activeTab === 'combined'
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            Combined View
          </button>
        </div>
      </div>

      {/* Chart Canvas Container */}
      <div className="h-72 w-full scanline-overlay">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'spo2' ? (
            <AreaChart data={history} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="spo2Grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="timeFormatted" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis domain={[80, 100]} stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'CRITICAL O₂ (<90%)', fill: '#ef4444', fontSize: 10, position: 'insideBottomRight' }} />
              <ReferenceLine y={95} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Nominal Min (95%)', fill: '#10b981', fontSize: 9, position: 'insideTopRight' }} />
              <Area type="monotone" dataKey="spo2" name="spo2" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#spo2Grad)" dot={{ r: 3, fill: '#38bdf8' }} activeDot={{ r: 6, fill: '#06b6d4' }} />
            </AreaChart>
          ) : activeTab === 'heartRate' ? (
            <AreaChart data={history} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="hrGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="timeFormatted" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis domain={[40, 140]} stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={120} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Critical High (120 BPM)', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Normal Max (100 BPM)', fill: '#f59e0b', fontSize: 9 }} />
              <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Normal Min (60 BPM)', fill: '#f59e0b', fontSize: 9 }} />
              <Area type="monotone" dataKey="heartRate" name="heartRate" stroke="#38bdf8" strokeWidth={2.5} fillOpacity={1} fill="url(#hrGrad)" dot={{ r: 3, fill: '#0284c7' }} activeDot={{ r: 6, fill: '#38bdf8' }} />
            </AreaChart>
          ) : activeTab === 'temperature' ? (
            <AreaChart data={history} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="timeFormatted" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis domain={[34.5, 39.0]} stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={38.0} stroke="#ef4444" strokeDasharray="5 5" label={{ value: 'Fever Threshold (38°C)', fill: '#ef4444', fontSize: 10 }} />
              <ReferenceLine y={36.1} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Min Normal (36.1°C)', fill: '#10b981', fontSize: 9 }} />
              <Area type="monotone" dataKey="temperature" name="temperature" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#tempGrad)" dot={{ r: 3, fill: '#059669' }} activeDot={{ r: 6, fill: '#10b981' }} />
            </AreaChart>
          ) : (
            <LineChart data={history} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
              <XAxis dataKey="timeFormatted" stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="spo2" name="spo2" stroke="#06b6d4" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="heartRate" name="heartRate" stroke="#38bdf8" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="temperature" name="temperature" stroke="#10b981" strokeWidth={2} dot={false} />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>

    </div>
  );
};
