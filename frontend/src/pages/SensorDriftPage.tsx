import React from 'react';
import type { DriftAnalysisReport, StationInfo } from '../types';
import DriftAnalysisPanel from '../components/DriftAnalysisPanel';
import { TrendingUp, Wrench, CheckCircle2, Clock } from 'lucide-react';

interface SensorDriftPageProps {
  currentStation: StationInfo;
  driftReport: DriftAnalysisReport | null;
}

export const SensorDriftPage: React.FC<SensorDriftPageProps> = ({
  currentStation,
  driftReport
}) => {
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
              <TrendingUp className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight font-mono">
                  SENSOR DRIFT DIAGNOSTICS & CUSUM CHARTS
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-purple-500/10 border border-purple-500/30 text-purple-300">
                  DECISION BOUND h=4.5σ
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                40% to 50% of real-world automated weather station anomalies stem from slow, systematic sensor drift (e.g. +0.05°C/day creep) that point-in-time thresholding misses. Our CUSUM control charts isolate cumulative bias before catastrophic field failure.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Drift Panel */}
      <div>
        <DriftAnalysisPanel 
          stationId={currentStation.id} 
          driftReport={driftReport} 
        />
      </div>

      {/* Sensor Calibration Guide & Best Practices */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm font-mono">
            <Clock className="w-4 h-4" />
            <span>CUSUM Early Warning</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Standard ML models only trigger when a reading crosses hard 3σ envelopes. CUSUM accumulates persistent small deviations ($k=0.5\sigma$, $h=4.5\sigma$) to give 7–14 days advance warning of sensor wear.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-sm font-mono">
            <Wrench className="w-4 h-4" />
            <span>Soft Compensation</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            When gradual drift is confirmed ($S_H &gt; 4.5$), the system generates mathematical calibration offset coefficients, permitting continuous operation until physical maintenance arrives on site.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>IMD Calibration Cycle</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Fully compatible with India Meteorological Department 6-month recalibration routines, automatically scheduling prioritized work orders for degraded stations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SensorDriftPage;
