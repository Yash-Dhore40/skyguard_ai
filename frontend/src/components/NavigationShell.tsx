import React from 'react';
import { NavLink } from 'react-router-dom';
import type { StationInfo } from '../types';
import { 
  Activity, 
  Satellite, 
  Building2, 
  TrendingUp, 
  FlaskConical, 
  AlertTriangle, 
  Target, 
  Settings, 
  MapPin, 
  Radio, 
  UploadCloud, 
  CheckCircle2,
  CloudRain
} from 'lucide-react';

interface NavigationShellProps {
  currentStation: StationInfo;
  anchorStations: StationInfo[];
  onSelectStation: (station: StationInfo) => void;
  isEdgeOfflineMode: boolean;
  offlineBufferedCount: number;
  onSyncEdgeBuffer: () => void;
  syncFeedback: string | null;
  children: React.ReactNode;
}

export const NavigationShell: React.FC<NavigationShellProps> = ({
  currentStation,
  anchorStations,
  onSelectStation,
  isEdgeOfflineMode,
  offlineBufferedCount,
  onSyncEdgeBuffer,
  syncFeedback,
  children
}) => {
  const navItems = [
    { to: '/', label: 'Live Station', icon: Activity, badge: null },
    { to: '/live-feed', label: 'Live Satellite Feed', icon: Satellite, badge: 'ORBITAL' },
    { to: '/fleet', label: '550 Fleet Network', icon: Building2, badge: '550' },
    { to: '/drift', label: 'CUSUM Drift', icon: TrendingUp, badge: 'h=4.5σ' },
    { to: '/testing', label: 'Testing & Fault Lab', icon: FlaskConical, badge: 'Simulate' },
    { to: '/incidents', label: 'Incident Console', icon: AlertTriangle, badge: null },
    { to: '/benchmarks', label: 'IMD Benchmarks', icon: Target, badge: '100% ACC' },
    { to: '/settings', label: 'Settings', icon: Settings, badge: null }
  ];

  return (
    <div className="min-h-screen bg-[#070b14] bg-grid-cyber text-slate-100 relative selection:bg-cyan-500 selection:text-white pb-12">
      {/* Fixed Full-Page Earth Satellite & Weather Radar Telemetry Background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img 
          src="/assets/bg_satellite_globe.jpg" 
          alt="Global Satellite Meteorology" 
          className="w-full h-full object-cover object-center opacity-12 filter contrast-110 brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/92 to-slate-950/98" />
      </div>

      {/* Atmospheric meteorological hero background banner */}
      <div className="absolute top-0 left-0 right-0 h-[360px] overflow-hidden pointer-events-none z-0">
        <img 
          src="/assets/hero_bg.jpg" 
          alt="Atmospheric Meteorological Radar Front" 
          className="w-full h-full object-cover object-top opacity-12 filter contrast-110 brightness-75"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#040711]/60 via-[#040711]/90 to-[#040711]" />
      </div>

      {/* Top Mission Control Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/90 backdrop-blur-2xl px-4 lg:px-8 py-2.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Brand Logo & Station Quick-Selector */}
          <div className="flex items-center gap-3">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-500/40 shadow-glow-cyan shrink-0 relative">
                <img src="/assets/logo.jpg" alt="SkyGuard AI" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black tracking-tight text-white font-mono">
                    SKYGUARD<span className="text-cyan-400 font-bold">.AI</span>
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-500/15 border border-cyan-500/40 text-cyan-300">
                    ENTERPRISE AWS
                  </span>
                </div>
              </div>
            </NavLink>

            {/* Station Quick Switcher Dropdown */}
            <div className="h-5 w-[1px] bg-white/10 hidden sm:block mx-1" />
            <div className="flex items-center gap-1.5 text-xs">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <select
                value={currentStation.id}
                onChange={(e) => {
                  const found = anchorStations.find(s => s.id === e.target.value);
                  if (found) onSelectStation(found);
                }}
                className="bg-slate-900 text-cyan-300 font-bold text-xs border border-cyan-500/30 rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-400 cursor-pointer shadow-sm"
              >
                {anchorStations.map(s => (
                  <option key={s.id} value={s.id} className="bg-slate-950 text-white font-medium">
                    {s.name} ({s.climate_zone.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick System Indicators */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 hidden sm:flex items-center gap-1.5">
              <CloudRain className="w-3.5 h-3.5 text-emerald-400" /> Monsoon Shield: ACTIVE
            </span>

            {isEdgeOfflineMode && (
              <span className="text-xs px-2.5 py-1 rounded-lg font-semibold bg-sky-500/25 border border-sky-500/40 text-sky-200 flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" /> Edge Gateway Mode
              </span>
            )}
          </div>

        </div>

        {/* Navigation Bar with Route Links */}
        <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                      : 'text-slate-200 hover:text-white hover:bg-slate-900/90 border border-transparent hover:border-white/10'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded-full bg-slate-950/50 text-current border border-current/25">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </header>

      {/* Offline Edge Buffer Banner */}
      {isEdgeOfflineMode && (
        <div className="bg-sky-950/70 border-b border-sky-500/30 px-4 py-2 text-xs text-sky-200 flex items-center justify-between backdrop-blur-md relative z-40">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
              <span>
                <strong>Edge Gateway Offline Mode:</strong> Readings buffered locally. Satellite uplink disconnected.
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="font-mono bg-sky-500/20 px-2 py-0.5 rounded border border-sky-500/30">
                Buffered: {offlineBufferedCount} samples
              </span>
              <button
                onClick={onSyncEdgeBuffer}
                disabled={offlineBufferedCount === 0}
                className="px-3 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold flex items-center gap-1 transition-all disabled:opacity-50"
              >
                <UploadCloud className="w-3.5 h-3.5" /> Sync Buffer
              </button>
            </div>
          </div>
        </div>
      )}

      {syncFeedback && (
        <div className="max-w-7xl mx-auto px-4 mt-3 relative z-40">
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        </div>
      )}

      {/* Main Page Body */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 mt-6 relative z-10">
        {children}
      </main>
    </div>
  );
};

export default NavigationShell;
