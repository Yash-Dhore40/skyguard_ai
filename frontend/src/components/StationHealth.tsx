import React from 'react';
import type { StationHealth as StationHealthType } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Cpu, 
  Radio, 
  Thermometer, 
  Gauge, 
  Droplets,
  Activity
} from 'lucide-react';

interface StationHealthProps {
  health: StationHealthType;
  stationId?: string;
  uptimeSeconds?: number;
}

const StationHealth: React.FC<StationHealthProps> = ({ 
  health, 
  stationId = "AWS-ALPHA-01",
  uptimeSeconds = 3492
}) => {
  const score = Math.round(health.score);
  
  // Color tokens depending on score
  const getTheme = (s: number) => {
    if (s >= 80) {
      return {
        text: 'text-emerald-400',
        stroke: '#10b981',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        badgeBg: 'bg-emerald-500/20 text-emerald-300',
        icon: ShieldCheck,
        label: 'Operational'
      };
    }
    if (s >= 50) {
      return {
        text: 'text-amber-400',
        stroke: '#f59e0b',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        badgeBg: 'bg-amber-500/20 text-amber-300',
        icon: AlertTriangle,
        label: 'Degraded'
      };
    }
    return {
      text: 'text-rose-400',
      stroke: '#f43f5e',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      badgeBg: 'bg-rose-500/20 text-rose-300',
      icon: AlertOctagon,
      label: 'Critical'
    };
  };

  const currentTheme = getTheme(score);
  const StatusIcon = currentTheme.icon;

  // SVG Radial Gauge Math
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const formatUptime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  const subsystems = [
    { name: 'Thermal Array', icon: Thermometer, status: score > 50 ? 'Nominal' : 'Warning', ok: score > 50 },
    { name: 'Barometric Cell', icon: Gauge, status: score > 40 ? 'Nominal' : 'Drift Alert', ok: score > 40 },
    { name: 'Hygrometer', icon: Droplets, status: score > 60 ? 'Nominal' : 'Out of Bounds', ok: score > 60 },
    { name: 'Isolation Forest ML', icon: Cpu, status: 'Active (v1.0.0)', ok: true },
    { name: 'Edge Uplink', icon: Radio, status: 'Connected (WebSocket)', ok: true },
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden">
      {/* Background ambient glow */}
      <div 
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: currentTheme.stroke }}
      />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        
        {/* Left: Station Identity & Primary Gauge */}
        <div className="flex items-center gap-5">
          {/* Radial Circular SVG Gauge */}
          <div className="relative flex items-center justify-center">
            <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r={radius}
                stroke={currentTheme.stroke}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className={`text-2xl font-bold font-mono ${currentTheme.text}`}>
                {score}%
              </span>
              <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">
                Health
              </span>
            </div>
          </div>

          {/* Station Metadata */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h2 className="text-lg font-bold text-white tracking-wide font-mono">
                {stationId}
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${currentTheme.badgeBg} flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {currentTheme.label}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2 font-mono">
              <span>Geo: 18.5204° N, 73.8567° E</span>
              <span>•</span>
              <span>Elev: 560m</span>
            </p>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5 font-mono">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Telemetry Uptime: <strong className="text-slate-200">{formatUptime(uptimeSeconds)}</strong></span>
            </p>
          </div>
        </div>

        {/* Right: Subsystem Integrity Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 flex-1 max-w-2xl">
          {subsystems.map((sub, idx) => {
            const SubIcon = sub.icon;
            return (
              <div 
                key={idx}
                className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-2.5 flex flex-col justify-between hover:border-cyan-500/30 transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-medium text-slate-400 truncate">{sub.name}</span>
                  <SubIcon className={`w-3.5 h-3.5 ${sub.ok ? 'text-cyan-400' : 'text-amber-400'}`} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${sub.ok ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                  <span className={`text-[10px] font-mono font-semibold ${sub.ok ? 'text-slate-300' : 'text-amber-300'} truncate`}>
                    {sub.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default StationHealth;