import './App.css';
import StationHealth from './components/StationHealth';
import SensorCharts from './components/SensorCharts';
import FaultLab from './components/FaultLab';
import AnomalyAlerts from './components/AnomalyAlerts';
import { useState, useEffect } from 'react';
import type { SensorReading, AnomalyResponse } from './types';
import { api } from './services/api';

function App() {
  const [sensorData, setSensorData] = useState<SensorReading[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyResponse[]>([]);
  const [stationHealth, setStationHealth] = useState<{ score: number; status: string }>({
    score: 100,
    status: 'Healthy'
  });
  const [isDetecting, setIsDetecting] = useState(false);

  // Generate simulated sensor data (normal conditions)
  const generateSensorReading = (): SensorReading => {
    // Base normal values with some noise
    const baseTemp = 25 + (Math.random() - 0.5) * 4; // ±2°C
    const basePressure = 1013 + (Math.random() - 0.5) * 10; // ±5 hPa
    const baseHumidity = 60 + (Math.random() - 0.5) * 20; // ±10%
    
    // Occasionally inject faults for demonstration (5% chance)
    if (Math.random() < 0.05) {
      const faultType = Math.floor(Math.random() * 4);
      switch (faultType) {
        case 0: // Temperature spike
          return {
            temperature: baseTemp + (Math.random() > 0.5 ? 15 : -15),
            pressure: basePressure,
            humidity: baseHumidity,
            timestamp: new Date().toISOString()
          };
        case 1: // Pressure spike
          return {
            temperature: baseTemp,
            pressure: basePressure + (Math.random() > 0.5 ? 30 : -30),
            humidity: baseHumidity,
            timestamp: new Date().toISOString()
          };
        case 2: // Humidity spike
          return {
            temperature: baseTemp,
            pressure: basePressure,
            humidity: baseHumidity + (Math.random() > 0.5 ? 30 : -30),
            timestamp: new Date().toISOString()
          };
        case 3: // Thermodynamic inconsistency
          return {
            temperature: baseTemp > 25 ? 45 : -10, // Extreme temp
            pressure: basePressure,
            humidity: baseTemp > 25 ? 90 : 80, // Extreme humidity
            timestamp: new Date().toISOString()
          };
        default:
          return {
            temperature: baseTemp,
            pressure: basePressure,
            humidity: baseHumidity,
            timestamp: new Date().toISOString()
          };
      }
    }
    
    return {
      temperature: baseTemp,
      pressure: basePressure,
      humidity: baseHumidity,
      timestamp: new Date().toISOString()
    };
  };

  // Fetch station health every 5 seconds
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const health = await api.getStationHealth();
        setStationHealth({
          score: health.score,
          status: health.score >= 80 ? 'Healthy' : health.score >= 50 ? 'Warning' : 'Critical'
        });
      } catch (error) {
        console.error('Failed to fetch station health:', error);
      }
    };

    fetchHealth(); // Initial fetch
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  // Generate and send sensor data every 2 seconds
  useEffect(() => {
    const generateAndSend = async () => {
      setIsDetecting(true);
      try {
        const reading = generateSensorReading();
        // Keep only last 50 readings for the chart
        setSensorData(prev => {
          const updated = [...prev, reading];
          return updated.length > 50 ? updated.slice(-50) : updated;
        });
        
        // Send to backend for anomaly detection
        const anomalyResult = await api.detectAnomaly(reading);
        if (anomalyResult.is_anomaly) {
          setAnomalies(prev => {
            const updated = [anomalyResult, ...prev];
            return updated.length > 10 ? updated.slice(0, 10) : updated;
          });
        }
      } catch (error) {
        console.error('Error in detection cycle:', error);
      } finally {
        setIsDetecting(false);
      }
    };

    const interval = setInterval(generateAndSend, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-4">
      <header className="text-center mb-6">
        <h1 className="text-3xl font-bold text-sky-300">SkyGuard AI</h1>
        <p className="text-sm text-sky-400">Intelligent Real-Time Anomaly Detection System for AWS</p>
      </header>
      
      <main className="grid gap-6">
        {/* Station Health */}
        <StationHealth health={stationHealth} />
        
        {/* Sensor Charts */}
        <SensorCharts data={sensorData} isDetecting={isDetecting} />
        
        {/* Fault Lab and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FaultLab />
          <AnomalyAlerts anomalies={anomalies} />
        </div>
      </main>
      
      <footer className="mt-8 text-center text-sm text-sky-500">
        <p>SkyGuard AI - Ensuring reliable weather data through intelligent anomaly detection</p>
      </footer>
    </div>
  );
}

export default App;