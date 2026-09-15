import { useState, useEffect, useRef, useCallback } from 'react';
import type { SensorReading, AnomalyIncident, StationHealth as StationHealthType, TelemetryPoint } from './types';
import { api } from './services/api';

import StationHealth from './components/StationHealth';
import SensorCharts from './components/SensorCharts';
import FaultLab from './components/FaultLab';
import AnomalyAlerts from './components/AnomalyAlerts';

import { 
  ShieldAlert, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Thermometer, 
  Gauge, 
  Droplets, 
  Cpu, 
  Wifi, 
  Sparkles
} from 'lucide-react';

function App() {
  // Telemetry stream state
  const [telemetryData, setTelemetryData] = useState<TelemetryPoint[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyIncident[]>([]);
  const [totalReadingsScanned, setTotalReadingsScanned] = useState(0);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [streamIntervalMs, setStreamIntervalMs] = useState(2000);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Connection & Backend telemetry
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(true);
  const [backendLatencyMs, setBackendLatencyMs] = useState<number | null>(null);
  const [lastHeartbeat, setLastHeartbeat] = useState<string>('');
  const [uptimeSeconds, setUptimeSeconds] = useState(3600);

  // Station Health State
  const [stationHealth, setStationHealth] = useState<StationHealthType>({
    score: 100,
    status: 'Healthy',
  });

  // Keep a ref to historical baseline for generating smooth transitions
  const lastBaseRef = useRef<{ temp: number; press: number; hum: number }>({
    temp: 24.5,
    press: 1013.2,
    hum: 58.0
  });

  // Sound synthesis using Web Audio API
  const playAlertSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15); // Drop to A4
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch {
      // Audio context might be restricted before interaction
    }
  }, [soundEnabled]);

  // Ping backend health & measure latency
  const checkBackendHealth = useCallback(async () => {
    const start = performance.now();
    try {
      const healthData = await api.getStationHealth();
      const latency = Math.round(performance.now() - start);
      setBackendLatencyMs(latency);
      setIsBackendOnline(true);
      setLastHeartbeat(new Date().toLocaleTimeString());

      // If backend returned a valid score, integrate it
      if (typeof healthData?.score === 'number') {
        setStationHealth(prev => ({
          ...prev,
          score: healthData.score,
          status: healthData.score >= 80 ? 'Healthy' : healthData.score >= 50 ? 'Warning' : 'Critical'
        }));
      }
    } catch {
      setIsBackendOnline(false);
      setBackendLatencyMs(null);
    }
  }, []);

  // Periodic heartbeat
  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 5000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  // Telemetry uptime ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setUptimeSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Process a sensor reading: send to /detect and update local data
  const processSensorReading = useCallback(async (reading: SensorReading) => {
    setIsDetecting(true);
    try {
      const anomalyResult = await api.detectAnomaly(reading);
      setTotalReadingsScanned(prev => prev + 1);

      const point: TelemetryPoint = {
        ...reading,
        is_anomaly: anomalyResult.is_anomaly,
        fault_type: anomalyResult.fault_type,
        anomaly_score: anomalyResult.anomaly_score,
        corrected_temperature: anomalyResult.corrected_values?.temperature,
        corrected_pressure: anomalyResult.corrected_values?.pressure,
        corrected_humidity: anomalyResult.corrected_values?.humidity,
      };

      // Append to rolling chart points (keep last 60)
      setTelemetryData(prev => {
        const updated = [...prev, point];
        return updated.length > 60 ? updated.slice(-60) : updated;
      });

      // If anomaly detected, record incident and trigger sound
      if (anomalyResult.is_anomaly) {
        playAlertSound();
        const incident: AnomalyIncident = {
          ...anomalyResult,
          id: `INC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          timestamp: reading.timestamp,
          reading
        };
        setAnomalies(prev => [incident, ...prev].slice(0, 20));

        // Deduct health score dynamically
        setStationHealth(prev => {
          const newScore = Math.max(25, prev.score - 15);
          return {
            score: newScore,
            status: newScore >= 80 ? 'Healthy' : newScore >= 50 ? 'Warning' : 'Critical'
          };
        });
      } else {
        // Slowly recover station health when readings are normal
        setStationHealth(prev => {
          const newScore = Math.min(100, prev.score + 1.5);
          return {
            score: newScore,
            status: newScore >= 80 ? 'Healthy' : newScore >= 50 ? 'Warning' : 'Critical'
          };
        });
      }
    } catch (err) {
      console.error('Error during anomaly detection loop:', err);
    } finally {
      setIsDetecting(false);
    }
  }, [playAlertSound]);

  // Routine simulation generator
  const generateNormalReading = (): SensorReading => {
    // Generate realistic fluctuating weather walk
    const tempChange = (Math.random() - 0.5) * 0.4;
    const pressChange = (Math.random() - 0.5) * 0.6;
    const humChange = (Math.random() - 0.5) * 0.8;

    lastBaseRef.current.temp = Math.max(10, Math.min(42, lastBaseRef.current.temp + tempChange));
    lastBaseRef.current.press = Math.max(980, Math.min(1040, lastBaseRef.current.press + pressChange));
    lastBaseRef.current.hum = Math.max(20, Math.min(95, lastBaseRef.current.hum + humChange));

    return {
      temperature: parseFloat(lastBaseRef.current.temp.toFixed(2)),
      pressure: parseFloat(lastBaseRef.current.press.toFixed(2)),
      humidity: parseFloat(lastBaseRef.current.hum.toFixed(2)),
      timestamp: new Date().toISOString()
    };
  };

  // Automated stream loop
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      const reading = generateNormalReading();
      processSensorReading(reading);
    }, streamIntervalMs);

    return () => clearInterval(timer);
  }, [isPaused, streamIntervalMs, processSensorReading]);

  // Inject Custom Fault callback passed to FaultLab
  const handleInjectFault = async (customReading: SensorReading) => {
    // Overwrite the last base to maintain continuity
    lastBaseRef.current = {
      temp: customReading.temperature,
      press: customReading.pressure,
      hum: customReading.humidity
    };
    await processSensorReading(customReading);
  };

  // Reset all historical stream data
  const handleReset = () => {
    setTelemetryData([]);
    setAnomalies([]);
    setTotalReadingsScanned(0);
    setStationHealth({ score: 100, status: 'Healthy' });
  };

  // Latest sensor snapshot
  const latestPoint = telemetryData[telemetryData.length - 1] || {
    temperature: 24.5,
    pressure: 1013.25,
    humidity: 58.0,
    anomaly_score: 0.0,
    is_anomaly: false
  };

  return (
    <div className="min-h-screen bg-[#070b14] bg-grid-cyber text-slate-100 relative selection:bg-cyan-500 selection:text-white pb-12">
      {/* Ambient background orbs */}
      <div className="orb-glow bg-cyan-500 w-96 h-96 top-0 left-1/4" />
      <div className="orb-glow bg-blue-600 w-96 h-96 top-1/3 right-10" />
      <div className="orb-glow bg-rose-600 w-96 h-96 bottom-10 left-10" />

      {/* Top Mission Control Command Bar */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-sky-400 flex items-center justify-center shadow-glow-cyan">
              <ShieldAlert className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight text-white font-mono">
                  SKYGUARD<span className="text-cyan-400 font-bold">.AI</span>
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  v1.0-PROD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Autonomous Weather Station Anomaly Intelligence & Self-Healing Telemetry
              </p>
            </div>
          </div>

          {/* Center: Backend Heartbeat & Telemetry Link */}
          <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-xl px-3.5 py-1.5 text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isBackendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
              <span className="text-slate-300">
                Backend: <strong className={isBackendOnline ? 'text-emerald-400' : 'text-rose-400'}>{isBackendOnline ? 'Online' : 'Unreachable'}</strong>
              </span>
              {isBackendOnline && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 hidden lg:inline" title={api.getActiveUrl()}>
                  {api.getActiveUrl().includes('onrender') ? 'Render Cloud' : 'Local Edge'}
                </span>
              )}
            </div>

            <div className="hidden sm:block h-3 w-px bg-slate-700" />

            <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
              <Wifi className="w-3.5 h-3.5 text-cyan-400" />
              <span>Latency:</span>
              <strong className="text-white">{backendLatencyMs !== null ? `${backendLatencyMs} ms` : '--'}</strong>
            </div>

            <div className="hidden md:block h-3 w-px bg-slate-700" />

            <div className="hidden md:block text-slate-500 text-[11px]">
              Heartbeat: {lastHeartbeat || 'syncing...'}
            </div>
          </div>

          {/* Right: Simulation Controls */}
          <div className="flex items-center gap-2">
            {/* Play/Pause Stream */}
            <button
              onClick={() => setIsPaused(!isPaused)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
                isPaused 
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-glow-emerald' 
                  : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
              }`}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              <span>{isPaused ? 'Resume Stream' : 'Pause'}</span>
            </button>

            {/* Stream Speed Dropdown */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-0.5 flex text-xs font-mono">
              {[
                { label: '1s', val: 1000 },
                { label: '2s', val: 2000 },
                { label: '4s', val: 4000 },
              ].map(s => (
                <button
                  key={s.val}
                  onClick={() => setStreamIntervalMs(s.val)}
                  className={`px-2 py-1 rounded-lg text-[11px] transition-all ${
                    streamIntervalMs === s.val
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Audio Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Mute Alert Audio" : "Enable Alert Audio"}
              className={`p-2 rounded-xl border transition-all ${
                soundEnabled 
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' 
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Reset Button */}
            <button
              onClick={handleReset}
              title="Reset Live Stream History"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 lg:px-8 mt-6 space-y-6">

        {/* 1. Live Telemetry KPI Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Ambient Temperature */}
          <div className="glass-panel glass-card-hover rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">
                Ambient Temp
              </span>
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
                <Thermometer className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">
                {latestPoint.temperature.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-rose-400 font-mono">°C</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono border-t border-slate-800 pt-2 text-slate-400">
              <span>Nominal: 15°C – 35°C</span>
              <span className={latestPoint.temperature > 40 || latestPoint.temperature < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                {latestPoint.temperature > 40 ? 'Extreme High' : latestPoint.temperature < 0 ? 'Freezing' : 'Optimal'}
              </span>
            </div>
          </div>

          {/* Card 2: Barometric Pressure */}
          <div className="glass-panel glass-card-hover rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">
                Atm. Pressure
              </span>
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Gauge className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">
                {latestPoint.pressure.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-emerald-400 font-mono">hPa</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono border-t border-slate-800 pt-2 text-slate-400">
              <span>Standard: 1013.25</span>
              <span className={latestPoint.pressure < 990 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                {latestPoint.pressure < 990 ? 'Low System' : 'Steady'}
              </span>
            </div>
          </div>

          {/* Card 3: Relative Humidity */}
          <div className="glass-panel glass-card-hover rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">
                Rel. Humidity
              </span>
              <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                <Droplets className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-white">
                {latestPoint.humidity.toFixed(1)}
              </span>
              <span className="text-sm font-semibold text-cyan-400 font-mono">% RH</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono border-t border-slate-800 pt-2 text-slate-400">
              <span>Dewpoint: ~{(latestPoint.temperature - ((100 - latestPoint.humidity) / 5)).toFixed(1)}°C</span>
              <span className={latestPoint.humidity >= 95 ? 'text-cyan-300 font-bold' : 'text-slate-300'}>
                {latestPoint.humidity >= 95 ? 'Saturated' : 'Comfort'}
              </span>
            </div>
          </div>

          {/* Card 4: ML Contamination Index */}
          <div className="glass-panel glass-card-hover rounded-2xl p-4 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">
                ML Anomaly Score
              </span>
              <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                <Cpu className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black font-mono ${latestPoint.is_anomaly ? 'text-rose-400' : 'text-purple-300'}`}>
                {latestPoint.anomaly_score !== undefined ? latestPoint.anomaly_score.toFixed(3) : '0.000'}
              </span>
              <span className="text-xs font-mono text-slate-400">IF-Score</span>
            </div>
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono border-t border-slate-800 pt-2 text-slate-400">
              <span>Scanned: {totalReadingsScanned}</span>
              <span className={`px-2 py-0.2 rounded font-bold ${latestPoint.is_anomaly ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                {latestPoint.is_anomaly ? 'ANOMALY' : 'NORMAL'}
              </span>
            </div>
          </div>

        </section>

        {/* 2. Station Health Diagnostic HUD */}
        <section>
          <StationHealth 
            health={stationHealth} 
            stationId="AWS-STATION-ALPHA-01"
            uptimeSeconds={uptimeSeconds}
          />
        </section>

        {/* 3. Live Synchronized Multi-Spectral Telemetry Chart */}
        <section>
          <SensorCharts 
            data={telemetryData} 
            isDetecting={isDetecting}
            anomalyCount={anomalies.length}
          />
        </section>

        {/* 4. Two-Column Layout: Interactive Fault Lab & Anomaly Diagnostics Feed */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <FaultLab 
            onInjectFault={handleInjectFault} 
            isInjecting={isDetecting} 
          />
          <AnomalyAlerts 
            anomalies={anomalies} 
            onClear={() => setAnomalies([])} 
          />
        </section>

      </main>

      {/* Futuristic Mission Control Footer */}
      <footer className="mt-16 border-t border-white/10 bg-slate-950/60 py-6 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>SkyGuard AI Autonomous Meteorological Edge Security System</span>
          </div>
          <div>
            Built with React 19 • Vite • FastAPI • Scikit-Learn Isolation Forest
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;