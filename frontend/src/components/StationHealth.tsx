import React from 'react';
import type { StationHealth as StationHealthType, ClimateZoneType } from '../types';
import { 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Radio, 
  Thermometer, 
  Gauge, 
  Droplets,
  Activity,
  TrendingUp,
  Target
} from 'lucide-react';

interface StationHealthProps {
  health: StationHealthType;
  stationId?: string;
  stationName?: string;
  stationState?: string;
  climateZone?: ClimateZoneType;
  elevation_m?: number;
  uptimeSeconds?: number;
  isEdgeMode?: boolean;
  onOpenMetricsModal?: () => void;
}

const StationHealth: React.FC<StationHealthProps> = ({ 
  health, 
  stationId = "AWS-IND-001",
  stationName = "Safdarjung Observatory",
  stationState = "Delhi",
  climateZone = "GANGETIC_PLAINS",
  elevation_m = 216,
  uptimeSeconds = 3492,
  isEdgeMode = false,
  onOpenMetricsModal
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
    { name: 'Polymer Hygrometer', icon: Droplets, status: score > 60 ? 'Nominal' : 'Compensated', ok: score > 60 },
    { name: 'CUSUM Drift Filter', icon: TrendingUp, status: 'Active (h=4.5σ)', ok: true },
    { name: isEdgeMode ? 'Edge Gateway' : 'Cloud Uplink', icon: Radio, status: isEdgeMode ? 'Edge Buffer On' : 'Uplink Synced', ok: true },
  ];

  const getZoneImage = (zone?: string) => {
    if (zone === 'WESTERN_HIMALAYAS') return '/assets/zone_himalayas.jpg';
    if (zone === 'THAR_DESERT') return '/assets/zone_thar.jpg';
    if (zone === 'TROPICAL_COASTAL') return '/assets/zone_coastal.jpg';
    if (zone === 'GANGETIC_PLAINS') return '/assets/zone_gangetic.jpg';
    if (zone === 'DECCAN_PLATEAU') return '/assets/zone_deccan.jpg';
    return '/assets/bg_satellite_globe.jpg';
  };

  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden group">
      {/* Contextual Climate Zone Photo Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-15 group-hover:opacity-20 transition-opacity duration-700 pointer-events-none scale-105"
        style={{ backgroundImage: `url(${getZoneImage(climateZone)})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/75 to-slate-950/90 pointer-events-none" />

      {/* Background ambient glow */}
      <div 
        className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: currentTheme.stroke }}
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        
        {/* Left: Station Identity & Primary Gauge & Zone Preview */}
        <div className="flex items-center gap-5">
          {/* Radial Circular SVG Gauge */}
          <div className="relative flex items-center justify-center shrink-0">
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

          {/* Regional Climate Zone Photographic Badge */}
          <div className="relative w-24 h-20 rounded-xl overflow-hidden border border-white/10 shrink-0 hidden sm:block shadow-lg group">
            <img 
              src={getZoneImage(climateZone)} 
              alt={climateZone} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
            <span className="absolute bottom-1 left-1.5 text-[9px] font-mono text-cyan-300 font-bold uppercase tracking-wider">
              {climateZone ? climateZone.replace('_', ' ') : 'AWS SITE'}
            </span>
          </div>

          {/* Station Metadata */}
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h2 className="text-lg font-bold text-white tracking-wide font-mono">
                {stationId}
              </h2>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${currentTheme.badgeBg} flex items-center gap-1`}>
                <StatusIcon className="w-3 h-3" />
                {currentTheme.label}
              </span>
              {isEdgeMode && (
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                  <Radio className="w-3 h-3" /> Edge Mode
                </span>
              )}
            </div>
            
            <h3 className="text-sm font-bold text-white line-clamp-1">
              {stationName} ({stationState})
            </h3>

            <p className="text-xs text-slate-200 flex items-center gap-2 font-mono mt-1">
              <span>Zone: <strong className="text-cyan-300 font-bold">{climateZone}</strong></span>
              <span className="text-cyan-400 font-bold">•</span>
              <span>Elev: <strong className="text-white font-bold">{elevation_m}m</strong></span>
            </p>

            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="text-xs text-slate-200 flex items-center gap-1.5 font-mono">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Uptime: <strong className="text-emerald-300 font-bold">{formatUptime(uptimeSeconds)}</strong></span>
              </span>

              {onOpenMetricsModal && (
                <button
                  onClick={onOpenMetricsModal}
                  className="text-xs text-cyan-300 hover:text-cyan-200 underline font-bold flex items-center gap-1"
                >
                  <Target className="w-3.5 h-3.5" />
                  View Accuracy & FPR
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: Subsystem Integrity Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 flex-1 max-w-2xl">
          {subsystems.map((sub, idx) => {
            const SubIcon = sub.icon;
            return (
              <div 
                key={idx}
                className="bg-slate-900/90 border border-slate-700/70 rounded-xl p-2.5 flex flex-col justify-between hover:border-cyan-500/50 transition-all shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-slate-200 truncate">{sub.name}</span>
                  <SubIcon className={`w-3.5 h-3.5 ${sub.ok ? 'text-cyan-400' : 'text-amber-400'}`} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${sub.ok ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                  <span className={`text-[11px] font-mono font-bold ${sub.ok ? 'text-slate-200' : 'text-amber-300'} truncate`}>
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