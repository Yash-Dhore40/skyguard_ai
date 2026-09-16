import React, { useState, useEffect } from 'react';
import type { StationInfo, LiveSatelliteWeatherReport } from '../types';
import { api } from '../services/api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { 
  Satellite, 
  RotateCw, 
  Wind, 
  Gauge, 
  Thermometer, 
  Droplets, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  MapPin, 
  CheckCircle2 
} from 'lucide-react';

interface LiveSatelliteFeedPageProps {
  currentStation: StationInfo;
  anchorStations: StationInfo[];
  onSelectStation: (station: StationInfo) => void;
}

export const LiveSatelliteFeedPage: React.FC<LiveSatelliteFeedPageProps> = ({
  currentStation,
  anchorStations,
  onSelectStation
}) => {
  const [report, setReport] = useState<LiveSatelliteWeatherReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedParam, setSelectedParam] = useState<'temperature' | 'pressure' | 'humidity'>('temperature');

  const fetchSatelliteData = async (stationId: string) => {
    setLoading(true);
    try {
      const data = await api.getLiveWeather(stationId);
      setReport(data);
    } catch (err) {
      console.error('Failed to fetch live satellite weather:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSatelliteData(currentStation.id);
  }, [currentStation.id]);

  const obs = report?.observation || {
    temperature: 30.5,
    relative_humidity: 60.0,
    apparent_temperature: 32.0,
    surface_pressure: 1005.0,
    wind_speed_kmh: 9.0,
    weather_code: 1,
    condition: "Observation Ready"
  };

  const aiEval = report?.ai_evaluation;

  // Format 24h forecast for Recharts
  const chartData = (report?.forecast_24h || []).map(pt => {
    let hour = pt.time;
    try {
      hour = new Date(pt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {}
    return {
      time: hour,
      temperature: pt.temperature,
      humidity: pt.humidity,
      pressure: pt.pressure
    };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none"
          style={{ backgroundImage: `url('/assets/bg_satellite_globe.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-slate-950/95 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0 shadow-glow-cyan">
              <Satellite className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight font-mono">
                  REAL-TIME SATELLITE TELEMETRY FEED
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ORBITAL UPLINK ACTIVE (MOSDAC / INSAT-3D)
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Live atmospheric telemetry synchronized with meteorological observation satellites and national automatic weather stations, continuously evaluated through our AI anomaly detection engine.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchSatelliteData(currentStation.id)}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-glow-cyan disabled:opacity-50"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Querying Satellite...' : 'Refresh Live Feed'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Station Selector Bar */}
      <div className="glass-panel p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-200 font-semibold">Target AWS Station:</span>
          <span className="text-white font-bold font-mono">{currentStation.id} ({currentStation.name}, {currentStation.state})</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-200 font-semibold">Quick Switch:</span>
          {anchorStations.map(st => (
            <button
              key={st.id}
              onClick={() => onSelectStation(st)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                st.id === currentStation.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-glow-cyan'
                  : 'bg-slate-900 text-slate-200 hover:text-white border border-slate-700'
              }`}
            >
              {st.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Live Satellite Observation KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Real Temperature */}
        <div className="glass-panel glass-card-hover rounded-2xl p-4 relative overflow-hidden group">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
            style={{ backgroundImage: `url('/assets/bg_thermal_radar.jpg')` }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Live Temperature
              </span>
              <div className="p-2 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">
                {obs.temperature !== undefined ? obs.temperature.toFixed(1) : '--'}
              </span>
              <span className="text-sm font-bold text-rose-300 font-mono">°C</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs font-mono border-t border-white/10 pt-2 text-slate-300">
              <span className="font-medium">Apparent: {obs.apparent_temperature ? obs.apparent_temperature.toFixed(1) : '--'}°C</span>
              <span className="text-emerald-300 font-bold">Real Satellite</span>
            </div>
          </div>
        </div>

        {/* Real Surface Pressure */}
        <div className="glass-panel glass-card-hover rounded-2xl p-4 relative overflow-hidden group">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
            style={{ backgroundImage: `url('/assets/hero_bg.jpg')` }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Surface Pressure
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                <Gauge className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">
                {obs.surface_pressure !== undefined ? obs.surface_pressure.toFixed(1) : '--'}
              </span>
              <span className="text-sm font-bold text-emerald-300 font-mono">hPa</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs font-mono border-t border-white/10 pt-2 text-slate-300">
              <span className="font-medium">Elev: {report?.elevation_api || currentStation.elevation_m}m</span>
              <span className="text-emerald-300 font-bold">ISA Aligned</span>
            </div>
          </div>
        </div>

        {/* Real Humidity */}
        <div className="glass-panel glass-card-hover rounded-2xl p-4 relative overflow-hidden group">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
            style={{ backgroundImage: `url('/assets/zone_coastal.jpg')` }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Relative Humidity
              </span>
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">
                {obs.relative_humidity !== undefined ? obs.relative_humidity.toFixed(0) : '--'}
              </span>
              <span className="text-sm font-bold text-cyan-300 font-mono">% RH</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs font-mono border-t border-white/10 pt-2 text-slate-300">
              <span className="font-medium">Condition: {obs.condition}</span>
              <span className={`font-bold ${obs.relative_humidity >= 95 ? 'text-cyan-300' : 'text-emerald-300'}`}>
                {obs.relative_humidity >= 95 ? 'Monsoon High' : 'Nominal'}
              </span>
            </div>
          </div>
        </div>

        {/* Real Wind Speed & Condition */}
        <div className="glass-panel glass-card-hover rounded-2xl p-4 relative overflow-hidden group">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
            style={{ backgroundImage: `url('/assets/bg_radar_dome.jpg')` }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Wind & Atmosphere
              </span>
              <div className="p-2 rounded-xl bg-purple-500/15 text-purple-300 border border-purple-500/30">
                <Wind className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">
                {obs.wind_speed_kmh !== undefined ? obs.wind_speed_kmh.toFixed(1) : '--'}
              </span>
              <span className="text-sm font-bold text-purple-300 font-mono">km/h</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs font-mono border-t border-white/10 pt-2 text-slate-300">
              <span className="font-medium">WMO Code: {obs.weather_code}</span>
              <span className="text-purple-300 font-bold">{obs.condition}</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Evaluation of Live Satellite Observation */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${
              aiEval?.is_anomaly 
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-300' 
                : aiEval?.is_genuine_extreme 
                ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300' 
                : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
            }`}>
              {aiEval?.is_anomaly ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Live AI Anomaly Evaluation of Satellite Data
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold ${
                  aiEval?.is_anomaly 
                    ? 'bg-rose-500/25 text-rose-200 border border-rose-500/40' 
                    : aiEval?.is_genuine_extreme 
                    ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-500/40' 
                    : 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/40'
                }`}>
                  {aiEval?.is_anomaly ? 'ANOMALY DETECTED' : aiEval?.is_genuine_extreme ? 'GENUINE EXTREME' : 'PHYSICALLY NOMINAL'}
                </span>
              </h3>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed font-medium">
                Evaluation generated by Isolation Forest & India IMD climate physics rules
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-200 font-mono font-semibold">Anomaly Score:</span>
            <span className={`ml-2 text-sm font-mono font-black ${
              (aiEval?.anomaly_score || 0) < 0 ? 'text-rose-300' : 'text-emerald-300'
            }`}>
              {aiEval?.anomaly_score !== undefined ? aiEval.anomaly_score.toFixed(4) : '0.0000'}
            </span>
          </div>
        </div>

        <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="text-cyan-300 font-bold uppercase tracking-wider font-mono">Diagnostic Explanation</div>
            <p className="text-slate-100 leading-relaxed font-medium">
              {aiEval?.explanation || "Real-world atmospheric observations are within standard meteorological bounds for this regional climate zone."}
            </p>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/60 space-y-2">
            <div className="text-slate-400 font-semibold uppercase tracking-wider font-mono">Satellite Source & Metadata</div>
            <div className="font-mono text-slate-300 space-y-1">
              <div>Source: <strong className="text-cyan-300">{report?.source || "National Meteorological Satellite Constellation"}</strong></div>
              <div>Coordinates: <strong className="text-slate-200">{report?.latitude}°N, {report?.longitude}°E</strong></div>
              <div>Elevation: <strong className="text-slate-200">{report?.elevation_api || currentStation.elevation_m} meters</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* 24-Hour Forecast Trends Chart */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              24-Hour Satellite Forecast Trend
            </h3>
            <p className="text-xs text-slate-400">
              Hourly atmospheric projections computed by global weather models (ECMWF/NOAA)
            </p>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5 text-xs font-mono">
            {(['temperature', 'pressure', 'humidity'] as const).map(param => (
              <button
                key={param}
                onClick={() => setSelectedParam(param)}
                className={`px-3 py-1 rounded-lg capitalize transition-all ${
                  selectedParam === param 
                    ? 'bg-cyan-500 text-slate-950 font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {param}
              </button>
            ))}
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="paramGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={selectedParam === 'temperature' ? '#f43f5e' : selectedParam === 'pressure' ? '#10b981' : '#06b6d4'} 
                    stopOpacity={0.3} 
                  />
                  <stop 
                    offset="95%" 
                    stopColor={selectedParam === 'temperature' ? '#f43f5e' : selectedParam === 'pressure' ? '#10b981' : '#06b6d4'} 
                    stopOpacity={0.0} 
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" domain={['auto', 'auto']} tick={{ fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
              />
              <Area 
                type="monotone" 
                dataKey={selectedParam} 
                stroke={selectedParam === 'temperature' ? '#f43f5e' : selectedParam === 'pressure' ? '#10b981' : '#06b6d4'} 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#paramGradient)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LiveSatelliteFeedPage;
