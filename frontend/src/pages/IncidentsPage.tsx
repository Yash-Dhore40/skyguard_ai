import React from 'react';
import type { AnomalyIncident } from '../types';
import AnomalyAlerts from '../components/AnomalyAlerts';
import { AlertTriangle, ShieldCheck } from 'lucide-react';

interface IncidentsPageProps {
  anomalies: AnomalyIncident[];
  onClearAnomalies: () => void;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  anomalies,
  onClearAnomalies
}) => {
  const genuineExtremesCount = anomalies.filter(a => a.is_genuine_extreme).length;
  const criticalCount = anomalies.filter(a => a.is_anomaly && a.confidence > 0.85).length;

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
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shrink-0 shadow-glow-rose">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight font-mono">
                  ANOMALY INCIDENTS & ROOT-CAUSE CONSOLE
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-rose-500/10 border border-rose-500/30 text-rose-300">
                  {anomalies.length} LOGGED
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Full forensic audit trail of all detected sensor anomalies, CUSUM drift detections, and genuine meteorological extreme events with self-healing correction recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Summary Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-white/5 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-slate-400 uppercase">Total Incidents</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">{anomalies.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-800 text-slate-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-rose-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-rose-400 uppercase">High Confidence Faults</div>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-0.5">{criticalCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-cyan-500/20 flex items-center justify-between">
          <div>
            <div className="text-xs font-mono text-cyan-400 uppercase">Genuine Climate Extremes</div>
            <div className="text-2xl font-bold font-mono text-cyan-400 mt-0.5">{genuineExtremesCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Anomaly Alerts List & Details */}
      <div>
        <AnomalyAlerts 
          anomalies={anomalies} 
          onClear={onClearAnomalies} 
        />
      </div>
    </div>
  );
};

export default IncidentsPage;
