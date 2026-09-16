import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { StationInfo } from '../types';
import FleetMonitor from '../components/FleetMonitor';
import { Building2 } from 'lucide-react';

interface FleetNetworkPageProps {
  currentStationId: string;
  onSelectStation: (station: StationInfo) => void;
}

export const FleetNetworkPage: React.FC<FleetNetworkPageProps> = ({
  currentStationId,
  onSelectStation
}) => {
  const navigate = useNavigate();

  const handleStationClick = (station: StationInfo) => {
    onSelectStation(station);
    navigate('/');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none"
          style={{ backgroundImage: `url('/assets/hero_bg.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-slate-950/95 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0 shadow-glow-cyan">
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-white tracking-tight font-mono">
                  NATIONAL 550 AWS FLEET NETWORK
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  INDIA METEOROLOGICAL DEPARTMENT
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Centralized telemetry orchestrator across 550 automated weather stations in all 28 states and union territories. Click any station to open its live telemetry diagnostics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Monitor Component */}
      <div>
        <FleetMonitor 
          currentStationId={currentStationId} 
          onSelectStation={handleStationClick} 
        />
      </div>
    </div>
  );
};

export default FleetNetworkPage;
