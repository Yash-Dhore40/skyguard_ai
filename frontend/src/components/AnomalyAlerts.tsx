import React from 'react';
import type { AnomalyIncident } from '../types';
import { 
  AlertTriangle, 
  Flame, 
  Wind, 
  Droplets, 
  Snowflake, 
  Zap, 
  HelpCircle,
  Download,
  Trash2,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

interface AnomalyAlertsProps {
  anomalies: AnomalyIncident[];
  onClear: () => void;
}

const AnomalyAlerts: React.FC<AnomalyAlertsProps> = ({ anomalies, onClear }) => {
  const getFaultMeta = (type: string | null) => {
    if (!type) return { icon: HelpCircle, color: 'text-slate-400', border: 'border-slate-700', bg: 'bg-slate-800/40' };
    const t = type.toUpperCase();
    if (t.includes('TEMP')) {
      return { icon: Flame, color: 'text-rose-400', border: 'border-rose-500/40', bg: 'bg-rose-500/10' };
    }
    if (t.includes('PRESS')) {
      return { icon: Wind, color: 'text-emerald-400', border: 'border-emerald-500/40', bg: 'bg-emerald-500/10' };
    }
    if (t.includes('HUMID')) {
      return { icon: Droplets, color: 'text-blue-400', border: 'border-blue-500/40', bg: 'bg-blue-500/10' };
    }
    if (t.includes('FROZEN')) {
      return { icon: Snowflake, color: 'text-sky-300', border: 'border-sky-500/40', bg: 'bg-sky-500/10' };
    }
    if (t.includes('THERMO')) {
      return { icon: Zap, color: 'text-purple-400', border: 'border-purple-500/40', bg: 'bg-purple-500/10' };
    }
    return { icon: AlertTriangle, color: 'text-amber-400', border: 'border-amber-500/40', bg: 'bg-amber-500/10' };
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(anomalies, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `skyguard-incident-report-${new Date().toISOString()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header & Actions */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-wide">
                  AI Anomaly & Diagnostics Console
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  {anomalies.length} INCIDENTS
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-time fault classification with self-healing correction suggestions
              </p>
            </div>
          </div>

          {/* Action buttons: Clear & Export */}
          <div className="flex items-center gap-1.5">
            {anomalies.length > 0 && (
              <>
                <button
                  onClick={handleExportJSON}
                  title="Export incidents as JSON"
                  className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-300 hover:border-cyan-500/40 transition-all text-xs flex items-center gap-1 font-mono"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button
                  onClick={onClear}
                  title="Clear anomaly history"
                  className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 transition-all text-xs flex items-center gap-1 font-mono"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Incidents Feed */}
        {anomalies.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-xl bg-slate-900/40 border border-dashed border-slate-800">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-white mb-1">
              Zero Active Anomalies
            </h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              All weather sensors are operating inside nominal statistical thresholds. Trigger a simulation in the Fault Lab to test detection.
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            {anomalies.map((item) => {
              const meta = getFaultMeta(item.fault_type);
              const Icon = meta.icon;
              const formattedTime = new Date(item.timestamp).toLocaleTimeString([], { 
                hour12: false, 
                hour: '2-digit', 
                minute: '2-digit', 
                second: '2-digit' 
              });

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border ${meta.border} ${meta.bg} backdrop-blur-sm transition-all hover:border-opacity-80`}
                >
                  {/* Top Bar: Title, Timestamp, Confidence */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${meta.color}`} />
                      <span className="font-bold text-xs text-white font-mono">
                        {item.fault_type || 'ANOMALY_DETECTED'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">
                        {formattedTime}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                        item.confidence >= 0.9 
                          ? 'bg-rose-500/30 text-rose-300' 
                          : 'bg-amber-500/30 text-amber-300'
                      }`}>
                        {Math.round(item.confidence * 100)}% Conf.
                      </span>
                    </div>
                  </div>

                  {/* Explanation */}
                  <p className="text-xs text-slate-300 mb-2 leading-relaxed">
                    {item.explanation}
                  </p>

                  {/* Side-by-side Telemetry: Raw vs Corrected */}
                  {item.corrected_values && (
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-2.5 font-mono text-[11px] space-y-1">
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                        <span>Autonomous Self-Healing Vector</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {/* Temperature */}
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400">Temp</span>
                          <div className="flex items-center gap-1">
                            <span className="text-rose-400 line-through">
                              {item.reading.temperature.toFixed(1)}°
                            </span>
                            <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                            <span className="text-emerald-400 font-bold">
                              {item.corrected_values.temperature.toFixed(1)}°C
                            </span>
                          </div>
                        </div>

                        {/* Pressure */}
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400">Pressure</span>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-300">
                              {item.reading.pressure.toFixed(1)}
                            </span>
                            <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                            <span className="text-emerald-400 font-bold">
                              {item.corrected_values.pressure.toFixed(1)} hPa
                            </span>
                          </div>
                        </div>

                        {/* Humidity */}
                        <div className="flex flex-col">
                          <span className="text-[10px] text-slate-400">Humidity</span>
                          <div className="flex items-center gap-1">
                            <span className="text-blue-400">
                              {item.reading.humidity.toFixed(1)}%
                            </span>
                            <ArrowRight className="w-2.5 h-2.5 text-slate-500" />
                            <span className="text-emerald-400 font-bold">
                              {item.corrected_values.humidity.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Inference Engine: FastAPIServer + Scikit-Learn</span>
        <span>Auto-Rollout: Active</span>
      </div>
    </div>
  );
};

export default AnomalyAlerts;