import React, { useState } from 'react';
import type { SensorReading, ClimateZoneType } from '../types';
import { 
  FlaskConical, 
  Flame, 
  Wind, 
  Snowflake, 
  Zap, 
  Sliders, 
  Send,
  CheckCircle2,
  CloudRain,
  Sun,
  Mountain,
  TrendingUp
} from 'lucide-react';

interface FaultLabProps {
  onInjectFault: (customReading: SensorReading) => Promise<void>;
  isInjecting: boolean;
  currentStationId?: string;
  currentClimateZone?: ClimateZoneType;
}

export type FaultPresetType = 
  | 'monsoon_deluge'
  | 'thar_heatwave'
  | 'himalaya_altitude'
  | 'sensor_drift'
  | 'temp_spike' 
  | 'pressure_drop' 
  | 'humidity_spike' 
  | 'sensor_freeze' 
  | 'thermo_inconsistent';

const FaultLab: React.FC<FaultLabProps> = ({ 
  onInjectFault, 
  isInjecting, 
  currentStationId = "AWS-IND-001",
  currentClimateZone = "GANGETIC_PLAINS"
}) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'manual'>('presets');

  // Manual Override Sliders state
  const [manualTemp, setManualTemp] = useState<number>(45.0);
  const [manualPressure, setManualPressure] = useState<number>(1013.25);
  const [manualHumidity, setManualHumidity] = useState<number>(95.0);
  const [lastInjectedMsg, setLastInjectedMsg] = useState<string | null>(null);

  const presets = [
    {
      id: 'monsoon_deluge' as FaultPresetType,
      title: 'SW Monsoon Deluge (99% RH)',
      description: 'Tests India monsoon physics: saturated air is genuine weather, NOT a sensor fault',
      badge: 'Zero False Positive Test',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: CloudRain,
      color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/30 hover:border-cyan-400',
      iconColor: 'text-cyan-400',
      getReading: (): SensorReading => ({
        station_id: currentStationId,
        climate_zone: 'TROPICAL_COASTAL',
        temperature: 26.2,
        pressure: 998.0,
        humidity: 99.2,
        timestamp: new Date().toISOString()
      })
    },
    {
      id: 'thar_heatwave' as FaultPresetType,
      title: 'Thar Desert Peak Heat (50.8°C)',
      description: 'Tests IMD heatwave resilience: 50°C+ is verified extreme, not a sensor spike',
      badge: 'Genuine Extreme Test',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      icon: Sun,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 hover:border-amber-400',
      iconColor: 'text-amber-400',
      getReading: (): SensorReading => ({
        station_id: currentStationId,
        climate_zone: 'THAR_DESERT',
        temperature: 50.8,
        pressure: 990.5,
        humidity: 14.5,
        timestamp: new Date().toISOString()
      })
    },
    {
      id: 'sensor_drift' as FaultPresetType,
      title: 'Gradual Sensor Drift (+CUSUM)',
      description: 'Simulates 40-50% real faults: slow creeping offset that triggers CUSUM control chart',
      badge: 'CUSUM Drift Test',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: TrendingUp,
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 hover:border-purple-400',
      iconColor: 'text-purple-400',
      getReading: (): SensorReading => ({
        station_id: currentStationId,
        climate_zone: currentClimateZone,
        temperature: 31.8,
        pressure: 1011.0,
        humidity: 82.5,
        timestamp: new Date().toISOString()
      })
    },
    {
      id: 'himalaya_altitude' as FaultPresetType,
      title: 'Himalayan Altitude (680 hPa)',
      description: 'Tests ISA lapse compensation at Leh/Shimla: low pressure is natural altitude physics',
      badge: 'Altitude Lapse Test',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      icon: Mountain,
      color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 hover:border-sky-400',
      iconColor: 'text-sky-400',
      getReading: (): SensorReading => ({
        station_id: currentStationId,
        climate_zone: 'WESTERN_HIMALAYAS',
        elevation_m: 3500.0,
        temperature: -12.0,
        pressure: 680.0,
        humidity: 34.0,
        timestamp: new Date().toISOString()
      })
    },
    {
      id: 'temp_spike' as FaultPresetType,
      title: 'Thermal Spike (+25°C instant)',
      description: 'Simulates electrical surge or transducer open-circuit spike',
      badge: 'True Sensor Fault',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: Flame,
      color: 'from-rose-500/20 to-red-500/20 border-rose-500/30 hover:border-rose-400',
      iconColor: 'text-rose-400',
      getReading: (): SensorReading => ({
        station_id: currentStationId,
        climate_zone: currentClimateZone,
        temperature: 58.0,
        pressure: 1012.0,
        humidity: 45.0,
        timestamp: new Date().toISOString()
      })
    },
    {
      id: 'pressure_drop' as FaultPresetType,
      title: 'Barometer Rupture (740 hPa)',
      description: 'Simulates diaphragm breach at sea level (unrealistic barometric leak)',
      badge: 'True Sensor Fault',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      icon: Wind,
      color: 'from-cyan-500/20 to-blue-500/20 border-blue-500/30 hover:border-blue-400',
      iconColor: 'text-cyan-400',
      getReading: (): SensorReading => ({
        station_id: currentStationId,
        climate_zone: currentClimateZone,
        elevation_m: 20.0,
        temperature: 28.0,
        pressure: 740.0,
        humidity: 60.0,
        timestamp: new Date().toISOString()
      })
    },
    {
      id: 'sensor_freeze' as FaultPresetType,
      title: 'ADC Deadlock / Frozen Bus',
      description: 'Simulates stuck digital bus with zero variance over consecutive readings',
      badge: 'Frozen Hardware',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      icon: Snowflake,
      color: 'from-slate-500/20 to-cyan-500/20 border-cyan-500/30 hover:border-cyan-400',
      iconColor: 'text-sky-300',
      getReading: (): SensorReading => ({
        station_id: currentStationId,
        climate_zone: currentClimateZone,
        temperature: 24.12,
        pressure: 1012.34,
        humidity: 61.22,
        timestamp: new Date().toISOString()
      })
    },
    {
      id: 'thermo_inconsistent' as FaultPresetType,
      title: 'Psychrometric Violation',
      description: 'Extreme heat (49°C) combined with saturated moisture (98% RH)',
      badge: 'Physics Violation',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      icon: Zap,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-400',
      iconColor: 'text-purple-400',
      getReading: (): SensorReading => ({
        station_id: currentStationId,
        climate_zone: currentClimateZone,
        temperature: 49.0,
        pressure: 1005.0,
        humidity: 98.0,
        timestamp: new Date().toISOString()
      })
    }
  ];

  const handlePresetClick = async (preset: typeof presets[0]) => {
    const reading = preset.getReading();
    setLastInjectedMsg(`Injected: ${preset.title}`);
    await onInjectFault(reading);
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const reading: SensorReading = {
      station_id: currentStationId,
      climate_zone: currentClimateZone,
      temperature: manualTemp,
      pressure: manualPressure,
      humidity: manualHumidity,
      timestamp: new Date().toISOString()
    };
    setLastInjectedMsg(`Injected Manual: ${manualTemp}°C, ${manualPressure} hPa, ${manualHumidity}%`);
    await onInjectFault(reading);
  };

  const getPresetThumb = (id: string) => {
    switch (id) {
      case 'monsoon_deluge': return '/assets/zone_coastal.jpg';
      case 'thar_heatwave': return '/assets/zone_thar.jpg';
      case 'himalaya_altitude': return '/assets/zone_himalayas.jpg';
      case 'sensor_drift': return '/assets/bg_radar_dome.jpg';
      case 'temp_spike': return '/assets/bg_thermal_radar.jpg';
      case 'pressure_drop': return '/assets/hero_bg.jpg';
      case 'humidity_spike': return '/assets/zone_gangetic.jpg';
      default: return '/assets/bg_satellite_globe.jpg';
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between group">
      {/* Background Doppler Radar Dome Backdrop */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-[0.08] group-hover:opacity-[0.14] transition-opacity duration-700 pointer-events-none scale-105"
        style={{ backgroundImage: `url('/assets/bg_radar_dome.jpg')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-slate-950/85 to-slate-950/95 pointer-events-none" />

      <div className="relative z-10">
        {/* Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Meteorological Fault & Scenario Laboratory
              </h3>
              <p className="text-xs text-slate-400">
                Stress test model with genuine Indian extreme weather vs hardware sensor faults
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/60 border border-white/10 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'presets'
                  ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              India & Fault Scenarios
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'bg-cyan-500 text-slate-950 shadow-glow-cyan'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Manual Dial
            </button>
          </div>
        </div>

        {lastInjectedMsg && (
          <div className="mb-4 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-center gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>{lastInjectedMsg}</span>
          </div>
        )}

        {/* Tab 1: Presets Grid */}
        {activeTab === 'presets' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {presets.map((preset) => {
              const Icon = preset.icon;
              const thumb = getPresetThumb(preset.id);
              return (
                <button
                  key={preset.id}
                  disabled={isInjecting}
                  onClick={() => handlePresetClick(preset)}
                  className={`p-4 rounded-xl border text-left bg-gradient-to-br transition-all flex flex-col justify-between group relative overflow-hidden ${preset.color} ${
                    isInjecting ? 'opacity-50 cursor-not-allowed' : 'active:scale-95'
                  }`}
                >
                  {/* Subtle Scenario Image Backdrop */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-[0.10] group-hover:opacity-[0.22] transition-opacity duration-500 pointer-events-none"
                    style={{ backgroundImage: `url(${thumb})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-slate-950/70 to-slate-950/90 pointer-events-none" />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className={`p-2 rounded-lg bg-slate-900/80 border border-white/10 ${preset.iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${preset.badgeColor}`}>
                        {preset.badge}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                      {preset.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>

                  <div className="relative z-10 mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-cyan-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>Simulate Telemetry</span>
                    <span>&rarr;</span>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Tab 2: Manual Precision Sliders */
          <form onSubmit={handleManualSubmit} className="space-y-4 bg-slate-950/40 p-5 rounded-xl border border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Temperature Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-200">Temperature</span>
                  <span className="font-mono text-cyan-300 font-bold">{manualTemp.toFixed(1)}°C</span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="60"
                  step="0.5"
                  value={manualTemp}
                  onChange={(e) => setManualTemp(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-xs text-slate-300 font-mono font-semibold">
                  <span>-30°C</span>
                  <span>+60°C</span>
                </div>
              </div>

              {/* Pressure Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-200">Atmospheric Pressure</span>
                  <span className="font-mono text-cyan-300 font-bold">{manualPressure.toFixed(1)} hPa</span>
                </div>
                <input
                  type="range"
                  min="600"
                  max="1080"
                  step="1"
                  value={manualPressure}
                  onChange={(e) => setManualPressure(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-xs text-slate-300 font-mono font-semibold">
                  <span>600 hPa</span>
                  <span>1080 hPa</span>
                </div>
              </div>

              {/* Humidity Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-200">Relative Humidity</span>
                  <span className="font-mono text-cyan-300 font-bold">{manualHumidity.toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={manualHumidity}
                  onChange={(e) => setManualHumidity(parseFloat(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-xs text-slate-300 font-mono font-semibold">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={isInjecting}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-glow-cyan"
              >
                <Send className="w-3.5 h-3.5" />
                Inject Custom Telemetry Sample
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FaultLab;