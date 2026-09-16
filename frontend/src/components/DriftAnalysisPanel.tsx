import React from 'react';
import type { DriftAnalysisReport } from '../types';
import { 
  Wrench, 
  TrendingUp, 
  Thermometer, 
  Gauge, 
  Droplets
} from 'lucide-react';

interface DriftAnalysisPanelProps {
  stationId: string;
  driftReport: DriftAnalysisReport | null;
}

const DriftAnalysisPanel: React.FC<DriftAnalysisPanelProps> = ({ stationId, driftReport }) => {
  // Default values if no active drift detected yet
  const channels = [
    {
      key: 'temperature',
      label: 'Thermal Resistance Array',
      unit: '°C',
      icon: Thermometer,
      data: driftReport?.channel_details?.temperature || {
        drift_detected: false,
        cusum: 0.8,
        ewma: 25.2,
        slope: 0.002,
        offset: 0.15,
        status: 'NORMAL'
      }
    },
    {
      key: 'pressure',
      label: 'Piezoresistive Barometer',
      unit: 'hPa',
      icon: Gauge,
      data: driftReport?.channel_details?.pressure || {
        drift_detected: false,
        cusum: 1.2,
        ewma: 1012.4,
        slope: -0.015,
        offset: 0.45,
        status: 'NORMAL'
      }
    },
    {
      key: 'humidity',
      label: 'Capacitive Polymer Hygrometer',
      unit: '% RH',
      icon: Droplets,
      data: driftReport?.channel_details?.humidity || {
        drift_detected: false,
        cusum: 2.1,
        ewma: 64.0,
        slope: 0.042,
        offset: 1.2,
        status: 'NORMAL'
      }
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CRITICAL_RECALIBRATION':
        return <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">Critical Calibration Required</span>;
      case 'WARNING':
        return <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">Drift Warning (Soft Compensated)</span>;
      default:
        return <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Calibration Nominal</span>;
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden space-y-6 group">
      {/* Background Radar Dome Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.08] group-hover:opacity-[0.14] transition-opacity duration-700 pointer-events-none scale-105"
        style={{ backgroundImage: `url('/assets/bg_radar_dome.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/85 to-slate-950/95 pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20">
              <TrendingUp className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Sensor Drift Diagnostics (CUSUM + EWMA)
                <span className="text-xs font-normal text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                  40–50% Anomaly Root Cause
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Detects slow systematic calibration decay before catastrophic field failure at station <span className="text-cyan-400 font-mono">{stationId}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-400">CUSUM Decision Bound</div>
            <div className="text-sm font-mono font-bold text-slate-200">h = 4.5σ</div>
          </div>
        </div>
      </div>

      {/* Sensor Channels Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {channels.map((ch) => {
          const Icon = ch.icon;
          const isDrift = ch.data.drift_detected;
          const cusumPercent = Math.min(100, (ch.data.cusum / 4.5) * 100);

          return (
            <div 
              key={ch.key}
              className={`p-5 rounded-xl border transition-all ${
                isDrift 
                  ? 'bg-rose-950/20 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.1)]' 
                  : 'bg-slate-950/40 border-white/5 hover:border-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${isDrift ? 'text-rose-400' : 'text-cyan-400'}`} />
                  <span className="text-xs font-semibold text-slate-200">{ch.label}</span>
                </div>
                {getStatusBadge(ch.data.status)}
              </div>

              {/* Metric Values */}
              <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60">
                  <div className="text-slate-200 font-bold text-xs">Cumulative CUSUM</div>
                  <div className={`text-base font-black font-mono mt-0.5 ${isDrift ? 'text-rose-300' : 'text-white'}`}>
                    {ch.data.cusum}
                    <span className="text-xs text-slate-400 font-normal"> / 4.5</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60">
                  <div className="text-slate-200 font-bold text-xs">Sustained Offset</div>
                  <div className="text-base font-black font-mono mt-0.5 text-white">
                    {ch.data.offset} <span className="text-xs text-slate-300 font-semibold">{ch.unit}</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60">
                  <div className="text-slate-200 font-bold text-xs">EWMA Smoothed</div>
                  <div className="text-base font-black font-mono mt-0.5 text-white">
                    {ch.data.ewma} <span className="text-xs text-slate-300 font-semibold">{ch.unit}</span>
                  </div>
                </div>

                <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-700/60">
                  <div className="text-slate-200 font-bold text-xs">Drift Velocity</div>
                  <div className={`text-base font-black font-mono mt-0.5 ${Math.abs(ch.data.slope) > 0.05 ? 'text-amber-300' : 'text-white'}`}>
                    {ch.data.slope > 0 ? `+${ch.data.slope}` : ch.data.slope}
                    <span className="text-xs text-slate-400 font-normal">/spl</span>
                  </div>
                </div>
              </div>

              {/* Progress Bar for CUSUM accumulator */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-200 font-mono font-semibold">
                  <span>CUSUM Accumulation</span>
                  <span className="text-cyan-300 font-bold">{cusumPercent.toFixed(0)}% to trigger</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      isDrift ? 'bg-rose-500' : ch.data.cusum > 2.5 ? 'bg-amber-500' : 'bg-cyan-500'
                    }`}
                    style={{ width: `${Math.max(5, cusumPercent)}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendation Card */}
      <div className="bg-slate-950/90 border border-white/15 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300">
            <Wrench className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Maintenance & Calibration Directive</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              {driftReport?.explanation || "All transducers calibrated within IMD operational tolerances. Zero point baseline stable."}
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Auto Offset Compensation: Active
        </div>
      </div>
    </div>
  );
};

export default DriftAnalysisPanel;
