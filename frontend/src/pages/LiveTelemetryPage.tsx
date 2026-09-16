import React from 'react';
import { NavLink } from 'react-router-dom';
import type { 
  StationInfo, 
  StationHealth as StationHealthType, 
  TelemetryPoint 
} from '../types';
import StationHealth from '../components/StationHealth';
import SensorCharts from '../components/SensorCharts';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Thermometer, 
  Gauge, 
  Droplets, 
  Cpu, 
  FlaskConical, 
  Satellite, 
  TrendingUp, 
  Activity
} from 'lucide-react';

interface LiveTelemetryPageProps {
  currentStation: StationInfo;
  stationHealth: StationHealthType;
  telemetryData: TelemetryPoint[];
  totalReadingsScanned: number;
  isPaused: boolean;
  onTogglePause: () => void;
  streamIntervalMs: number;
  onChangeInterval: (ms: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onReset: () => void;
  isSatelliteAnchored?: boolean;
}

export const LiveTelemetryPage: React.FC<LiveTelemetryPageProps> = ({
  currentStation,
  stationHealth,
  telemetryData,
  totalReadingsScanned,
  isPaused,
  onTogglePause,
  streamIntervalMs,
  onChangeInterval,
  soundEnabled,
  onToggleSound,
  onReset,
  isSatelliteAnchored = true
}) => {
  const latestPoint = telemetryData[telemetryData.length - 1] || {
    temperature: 26.5,
    pressure: 1008.0,
    humidity: 62.0,
    anomaly_score: 0.0,
    is_anomaly: false
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stream Controls & Operational Status Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
            <h2 className="text-base font-bold text-white font-mono">
              REAL-TIME AWS MONITOR: {currentStation.id}
            </h2>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 font-semibold hidden md:inline">
            {currentStation.name} • {currentStation.state}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold hidden lg:flex items-center gap-1.5 shadow-sm">
            <Satellite className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            {isSatelliteAnchored ? 'ORBITAL SATELLITE ANCHOR: SYNCED' : 'ORBITAL SATELLITE LINK: SYNCING...'}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              isPaused 
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow-emerald' 
                : 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Stream Rate */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-0.5 flex text-xs font-mono">
            {[
              { label: '1s', val: 1000 },
              { label: '2s', val: 2000 },
              { label: '4s', val: 4000 },
            ].map(s => (
              <button
                key={s.val}
                onClick={() => onChangeInterval(s.val)}
                className={`px-2.5 py-1 rounded-lg text-[11px] transition-all ${
                  streamIntervalMs === s.val
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? "Mute Alert Audio" : "Enable Alert Audio"}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled 
                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            title="Reset Historical Buffer"
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Quick link to testing */}
          <NavLink
            to="/testing"
            className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Inject Fault &rarr;</span>
          </NavLink>
        </div>
      </div>

      {/* 1. Live Telemetry KPI Cards with rich image backgrounds */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ambient Temperature */}
        <div className="glass-panel glass-card-hover rounded-2xl p-4 relative overflow-hidden group">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-[0.14] group-hover:opacity-[0.25] transition-opacity duration-500 pointer-events-none scale-105"
            style={{ backgroundImage: `url('/assets/bg_thermal_radar.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950/95 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Ambient Temp
              </span>
              <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">
                {latestPoint.temperature.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-rose-300 font-mono">°C</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs font-mono border-t border-white/10 pt-2 text-slate-300">
              <span className="font-semibold">Zone: {currentStation.climate_zone}</span>
              <span className={`font-bold ${latestPoint.temperature > 45 || latestPoint.temperature < -10 ? 'text-rose-300' : 'text-emerald-300'}`}>
                {latestPoint.temperature > 45 ? 'Extreme High' : latestPoint.temperature < -10 ? 'Severe Cold' : 'Optimal'}
              </span>
            </div>
          </div>
        </div>

        {/* Barometric Pressure */}
        <div className="glass-panel glass-card-hover rounded-2xl p-4 relative overflow-hidden group">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-[0.14] group-hover:opacity-[0.25] transition-opacity duration-500 pointer-events-none scale-105"
            style={{ backgroundImage: `url('/assets/hero_bg.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950/95 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Atm. Pressure
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
                <Gauge className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">
                {latestPoint.pressure.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-emerald-300 font-mono">hPa</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs font-mono border-t border-white/10 pt-2 text-slate-300">
              <span className="font-semibold">Elev: {currentStation.elevation_m}m</span>
              <span className={`font-bold ${latestPoint.pressure < 980 && currentStation.elevation_m < 500 ? 'text-amber-300' : 'text-emerald-300'}`}>
                {latestPoint.pressure < 980 && currentStation.elevation_m < 500 ? 'Depression' : 'Compensated'}
              </span>
            </div>
          </div>
        </div>

        {/* Relative Humidity */}
        <div className="glass-panel glass-card-hover rounded-2xl p-4 relative overflow-hidden group">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-[0.14] group-hover:opacity-[0.25] transition-opacity duration-500 pointer-events-none scale-105"
            style={{ backgroundImage: `url('/assets/zone_coastal.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950/95 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Rel. Humidity
              </span>
              <div className="p-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">
                {latestPoint.humidity.toFixed(1)}
              </span>
              <span className="text-sm font-bold text-cyan-300 font-mono">% RH</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs font-mono border-t border-white/10 pt-2 text-slate-300">
              <span className="font-semibold">Shield: Active</span>
              <span className={`font-bold ${latestPoint.humidity >= 95 ? 'text-cyan-300' : 'text-slate-300'}`}>
                {latestPoint.humidity >= 95 ? 'Monsoon Saturated' : 'Nominal'}
              </span>
            </div>
          </div>
        </div>

        {/* ML Contamination Index & Extreme Detector */}
        <div className="glass-panel glass-card-hover rounded-2xl p-4 relative overflow-hidden group">
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-[0.14] group-hover:opacity-[0.25] transition-opacity duration-500 pointer-events-none scale-105"
            style={{ backgroundImage: `url('/assets/bg_radar_dome.jpg')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/50 to-slate-950/95 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                Anomaly & Drift Status
              </span>
              <div className="p-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black font-mono ${latestPoint.is_anomaly ? 'text-rose-300' : latestPoint.is_genuine_extreme ? 'text-cyan-300' : 'text-emerald-300'}`}>
                {latestPoint.anomaly_score !== undefined ? latestPoint.anomaly_score.toFixed(3) : '0.000'}
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">Score</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-xs font-mono border-t border-white/10 pt-2 text-slate-300">
              <span className="font-semibold">Scanned: {totalReadingsScanned}</span>
              <span className={`px-2 py-0.5 rounded font-bold text-xs ${
                latestPoint.is_anomaly ? 'bg-rose-500/25 text-rose-200 border border-rose-500/40' :
                latestPoint.is_genuine_extreme ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-500/40' :
                'bg-emerald-500/25 text-emerald-200 border border-emerald-500/40'
              }`}>
                {latestPoint.is_anomaly ? 'FAULT' : latestPoint.is_genuine_extreme ? 'GENUINE EXTREME' : 'NORMAL'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Station Health Diagnostic HUD */}
      <div>
        <StationHealth 
          health={stationHealth} 
          stationId={currentStation.id}
          stationName={currentStation.name}
          stationState={currentStation.state}
          climateZone={currentStation.climate_zone}
          elevation_m={currentStation.elevation_m}
          isEdgeMode={currentStation.is_edge_mode}
          uptimeSeconds={stationHealth.uptime_seconds}
        />
      </div>

      {/* 3. Sensor Charts Stream */}
      <div>
        <SensorCharts 
          data={telemetryData} 
          isDetecting={!isPaused}
          anomalyCount={telemetryData.filter(d => d.is_anomaly).length}
        />
      </div>

      {/* 4. Quick Links & Live Features Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NavLink
          to="/live-feed"
          className="glass-panel p-5 rounded-2xl hover:border-cyan-500/50 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 group-hover:scale-110 transition-transform">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">Live Satellite Feed</h4>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">Real-time synoptic satellite telemetry and forecast models</p>
            </div>
          </div>
          <span className="text-cyan-400 font-bold text-base group-hover:translate-x-1 transition-transform">&rarr;</span>
        </NavLink>

        <NavLink
          to="/drift"
          className="glass-panel p-5 rounded-2xl hover:border-purple-500/50 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">CUSUM Drift Analytics</h4>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">Detect gradual +0.05°C/day calibration drift</p>
            </div>
          </div>
          <span className="text-purple-400 font-bold text-base group-hover:translate-x-1 transition-transform">&rarr;</span>
        </NavLink>

        <NavLink
          to="/testing"
          className="glass-panel p-5 rounded-2xl hover:border-emerald-500/50 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 group-hover:scale-110 transition-transform">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">Testing & Fault Lab</h4>
              <p className="text-xs text-slate-200 mt-1 leading-relaxed">Inject monsoon extremes, spikes & frozen sensors</p>
            </div>
          </div>
          <span className="text-emerald-400 font-bold text-base group-hover:translate-x-1 transition-transform">&rarr;</span>
        </NavLink>
      </div>

      {/* 5. Telemetry Live Log Table */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white font-mono">RECENT SCAN BUFFER</h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300">
              {telemetryData.length} records
            </span>
          </div>
          <span className="text-xs text-slate-200 font-mono font-semibold">
            Sampling: {streamIntervalMs / 1000}s
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950 text-slate-200 font-mono font-bold border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2.5">Timestamp</th>
                <th className="px-3 py-2.5">Temp (°C)</th>
                <th className="px-3 py-2.5">Press (hPa)</th>
                <th className="px-3 py-2.5">Humidity (%)</th>
                <th className="px-3 py-2.5">AI Classification</th>
                <th className="px-3 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {telemetryData.slice(-8).reverse().map((pt, idx) => (
                <tr key={idx} className="hover:bg-slate-900/40 transition-colors">
                  <td className="px-3 py-2 text-slate-400">
                    {pt.timestamp ? new Date(pt.timestamp).toLocaleTimeString() : '--'}
                  </td>
                  <td className="px-3 py-2 text-white font-bold">{pt.temperature.toFixed(1)}</td>
                  <td className="px-3 py-2 text-white">{pt.pressure.toFixed(1)}</td>
                  <td className="px-3 py-2 text-white">{pt.humidity.toFixed(1)}</td>
                  <td className="px-3 py-2 text-slate-400">
                    {pt.anomaly_score !== undefined ? pt.anomaly_score.toFixed(3) : '0.000'}
                  </td>
                  <td className="px-3 py-2">
                    {pt.is_anomaly ? (
                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                        {pt.fault_type || 'ANOMALY'}
                      </span>
                    ) : pt.is_genuine_extreme ? (
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                        GENUINE EXTREME
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-semibold">
                        NOMINAL
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LiveTelemetryPage;
