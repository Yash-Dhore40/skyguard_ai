import React, { useState } from 'react';
import type { SensorReading } from '../types';
import { 
  FlaskConical, 
  Flame, 
  Wind, 
  Droplets, 
  Snowflake, 
  Zap, 
  Sliders, 
  Send,
  CheckCircle2
} from 'lucide-react';

interface FaultLabProps {
  onInjectFault: (customReading: SensorReading) => Promise<void>;
  isInjecting: boolean;
}

export type FaultPresetType = 
  | 'temp_spike' 
  | 'temp_drop' 
  | 'pressure_drop' 
  | 'humidity_spike' 
  | 'sensor_freeze' 
  | 'thermo_inconsistent';

const FaultLab: React.FC<FaultLabProps> = ({ onInjectFault, isInjecting }) => {
  const [activeTab, setActiveTab] = useState<'presets' | 'manual'>('presets');

  // Manual Override Sliders state
  const [manualTemp, setManualTemp] = useState<number>(45.0);
  const [manualPressure, setManualPressure] = useState<number>(1013.25);
  const [manualHumidity, setManualHumidity] = useState<number>(95.0);
  const [lastInjectedMsg, setLastInjectedMsg] = useState<string | null>(null);

  const presets = [
    {
      id: 'temp_spike' as FaultPresetType,
      title: 'Thermal Spike (+25°C)',
      description: 'Simulates abnormal solar heating or sensor amplifier fault',
      icon: Flame,
      color: 'from-orange-500/20 to-rose-500/20 border-rose-500/30 hover:border-rose-400',
      iconColor: 'text-rose-400',
      getReading: (): SensorReading => ({
        temperature: 52.4,
        pressure: 1012.8,
        humidity: 42.0,
        timestamp: new Date().toISOString()
      })
    },
    {
      id: 'pressure_drop' as FaultPresetType,
      title: 'Barometric Shock (-40 hPa)',
      description: 'Simulates membrane breach or sudden rapid depressurization',
      icon: Wind,
      color: 'from-cyan-500/20 to-blue-500/20 border-blue-500/30 hover:border-blue-400',
      iconColor: 'text-cyan-400',
      getReading: (): SensorReading => ({
        temperature: 24.5,
        pressure: 968.2,
        humidity: 58.0,
        timestamp: new Date().toISOString()
      })
    },
    {
      id: 'humidity_spike' as FaultPresetType,
      title: 'Hygrometer Saturation (100%)',
      description: 'Simulates sensor waterlogging, condensation short or drift',
      icon: Droplets,
      color: 'from-blue-500/20 to-indigo-500/20 border-indigo-500/30 hover:border-indigo-400',
      iconColor: 'text-blue-400',
      getReading: (): SensorReading => ({
        temperature: 26.0,
        pressure: 1014.0,
        humidity: 100.0,
        timestamp: new Date().toISOString()
      })
    },
    {
      id: 'sensor_freeze' as FaultPresetType,
      title: 'Sensor Freeze / Deadlock',
      description: 'Simulates stuck ADC output or frozen communication bus',
      icon: Snowflake,
      color: 'from-slate-500/20 to-cyan-500/20 border-cyan-500/30 hover:border-cyan-400',
      iconColor: 'text-sky-300',
      getReading: (): SensorReading => ({
        temperature: 22.0,
        pressure: 1013.25,
        humidity: 50.0,
        timestamp: new Date().toISOString()
      })
    },
    {
      id: 'thermo_inconsistent' as FaultPresetType,
      title: 'Thermodynamic Inconsistency',
      description: 'Extreme heat (48°C) accompanied by saturated moisture (95%)',
      icon: Zap,
      color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 hover:border-purple-400',
      iconColor: 'text-purple-400',
      getReading: (): SensorReading => ({
        temperature: 48.0,
        pressure: 1010.0,
        humidity: 95.0,
        timestamp: new Date().toISOString()
      })
    },
  ];

  const handleTriggerPreset = async (preset: typeof presets[0]) => {
    const reading = preset.getReading();
    await onInjectFault(reading);
    setLastInjectedMsg(`Injected: ${preset.title}`);
    setTimeout(() => setLastInjectedMsg(null), 3000);
  };

  const handleTriggerManual = async () => {
    const reading: SensorReading = {
      temperature: manualTemp,
      pressure: manualPressure,
      humidity: manualHumidity,
      timestamp: new Date().toISOString()
    };
    await onInjectFault(reading);
    setLastInjectedMsg(`Injected Manual: ${manualTemp}°C | ${manualPressure}hPa | ${manualHumidity}%`);
    setTimeout(() => setLastInjectedMsg(null), 3000);
  };

  return (
    <div className="glass-panel rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
      <div>
        {/* Header & Mode Tabs */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <FlaskConical className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide">
                Fault Injection Laboratory
              </h2>
              <p className="text-xs text-slate-400">
                Stress-test Isolation Forest model with realistic weather anomalies
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-0.5 flex text-xs font-mono">
            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3 py-1 rounded transition-all flex items-center gap-1.5 ${
                activeTab === 'presets'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Presets
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1 rounded transition-all flex items-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3 h-3" />
              Manual
            </button>
          </div>
        </div>

        {/* Status Notification banner */}
        {lastInjectedMsg && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-2 text-xs font-mono text-cyan-300 animate-pulse">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>{lastInjectedMsg}</span>
          </div>
        )}

        {/* Tab 1: Presets Grid */}
        {activeTab === 'presets' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {presets.map((preset) => {
              const Icon = preset.icon;
              return (
                <button
                  key={preset.id}
                  disabled={isInjecting}
                  onClick={() => handleTriggerPreset(preset)}
                  className={`p-3 rounded-xl border bg-gradient-to-br ${preset.color} text-left transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed group`}
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <span className="font-semibold text-xs text-white group-hover:text-cyan-300 transition-colors">
                      {preset.title}
                    </span>
                    <Icon className={`w-4 h-4 ${preset.iconColor}`} />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    {preset.description}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          /* Tab 2: Manual Control Sliders */
          <div className="space-y-4 bg-slate-900/50 p-4 rounded-xl border border-slate-800 font-mono">
            {/* Temperature Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Temperature Override:</span>
                <span className="text-rose-400 font-bold">{manualTemp.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="-20"
                max="65"
                step="0.5"
                value={manualTemp}
                onChange={(e) => setManualTemp(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>-20°C (Freezing)</span>
                <span>25°C (Standard)</span>
                <span>65°C (Extreme)</span>
              </div>
            </div>

            {/* Pressure Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Atmospheric Pressure:</span>
                <span className="text-emerald-400 font-bold">{manualPressure.toFixed(1)} hPa</span>
              </div>
              <input
                type="range"
                min="920"
                max="1080"
                step="1"
                value={manualPressure}
                onChange={(e) => setManualPressure(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>920 hPa (Depression)</span>
                <span>1013 hPa</span>
                <span>1080 hPa (High)</span>
              </div>
            </div>

            {/* Humidity Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Relative Humidity:</span>
                <span className="text-cyan-400 font-bold">{manualHumidity.toFixed(1)} %</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={manualHumidity}
                onChange={(e) => setManualHumidity(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>0% (Arid)</span>
                <span>50% (Comfort)</span>
                <span>100% (Saturated)</span>
              </div>
            </div>

            <button
              onClick={handleTriggerManual}
              disabled={isInjecting}
              className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-slate-950 font-bold rounded-xl transition-all shadow-glow-cyan flex items-center justify-center gap-2 text-xs uppercase tracking-wider disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isInjecting ? 'Sending Telemetry...' : 'Inject Custom Telemetry Now'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
        <span>Model: Isolation Forest Contamination @ 10%</span>
        <span>Auto-Recovery: Enabled</span>
      </div>
    </div>
  );
};

export default FaultLab;