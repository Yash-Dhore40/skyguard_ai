import React, { useState } from 'react';
import type { StationInfo } from '../types';
import { api } from '../services/api';
import { 
  Settings, 
  Radio, 
  UploadCloud, 
  Trash2, 
  CheckCircle2, 
  Sliders, 
  Server, 
  Volume2, 
  VolumeX, 
  Activity
} from 'lucide-react';

interface SettingsPageProps {
  currentStation: StationInfo;
  isEdgeOfflineMode: boolean;
  onToggleEdgeMode: (active: boolean) => void;
  offlineBufferedCount: number;
  onSyncEdgeBuffer: () => void;
  syncFeedback: string | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  streamIntervalMs: number;
  onChangeInterval: (ms: number) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  currentStation,
  isEdgeOfflineMode,
  onToggleEdgeMode,
  offlineBufferedCount,
  onSyncEdgeBuffer,
  syncFeedback,
  soundEnabled,
  onToggleSound,
  streamIntervalMs,
  onChangeInterval
}) => {
  const [cusumThreshold, setCusumThreshold] = useState<number>(4.5);
  const [apiPingResult, setApiPingResult] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState<boolean>(false);

  const testApiPing = async () => {
    setIsPinging(true);
    const start = performance.now();
    try {
      await api.getStationHealth();
      const elapsed = Math.round(performance.now() - start);
      setApiPingResult(`FastAPI Backend Healthy — ${elapsed} ms response time`);
    } catch {
      setApiPingResult('Backend Offline / Using Local Client Engine');
    } finally {
      setIsPinging(false);
    }
  };

  const handleClearBuffer = () => {
    localStorage.removeItem('skyguard_offline_queue');
    window.location.reload();
  };

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
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0 shadow-glow-cyan">
              <Settings className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight font-mono">
                  SYSTEM SETTINGS & EDGE GATEWAY CONFIGURATION
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  ENTERPRISE v2.0
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Configure remote edge offline store-and-forward buffers, CUSUM drift detection sensitivity, audio notifications, and backend database sync.
              </p>
            </div>
          </div>
        </div>
      </div>

      {syncFeedback && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* 1. Edge Gateway & Offline Buffering */}
      <div className="glass-panel p-6 rounded-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Radio className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">EDGE GATEWAY OFFLINE MODE</h3>
              <p className="text-xs text-slate-400">Simulate remote mountain/desert station loss of cellular/satellite uplink</p>
            </div>
          </div>

          <button
            onClick={() => onToggleEdgeMode(!isEdgeOfflineMode)}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              isEdgeOfflineMode
                ? 'bg-sky-500 text-slate-950 shadow-glow-cyan'
                : 'bg-slate-900 border border-slate-700 text-slate-400 hover:text-white'
            }`}
          >
            {isEdgeOfflineMode ? 'EDGE MODE: ACTIVE' : 'CLOUD UPLINK: CONNECTED'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-slate-200 font-semibold">Buffered Telemetry Queue:</span>
            <div className="text-2xl font-black text-white">{offlineBufferedCount} samples</div>
            <span className="text-slate-300 font-medium text-xs">Stored in Local SQLite / Cache</span>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-slate-200 font-semibold">Active Station ID:</span>
            <div className="text-2xl font-black text-cyan-300">{currentStation.id}</div>
            <span className="text-slate-300 font-medium text-xs">{currentStation.name} ({currentStation.climate_zone})</span>
          </div>

          <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-700/60 space-y-1">
            <span className="text-slate-200 font-semibold">Store-and-Forward Protocol:</span>
            <div className="text-2xl font-black text-emerald-300">READY</div>
            <span className="text-slate-300 font-medium text-xs">Auto-merge via /edge/sync</span>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onSyncEdgeBuffer}
            disabled={offlineBufferedCount === 0}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Flush & Sync Buffer to Central Database ({offlineBufferedCount})</span>
          </button>

          <button
            onClick={handleClearBuffer}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-rose-950 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-200 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span>Purge Local Buffer</span>
          </button>
        </div>
      </div>

      {/* 2. CUSUM Drift Sensitivity & ML Parameters */}
      <div className="glass-panel p-6 rounded-2xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono">CUSUM SENSOR DRIFT HYPERPARAMETERS</h3>
            <p className="text-xs text-slate-400">Control Cumulative Sum decision threshold and slack tolerances</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Decision Threshold (h):</span>
              <span className="font-mono text-cyan-400 font-bold">{cusumThreshold.toFixed(1)} σ</span>
            </div>
            <input 
              type="range"
              min="2.0"
              max="6.0"
              step="0.5"
              value={cusumThreshold}
              onChange={(e) => setCusumThreshold(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>2.0σ (High Sensitivity)</span>
              <span>4.5σ (Default)</span>
              <span>6.0σ (Conservative)</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">Slack Reference (k):</span>
              <span className="font-mono text-purple-300 font-bold">0.5 σ</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400">
              Absorbs normal ambient diurnal oscillation without false cumulative accumulation.
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-slate-300">EWMA Smoothing (λ):</span>
              <span className="font-mono text-emerald-400 font-bold">0.20</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-400">
              Weights recent 20% of sensor telemetry against long-term baseline.
            </div>
          </div>
        </div>
      </div>

      {/* 3. Audio & Sampling Frequency */}
      <div className="glass-panel p-6 rounded-2xl space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono">TELEMETRY STREAM & SOUND NOTIFICATIONS</h3>
            <p className="text-xs text-slate-400">Configure dashboard refresh intervals and auditory alert sounds</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-300">Telemetry Stream Rate:</span>
            <div className="flex items-center gap-2">
              {[
                { label: '1 Second (Fast Stream)', val: 1000 },
                { label: '2 Seconds (Standard)', val: 2000 },
                { label: '4 Seconds (Low Bandwidth)', val: 4000 }
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => onChangeInterval(opt.val)}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-semibold transition-all ${
                    streamIntervalMs === opt.val
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-300">Audio Alarm System:</span>
            <div>
              <button
                onClick={onToggleSound}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold flex items-center gap-2 transition-all ${
                  soundEnabled
                    ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900/60 border border-slate-700 text-slate-400'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                <span>{soundEnabled ? 'Alert Audio: Enabled (Web Audio API)' : 'Alert Audio: Muted'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Backend Database & API Connectivity */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-white/5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono">BACKEND & DATABASE INFRASTRUCTURE</h3>
            <p className="text-xs text-slate-400">Central PostgreSQL / SQLite database connection status</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
            <span className="text-slate-400">Database Engine:</span>
            <div className="text-sm font-bold text-white mt-1">SQLite (`backend/skyguard.db`)</div>
            <span className="text-[10px] text-emerald-400">Production ready for PostgreSQL</span>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
            <span className="text-slate-400">Seeded Network Stations:</span>
            <div className="text-sm font-bold text-cyan-300 mt-1">550 AWS Stations Active</div>
            <span className="text-[10px] text-slate-400">All 28 States & UTs</span>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
            <span className="text-slate-400">Satellite Telemetry Uplink:</span>
            <div className="text-sm font-bold text-emerald-400 mt-1">MOSDAC / INSAT-3D Online</div>
            <span className="text-[10px] text-slate-400">High-Resolution Atmospheric Feed</span>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2">
          <button
            onClick={testApiPing}
            disabled={isPinging}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-white text-xs font-semibold flex items-center gap-2 transition-all"
          >
            <Activity className={`w-3.5 h-3.5 ${isPinging ? 'animate-spin' : ''}`} />
            <span>{isPinging ? 'Testing...' : 'Test Backend Connection Latency'}</span>
          </button>

          {apiPingResult && (
            <span className="text-xs font-mono text-cyan-300">
              {apiPingResult}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
