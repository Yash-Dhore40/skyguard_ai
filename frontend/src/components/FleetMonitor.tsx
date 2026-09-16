import React, { useState, useEffect } from 'react';
import type { StationInfo, FleetSummary } from '../types';
import { api } from '../services/api';
import { 
  Building2, 
  MapPin, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  WifiOff, 
  Radio, 
  CloudRain,
  Search, 
  CheckCircle2,
  Mountain,
  Sun,
  Waves,
  TreePine,
  Sparkles
} from 'lucide-react';

interface FleetMonitorProps {
  currentStationId: string;
  onSelectStation: (station: StationInfo) => void;
}

const FleetMonitor: React.FC<FleetMonitorProps> = ({ currentStationId, onSelectStation }) => {
  const [fleetSummary, setFleetSummary] = useState<FleetSummary | null>(null);
  const [stations, setStations] = useState<StationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchFleetData = async () => {
    setLoading(true);
    try {
      const summary = await api.getFleetSummary();
      setFleetSummary(summary);

      const res = await api.getStations({
        zone: selectedZone,
        status: selectedStatus,
        search: searchQuery,
        limit: 100
      });
      setStations(res.stations);
    } catch (err) {
      console.error('Error loading fleet data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFleetData();
  }, [selectedZone, selectedStatus, searchQuery]);

  const zoneIcons: Record<string, any> = {
    WESTERN_HIMALAYAS: Mountain,
    THAR_DESERT: Sun,
    TROPICAL_COASTAL: Waves,
    GANGETIC_PLAINS: TreePine,
    DECCAN_PLATEAU: Building2,
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Operational':
        return <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"><ShieldCheck className="w-3 h-3" /> Operational</span>;
      case 'Degraded':
        return <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20"><AlertTriangle className="w-3 h-3" /> Degraded</span>;
      case 'Critical':
        return <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20"><AlertOctagon className="w-3 h-3" /> Critical</span>;
      default:
        return <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20"><WifiOff className="w-3 h-3" /> Offline</span>;
    }
  };

  const getZoneThumb = (z: string) => {
    if (z === 'WESTERN_HIMALAYAS') return '/assets/zone_himalayas.jpg';
    if (z === 'THAR_DESERT') return '/assets/zone_thar.jpg';
    if (z === 'TROPICAL_COASTAL') return '/assets/zone_coastal.jpg';
    if (z === 'GANGETIC_PLAINS') return '/assets/zone_gangetic.jpg';
    if (z === 'DECCAN_PLATEAU') return '/assets/zone_deccan.jpg';
    return '/assets/bg_satellite_globe.jpg';
  };

  return (
    <div className="space-y-6">
      {/* Network Overview Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="glass-panel rounded-xl p-4">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Total Stations</div>
          <div className="text-2xl font-black text-white mt-1">{fleetSummary?.total_stations || 550}</div>
          <div className="text-xs text-cyan-300 font-semibold mt-1 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Nationwide IMD AWS
          </div>
        </div>

        <div className="glass-panel border border-emerald-500/30 rounded-xl p-4">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Operational</div>
          <div className="text-2xl font-black text-emerald-300 mt-1">{fleetSummary?.operational || 498}</div>
          <div className="text-xs text-emerald-300 font-semibold mt-1">Healthy Telemetry</div>
        </div>

        <div className="glass-panel border border-amber-500/30 rounded-xl p-4">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Degraded</div>
          <div className="text-2xl font-black text-amber-300 mt-1">{fleetSummary?.degraded || 36}</div>
          <div className="text-xs text-amber-300 font-semibold mt-1">Sensor Drift / Flags</div>
        </div>

        <div className="glass-panel border border-rose-500/30 rounded-xl p-4">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Critical</div>
          <div className="text-2xl font-black text-rose-300 mt-1">{fleetSummary?.critical || 12}</div>
          <div className="text-xs text-rose-300 font-semibold mt-1">Urgent Calibration</div>
        </div>

        <div className="glass-panel border border-sky-500/30 rounded-xl p-4">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Edge Gateways</div>
          <div className="text-2xl font-black text-sky-300 mt-1">{fleetSummary?.edge_mode_stations || 82}</div>
          <div className="text-xs text-sky-200 font-semibold mt-1 flex items-center gap-1"><Radio className="w-3.5 h-3.5 text-sky-400" /> Offline Buffered</div>
        </div>

        <div className="glass-panel border border-cyan-500/30 rounded-xl p-4">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">Avg Network Health</div>
          <div className="text-2xl font-black text-cyan-300 mt-1">{fleetSummary?.average_network_health || 96.4}%</div>
          <div className="text-xs text-cyan-300 font-semibold mt-1 flex items-center gap-1">
            <CloudRain className="w-3.5 h-3.5 text-cyan-400" /> Monsoon Shield On
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900/60 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by city, station ID, or state..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/60 border border-white/10 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        {/* Climate Zone Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'ALL', label: 'All Zones' },
            { id: 'WESTERN_HIMALAYAS', label: 'Himalayas' },
            { id: 'GANGETIC_PLAINS', label: 'Plains' },
            { id: 'THAR_DESERT', label: 'Thar Desert' },
            { id: 'TROPICAL_COASTAL', label: 'Coastal' },
            { id: 'DECCAN_PLATEAU', label: 'Deccan' }
          ].map((z) => (
            <button
              key={z.id}
              onClick={() => setSelectedZone(z.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedZone === z.id
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-glow-cyan'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {z.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="bg-slate-950/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="Operational">Operational</option>
          <option value="Degraded">Degraded</option>
          <option value="Critical">Critical</option>
          <option value="Offline">Offline</option>
        </select>
      </div>

      {/* Stations Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm font-mono text-cyan-400">Loading nationwide AWS fleet...</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[560px] overflow-y-auto pr-1">
        {stations.map((st) => {
          const isSelected = st.id === currentStationId;
          const ZoneIcon = zoneIcons[st.climate_zone] || Building2;
          const zoneThumb = getZoneThumb(st.climate_zone);

          return (
            <div
              key={st.id}
              onClick={() => onSelectStation(st)}
              className={`p-4 rounded-xl border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-slate-900 border-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                  : 'bg-slate-900/95 border-slate-700/70 hover:border-cyan-500/50 hover:bg-slate-900'
              }`}
            >
              {/* Subtle Zone Landscape Backdrop */}
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-[0.06] group-hover:opacity-[0.12] transition-opacity duration-500 pointer-events-none"
                style={{ backgroundImage: `url(${zoneThumb})` }}
              />

              <div className="relative z-10 flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0 relative bg-slate-950">
                    <img 
                      src={zoneThumb} 
                      alt={st.climate_zone} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                      <ZoneIcon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{st.id}</span>
                    </div>
                    <h4 className="text-sm font-bold text-white mt-0.5 line-clamp-1">{st.name}</h4>
                    <div className="text-xs text-slate-300 flex items-center gap-1 mt-0.5 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                      {st.state} • {st.elevation_m}m
                    </div>
                  </div>
                </div>

                {getStatusBadge(st.status)}
              </div>

              <div className="relative z-10 mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-slate-300 font-medium">Health:</span>
                  <span className={`font-bold ${st.health_score >= 80 ? 'text-emerald-300' : st.health_score >= 50 ? 'text-amber-300' : 'text-rose-300'}`}>
                    {st.health_score}%
                  </span>
                </div>

                {st.is_edge_mode && (
                  <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-sky-200 bg-sky-500/20 px-2 py-0.5 rounded border border-sky-500/30">
                    <Radio className="w-3 h-3 text-sky-400" /> EDGE
                  </span>
                )}
              </div>

              {isSelected && (
                <div className="absolute top-2 right-2 flex items-center gap-1 text-[11px] font-mono font-bold text-cyan-300 bg-cyan-500/25 px-2 py-0.5 rounded-full border border-cyan-500/40">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" /> ACTIVE
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

export default FleetMonitor;
