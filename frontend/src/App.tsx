import { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import type { 
  SensorReading, 
  AnomalyIncident, 
  StationHealth as StationHealthType, 
  TelemetryPoint,
  StationInfo,
  DriftAnalysisReport
} from './types';
import { api } from './services/api';

import NavigationShell from './components/NavigationShell';
import LiveTelemetryPage from './pages/LiveTelemetryPage';
import LiveSatelliteFeedPage from './pages/LiveSatelliteFeedPage';
import FleetNetworkPage from './pages/FleetNetworkPage';
import SensorDriftPage from './pages/SensorDriftPage';
import TestingLabPage from './pages/TestingLabPage';
import IncidentsPage from './pages/IncidentsPage';
import BenchmarksPage from './pages/BenchmarksPage';
import SettingsPage from './pages/SettingsPage';

const ANCHOR_STATIONS: StationInfo[] = [
  { id: 'AWS-IND-076', name: 'Safdarjung Observatory', state: 'Delhi', climate_zone: 'GANGETIC_PLAINS', elevation_m: 216, status: 'Operational', health_score: 98.8, is_edge_mode: false, latitude: 28.58, longitude: 77.20, last_ping: null },
  { id: 'AWS-IND-001', name: 'Leh Alpine Gateway', state: 'Ladakh', climate_zone: 'WESTERN_HIMALAYAS', elevation_m: 3500, status: 'Operational', health_score: 97.4, is_edge_mode: true, latitude: 34.15, longitude: 77.57, last_ping: null },
  { id: 'AWS-IND-216', name: 'Phalodi Arid Station', state: 'Rajasthan', climate_zone: 'THAR_DESERT', elevation_m: 220, status: 'Operational', health_score: 96.2, is_edge_mode: true, latitude: 27.13, longitude: 72.36, last_ping: null },
  { id: 'AWS-IND-296', name: 'Colaba Coastal AWS', state: 'Maharashtra', climate_zone: 'TROPICAL_COASTAL', elevation_m: 11, status: 'Operational', health_score: 99.1, is_edge_mode: false, latitude: 18.90, longitude: 72.81, last_ping: null },
  { id: 'AWS-IND-431', name: 'Bengaluru Tech Tableland', state: 'Karnataka', climate_zone: 'DECCAN_PLATEAU', elevation_m: 920, status: 'Operational', health_score: 98.5, is_edge_mode: false, latitude: 12.97, longitude: 77.59, last_ping: null },
  { id: 'AWS-IND-012', name: 'Shimla Ridge Observatory', state: 'Himachal Pradesh', climate_zone: 'WESTERN_HIMALAYAS', elevation_m: 2200, status: 'Operational', health_score: 95.8, is_edge_mode: true, latitude: 31.10, longitude: 77.17, last_ping: null }
];

function App() {
  // Active Station Metadata
  const [currentStation, setCurrentStation] = useState<StationInfo>(ANCHOR_STATIONS[0]);

  // Edge / Offline Mode Simulation State
  const [isEdgeOfflineMode, setIsEdgeOfflineMode] = useState<boolean>(false);
  const [offlineBufferedCount, setOfflineBufferedCount] = useState<number>(0);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Telemetry stream state
  const [telemetryData, setTelemetryData] = useState<TelemetryPoint[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyIncident[]>([]);
  const [totalReadingsScanned, setTotalReadingsScanned] = useState(0);

  // Health and Drift status
  const [stationHealth, setStationHealth] = useState<StationHealthType>({
    score: 98.8,
    status: 'Healthy'
  });
  const [driftReport, setDriftReport] = useState<DriftAnalysisReport | null>(null);

  // Stream controls
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [streamIntervalMs, setStreamIntervalMs] = useState<number>(2000);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Audio synthesizer ref
  const audioContextRef = useRef<AudioContext | null>(null);

  // Play auditory alarm
  const playAlertSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio Context init error:", e);
    }
  }, [soundEnabled]);

  // Live Real-World Satellite Weather Anchor
  const [satelliteAnchorActive, setSatelliteAnchorActive] = useState<boolean>(false);
  const lastBaseRef = useRef<{ temp: number; press: number; hum: number; isReal: boolean }>({
    temp: 28.0,
    press: 1008.0,
    hum: 65.0,
    isReal: false
  });

  // Calculate baseline pressure from standard ISA barometric equation if satellite is connecting
  const getExpectedPressure = (elevation_m: number): number => {
    return +(1013.25 * Math.pow(1 - (0.0065 * elevation_m) / 288.15, 5.25588)).toFixed(1);
  };

  // Synchronize real-world satellite atmospheric observations for currentStation
  useEffect(() => {
    let isMounted = true;
    const syncRealSatelliteBaseline = async () => {
      try {
        const liveReport = await api.getLiveWeather(currentStation.id);
        if (isMounted && liveReport?.observation) {
          const obs = liveReport.observation;
          if (typeof obs.temperature === 'number' && typeof obs.surface_pressure === 'number') {
            lastBaseRef.current = {
              temp: obs.temperature,
              press: obs.surface_pressure,
              hum: obs.relative_humidity,
              isReal: true
            };
            setSatelliteAnchorActive(true);
          }
        }
      } catch (err) {
        console.warn("[SkyGuard] Satellite anchor sync fallback:", err);
      }
    };

    syncRealSatelliteBaseline();
    // Re-sync with real satellite constellation every 60 seconds
    const syncInterval = setInterval(syncRealSatelliteBaseline, 60000);
    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
  }, [currentStation.id]);

  // Generate live high-frequency AWS telemetry ticks anchored around REAL satellite observations
  const generateNormalReading = useCallback((): SensorReading => {
    const base = lastBaseRef.current;

    // When real satellite observations are active, generate natural high-frequency micro-sensor variations
    // (+/-0.15°C, +/-0.15 hPa, +/-0.4% RH) around the actual physical satellite observations
    if (base.isReal) {
      const t = +(base.temp + (Math.random() * 0.3 - 0.15)).toFixed(1);
      const p = +(base.press + (Math.random() * 0.3 - 0.15)).toFixed(1);
      const h = Math.min(100.0, Math.max(5.0, +(base.hum + (Math.random() * 0.8 - 0.4)).toFixed(1)));

      return {
        station_id: currentStation.id,
        climate_zone: currentStation.climate_zone,
        elevation_m: currentStation.elevation_m,
        temperature: t,
        pressure: p,
        humidity: h,
        timestamp: new Date().toISOString()
      };
    }

    // Baseline fallback if initial satellite query is pending
    const zone = currentStation.climate_zone;
    const basePress = getExpectedPressure(currentStation.elevation_m);

    let baseTemp = 28.0;
    let baseHum = 65.0;

    if (zone === 'WESTERN_HIMALAYAS') {
      baseTemp = -2.0 + Math.random() * 8.0;
      baseHum = 45.0 + Math.random() * 20.0;
    } else if (zone === 'THAR_DESERT') {
      baseTemp = 42.0 + Math.random() * 6.0;
      baseHum = 20.0 + Math.random() * 15.0;
    } else if (zone === 'TROPICAL_COASTAL') {
      baseTemp = 29.0 + Math.random() * 4.0;
      baseHum = 88.0 + Math.random() * 10.0;
    } else if (zone === 'GANGETIC_PLAINS') {
      baseTemp = 32.0 + Math.random() * 5.0;
      baseHum = 65.0 + Math.random() * 20.0;
    } else if (zone === 'DECCAN_PLATEAU') {
      baseTemp = 27.0 + Math.random() * 5.0;
      baseHum = 55.0 + Math.random() * 20.0;
    }

    const t = +(baseTemp + (Math.random() * 0.3 - 0.15)).toFixed(1);
    const p = +(basePress + (Math.random() * 0.3 - 0.15)).toFixed(1);
    const h = Math.min(100.0, Math.max(5.0, +(baseHum + (Math.random() * 0.8 - 0.4)).toFixed(1)));

    return {
      station_id: currentStation.id,
      climate_zone: currentStation.climate_zone,
      elevation_m: currentStation.elevation_m,
      temperature: t,
      pressure: p,
      humidity: h,
      timestamp: new Date().toISOString()
    };
  }, [currentStation]);

  // Process incoming sensor reading
  const processSensorReading = useCallback(async (reading: SensorReading) => {
    const isOffline = isEdgeOfflineMode;
    const response = await api.detectAnomaly(reading, isOffline);

    setTotalReadingsScanned(prev => prev + 1);
    if (isOffline) {
      setOfflineBufferedCount(api.getOfflineBufferCount());
    }

    const newPoint: TelemetryPoint = {
      ...reading,
      is_anomaly: response.is_anomaly,
      is_genuine_extreme: response.is_genuine_extreme,
      fault_type: response.fault_type,
      anomaly_score: response.anomaly_score,
      corrected_temperature: response.corrected_values?.temperature,
      corrected_pressure: response.corrected_values?.pressure,
      corrected_humidity: response.corrected_values?.humidity,
    };

    setTelemetryData(prev => {
      const updated = [...prev, newPoint];
      return updated.length > 50 ? updated.slice(updated.length - 50) : updated;
    });

    if (response.is_anomaly) {
      playAlertSound();
      const incident: AnomalyIncident = {
        id: `INC-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        timestamp: reading.timestamp || new Date().toISOString(),
        reading,
        ...response
      };
      setAnomalies(prev => [incident, ...prev.slice(0, 49)]);
    }

    if (response.drift_details) {
      setDriftReport(response.drift_details);
    }

    setStationHealth(prev => {
      let nextScore = prev.score;
      if (response.is_anomaly) {
        nextScore = Math.max(30, nextScore - 12);
      } else if (!response.is_genuine_extreme) {
        nextScore = Math.min(99.5, nextScore + 0.8);
      }
      return {
        score: nextScore,
        status: nextScore >= 80 ? 'Healthy' : nextScore >= 50 ? 'Warning' : 'Critical'
      };
    });
  }, [isEdgeOfflineMode, playAlertSound]);

  // Automated stream loop
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      const reading = generateNormalReading();
      processSensorReading(reading);
    }, streamIntervalMs);

    return () => clearInterval(timer);
  }, [isPaused, streamIntervalMs, processSensorReading, generateNormalReading]);

  // Reset all historical stream data
  const handleReset = () => {
    setTelemetryData([]);
    setAnomalies([]);
    setTotalReadingsScanned(0);
    setStationHealth({ score: 98.8, status: 'Healthy' });
  };

  // Switch station
  const handleSelectStation = (station: StationInfo) => {
    setCurrentStation(station);
    lastBaseRef.current = {
      temp: station.climate_zone === 'WESTERN_HIMALAYAS' ? -2.0 : station.climate_zone === 'THAR_DESERT' ? 42.0 : 26.0,
      press: station.elevation_m > 1000 ? 750.0 : 1008.0,
      hum: station.climate_zone === 'TROPICAL_COASTAL' ? 88.0 : 55.0,
      isReal: false
    };
    handleReset();
  };

  // Sync edge buffer to cloud
  const handleSyncEdgeBuffer = async () => {
    const synced = await api.flushOfflineBuffer(currentStation.id);
    setOfflineBufferedCount(api.getOfflineBufferCount());
    setSyncFeedback(`Successfully synced ${synced} buffered telemetry samples to central database!`);
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  return (
    <BrowserRouter>
      <NavigationShell
        currentStation={currentStation}
        anchorStations={ANCHOR_STATIONS}
        onSelectStation={handleSelectStation}
        isEdgeOfflineMode={isEdgeOfflineMode}
        offlineBufferedCount={offlineBufferedCount}
        onSyncEdgeBuffer={handleSyncEdgeBuffer}
        syncFeedback={syncFeedback}
      >
        <Routes>
          {/* Page 1: Live Station Telemetry */}
          <Route 
            path="/" 
            element={
              <LiveTelemetryPage 
                currentStation={currentStation}
                stationHealth={stationHealth}
                telemetryData={telemetryData}
                totalReadingsScanned={totalReadingsScanned}
                isPaused={isPaused}
                onTogglePause={() => setIsPaused(!isPaused)}
                streamIntervalMs={streamIntervalMs}
                onChangeInterval={setStreamIntervalMs}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
                onReset={handleReset}
                isSatelliteAnchored={satelliteAnchorActive}
              />
            } 
          />

          {/* Page 2: Real-World Live Satellite Feed (Free Open-Meteo API) */}
          <Route 
            path="/live-feed" 
            element={
              <LiveSatelliteFeedPage 
                currentStation={currentStation}
                anchorStations={ANCHOR_STATIONS}
                onSelectStation={handleSelectStation}
              />
            } 
          />

          {/* Page 3: 550 Fleet Network */}
          <Route 
            path="/fleet" 
            element={
              <FleetNetworkPage 
                currentStationId={currentStation.id}
                onSelectStation={handleSelectStation}
              />
            } 
          />

          {/* Page 4: CUSUM Sensor Drift */}
          <Route 
            path="/drift" 
            element={
              <SensorDriftPage 
                currentStation={currentStation}
                driftReport={driftReport}
              />
            } 
          />

          {/* Page 5: Testing & Fault Laboratory */}
          <Route 
            path="/testing" 
            element={
              <TestingLabPage 
                currentStation={currentStation}
                onInjectFault={processSensorReading}
                isInjecting={false}
                recentAnomalies={anomalies}
              />
            } 
          />

          {/* Page 6: Incidents Console */}
          <Route 
            path="/incidents" 
            element={
              <IncidentsPage 
                anomalies={anomalies}
                onClearAnomalies={() => setAnomalies([])}
              />
            } 
          />

          {/* Page 7: IMD Performance Benchmarks */}
          <Route 
            path="/benchmarks" 
            element={<BenchmarksPage />} 
          />

          {/* Page 8: System Settings */}
          <Route 
            path="/settings" 
            element={
              <SettingsPage 
                currentStation={currentStation}
                isEdgeOfflineMode={isEdgeOfflineMode}
                onToggleEdgeMode={setIsEdgeOfflineMode}
                offlineBufferedCount={offlineBufferedCount}
                onSyncEdgeBuffer={handleSyncEdgeBuffer}
                syncFeedback={syncFeedback}
                soundEnabled={soundEnabled}
                onToggleSound={() => setSoundEnabled(!soundEnabled)}
                streamIntervalMs={streamIntervalMs}
                onChangeInterval={setStreamIntervalMs}
              />
            } 
          />

          {/* Fallback to Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </NavigationShell>
    </BrowserRouter>
  );
}

export default App;