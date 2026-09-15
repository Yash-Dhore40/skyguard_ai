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

export interface StationHealth {
  score: number; // 0-100
  status: string; // e.g., 'Healthy', 'Warning', 'Critical'
  last_updated: string;
}