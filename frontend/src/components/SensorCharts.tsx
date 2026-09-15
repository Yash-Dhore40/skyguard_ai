import React, { useState } from 'react';
import type { TelemetryPoint } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Thermometer, 
  Gauge, 
  Droplets, 
  Eye, 
  EyeOff,
  AlertCircle
} from 'lucide-react';

interface SensorChartsProps {
  data: TelemetryPoint[];
  isDetecting: boolean;
  anomalyCount: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const pointData: TelemetryPoint = payload[0]?.payload;
    const isAnomaly = pointData?.is_anomaly;

    return (
      <div className="glass-panel p-3.5 rounded-xl border border-cyan-500/30 text-xs shadow-2xl space-y-2 min-w-[200px]">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5 font-mono">
          <span className="text-slate-400">Timestamp:</span>
          <span className="text-cyan-300 font-bold">{label}</span>
        </div>

        {isAnomaly && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 font-semibold">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Anomaly: {pointData.fault_type || 'Flagged'}</span>
          </div>
        )}

        <div className="space-y-1 font-mono">
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <span 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: entry.color }}
                />
                {entry.name}:
              </span>
              <span className="font-bold text-white">
                {entry.value !== undefined ? Number(entry.value).toFixed(1) : '--'}
                {entry.dataKey === 'temperature' ? ' °C' : entry.dataKey === 'pressure' ? ' hPa' : ' %'}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const SensorCharts: React.FC<SensorChartsProps> = ({ data, isDetecting, anomalyCount }) => {
  const [showTemp, setShowTemp] = useState(true);
  const [showPressure, setShowPressure] = useState(true);
  const [showHumidity, setShowHumidity] = useState(true);
  const [pointsWindow, setPointsWindow] = useState<number>(30);

  // Format data for chart
  const formattedData = data.slice(-pointsWindow).map((d) => {
    let formattedTime = '--:--:--';
    try {
      if (d.timestamp) {
        const date = new Date(d.timestamp);
        formattedTime = date.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    } catch {
      formattedTime = d.timestamp;
    }

    return {
      ...d,
      time: formattedTime,
    };
  });

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
      {/* Header with Title and Interactive Chart Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">
              Live Multi-Spectral Telemetry Stream
            </h2>
            {isDetecting && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse mr-1"></span>
                LIVE SYNC
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Synchronized real-time weather sensors with AI contamination tracking
          </p>
        </div>

        {/* Controls: Series Visibility and Time Window */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Temperature Toggle */}
          <button
            onClick={() => setShowTemp(!showTemp)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 border transition-all ${
              showTemp 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 shadow-sm' 
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <Thermometer className="w-3 h-3" />
            Temp
            {showTemp ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
          </button>

          {/* Pressure Toggle */}
          <button
            onClick={() => setShowPressure(!showPressure)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 border transition-all ${
              showPressure 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm' 
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <Gauge className="w-3 h-3" />
            Pressure
            {showPressure ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
          </button>

          {/* Humidity Toggle */}
          <button
            onClick={() => setShowHumidity(!showHumidity)}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium flex items-center gap-1.5 border transition-all ${
              showHumidity 
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300 shadow-sm' 
                : 'bg-slate-900/40 border-slate-800 text-slate-500'
            }`}
          >
            <Droplets className="w-3 h-3" />
            Humidity
            {showHumidity ? <Eye className="w-2.5 h-2.5" /> : <EyeOff className="w-2.5 h-2.5" />}
          </button>

          {/* Window size buttons */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-0.5 flex items-center text-xs font-mono">
            {[20, 30, 50].map((count) => (
              <button
                key={count}
                onClick={() => setPointsWindow(count)}
                className={`px-2 py-0.5 rounded text-[11px] transition-all ${
                  pointsWindow === count 
                    ? 'bg-cyan-500 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {count}p
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="w-full h-80 relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              {/* Temperature Gradient */}
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>

              {/* Pressure Gradient */}
              <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>

              {/* Humidity Gradient */}
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
            
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono' }} 
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickLine={false}
            />
            
            <YAxis 
              tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono' }} 
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickLine={false}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={36} wrapperStyle={{ paddingBottom: '10px', fontSize: '12px' }} />

            {showTemp && (
              <Area 
                type="monotone" 
                dataKey="temperature" 
                name="Temperature (°C)" 
                stroke="#f43f5e" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#tempGradient)"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.is_anomaly && payload.fault_type?.includes('TEMP')) {
                    return (
                      <circle 
                        key={`dot-temp-${cx}-${cy}`} 
                        cx={cx} 
                        cy={cy} 
                        r={6} 
                        fill="#f43f5e" 
                        stroke="#fff" 
                        strokeWidth={2} 
                        className="animate-ping" 
                      />
                    );
                  }
                  return <circle key={`dot-temp-${cx}-${cy}`} cx={cx} cy={cy} r={2} fill="#f43f5e" opacity={0.6} />;
                }}
              />
            )}

            {showPressure && (
              <Area 
                type="monotone" 
                dataKey="pressure" 
                name="Pressure (hPa)" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#pressureGradient)"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.is_anomaly && payload.fault_type?.includes('PRESS')) {
                    return (
                      <circle 
                        key={`dot-press-${cx}-${cy}`} 
                        cx={cx} 
                        cy={cy} 
                        r={6} 
                        fill="#10b981" 
                        stroke="#fff" 
                        strokeWidth={2} 
                        className="animate-ping" 
                      />
                    );
                  }
                  return <circle key={`dot-press-${cx}-${cy}`} cx={cx} cy={cy} r={2} fill="#10b981" opacity={0.6} />;
                }}
              />
            )}

            {showHumidity && (
              <Area 
                type="monotone" 
                dataKey="humidity" 
                name="Humidity (%)" 
                stroke="#06b6d4" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#humidityGradient)"
                dot={(props: any) => {
                  const { cx, cy, payload } = props;
                  if (payload.is_anomaly && (payload.fault_type?.includes('HUMID') || payload.fault_type?.includes('THERMO'))) {
                    return (
                      <circle 
                        key={`dot-hum-${cx}-${cy}`} 
                        cx={cx} 
                        cy={cy} 
                        r={6} 
                        fill="#06b6d4" 
                        stroke="#fff" 
                        strokeWidth={2} 
                        className="animate-ping" 
                      />
                    );
                  }
                  return <circle key={`dot-hum-${cx}-${cy}`} cx={cx} cy={cy} r={2} fill="#06b6d4" opacity={0.6} />;
                }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Subtext info */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>* Dots with glowing halos indicate ML Isolation Forest flagged anomalies</span>
        <span>Total Anomalies Detected: <strong className="text-rose-400 font-bold">{anomalyCount}</strong></span>
      </div>
    </div>
  );
};

export default SensorCharts;