import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import type { SensorReading, StationInfo, AnomalyIncident } from '../types';
import FaultLab from '../components/FaultLab';
import { 
  FlaskConical, 
  ArrowRight,
  Zap
} from 'lucide-react';

interface TestingLabPageProps {
  currentStation: StationInfo;
  onInjectFault: (reading: SensorReading) => Promise<void>;
  isInjecting: boolean;
  recentAnomalies: AnomalyIncident[];
}

export const TestingLabPage: React.FC<TestingLabPageProps> = ({
  currentStation,
  onInjectFault,
  isInjecting,
  recentAnomalies
}) => {
  const [lastInjectedReading, setLastInjectedReading] = useState<SensorReading | null>(null);

  const handleInjectWrapper = async (reading: SensorReading) => {
    setLastInjectedReading(reading);
    await onInjectFault(reading);
  };

  const latestAnomaly = recentAnomalies[recentAnomalies.length - 1];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none"
          style={{ backgroundImage: `url('/assets/bg_radar_dome.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-slate-950/95 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shrink-0 shadow-glow-purple">
              <FlaskConical className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-white tracking-tight font-mono">
                  METEOROLOGICAL FAULT & SCENARIO TESTING LAB
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  INTERACTIVE STRESS SUITE
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Dedicated testing sandbox to stress test the AI anomaly detection engine against genuine Indian meteorological extremes (SW Monsoon, Thar heatwaves, Himalayan altitude) versus genuine hardware failure modes (drift, spikes, frozen sensors).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <NavLink
              to="/incidents"
              className="px-4 py-2 rounded-xl bg-slate-900 border border-white/10 hover:border-white/20 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
            >
              <span>Incident Console ({recentAnomalies.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Target Station Context Banner */}
      <div className="glass-panel p-4 rounded-xl flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-slate-200 font-semibold">Target Station for Testing:</span>
          <strong className="text-cyan-300 font-black">{currentStation.id} ({currentStation.name})</strong>
          <span className="text-cyan-400 font-bold">•</span>
          <span>Zone: <strong className="text-white font-bold">{currentStation.climate_zone}</strong></span>
          <span className="text-cyan-400 font-bold">•</span>
          <span>Elevation: <strong className="text-white font-bold">{currentStation.elevation_m}m</strong></span>
        </div>
        <span className="text-slate-200 font-medium hidden sm:inline">
          ISA Barometric Lapse Rate & Monsoon Saturation Rules Active
        </span>
      </div>

      {/* Main Fault Lab Component */}
      <div>
        <FaultLab 
          onInjectFault={handleInjectWrapper}
          isInjecting={isInjecting}
          currentStationId={currentStation.id}
          currentClimateZone={currentStation.climate_zone}
        />
      </div>

      {/* Real-time Response HUD */}
      {lastInjectedReading && (
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono">LATEST INJECTION DIAGNOSTIC RESPONSE</h3>
            </div>
            <span className="text-xs text-slate-200 font-mono font-semibold">
              Tested at {new Date().toLocaleTimeString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60">
              <span className="text-slate-300 font-semibold">Injected Temp:</span>
              <div className="text-base font-black text-white mt-0.5">{lastInjectedReading.temperature}°C</div>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60">
              <span className="text-slate-300 font-semibold">Injected Pressure:</span>
              <div className="text-base font-black text-white mt-0.5">{lastInjectedReading.pressure} hPa</div>
            </div>
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60">
              <span className="text-slate-300 font-semibold">Injected Humidity:</span>
              <div className="text-base font-black text-white mt-0.5">{lastInjectedReading.humidity}% RH</div>
            </div>
            <div className={`p-3 rounded-xl border font-bold flex flex-col justify-center ${
              latestAnomaly?.is_anomaly 
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-200' 
                : latestAnomaly?.is_genuine_extreme 
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-200' 
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-200'
            }`}>
              <span className="text-xs uppercase font-bold text-slate-300">Model Decision:</span>
              <div className="text-sm mt-0.5 font-black">
                {latestAnomaly?.is_anomaly 
                  ? `FAULT: ${latestAnomaly.fault_type}` 
                  : latestAnomaly?.is_genuine_extreme 
                  ? 'GENUINE EXTREME (PASSED)' 
                  : 'NORMAL'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestingLabPage;
