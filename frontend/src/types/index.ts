export interface SensorReading {
  temperature: number; // Celsius
  pressure: number;    // hPa
  humidity: number;    // %
  timestamp: string;
}

export interface AnomalyResponse {
  is_anomaly: boolean;
  anomaly_score: number;
  fault_type: string | null;
  confidence: number;
  explanation: string;
  corrected_values: {
    temperature: number;
    pressure: number;
    humidity: number;
  } | null;
}

export interface AnomalyIncident extends AnomalyResponse {
  id: string;
  timestamp: string;
  reading: SensorReading;
}

export interface StationHealth {
  score: number; // 0-100
  status: string; // 'Healthy' | 'Warning' | 'Critical'
  last_updated?: string;
  subsystems?: {
    temperatureSensor: 'normal' | 'drift' | 'fault';
    pressureSensor: 'normal' | 'drift' | 'fault';
    humiditySensor: 'normal' | 'drift' | 'fault';
    mlEngine: 'active' | 'degraded' | 'offline';
    uplink: 'nominal' | 'unstable' | 'down';
  };
}

export interface TelemetryPoint extends SensorReading {
  is_anomaly?: boolean;
  fault_type?: string | null;
  anomaly_score?: number;
  corrected_temperature?: number;
  corrected_pressure?: number;
  corrected_humidity?: number;
}