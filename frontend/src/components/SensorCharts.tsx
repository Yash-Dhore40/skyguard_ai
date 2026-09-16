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
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
      {/* Subtle Atmospheric Thermal Radar Image Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.06] group-hover:opacity-[0.10] transition-opacity duration-700 pointer-events-none scale-105"
        style={{ backgroundImage: `url('/assets/bg_thermal_radar.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/80 to-slate-950/95 pointer-events-none" />

      {/* Header with Title and Interactive Chart Filters */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
              showTemp 
                ? 'bg-rose-500/25 border-rose-500/50 text-rose-200 shadow-sm' 
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" />
            Temp
            {showTemp ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>

          {/* Pressure Toggle */}
          <button
            onClick={() => setShowPressure(!showPressure)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
              showPressure 
                ? 'bg-emerald-500/25 border-emerald-500/50 text-emerald-200 shadow-sm' 
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            Pressure
            {showPressure ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>

          {/* Humidity Toggle */}
          <button
            onClick={() => setShowHumidity(!showHumidity)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition-all ${
              showHumidity 
                ? 'bg-cyan-500/25 border-cyan-500/50 text-cyan-200 shadow-sm' 
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            Humidity
            {showHumidity ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>

          {/* Window size controls */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 ml-auto text-xs font-mono font-bold">
            {[15, 30, 60].map((pts) => (
              <button
                key={pts}
                onClick={() => setPointsWindow(pts)}
                className={`px-2.5 py-1 rounded transition-colors ${
                  pointsWindow === pts 
                    ? 'bg-cyan-500 text-slate-950 font-bold' 
                    : 'text-slate-200 hover:text-white'
                }`}
              >
                {pts}pts
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Multi-Metric Chart Canvas */}
      <div className="h-[340px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              {/* Temperature Gradient */}
              <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>

              {/* Pressure Gradient */}
              <linearGradient id="pressureGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>

              {/* Humidity Gradient */}
              <linearGradient id="humidityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.08)" vertical={false} />
            
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 11, fill: '#cbd5e1', fontFamily: 'JetBrains Mono', fontWeight: 600 }} 
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
              tickLine={false}
            />
            
            <YAxis 
              tick={{ fontSize: 11, fill: '#cbd5e1', fontFamily: 'JetBrains Mono', fontWeight: 600 }} 
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.2)' }}
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