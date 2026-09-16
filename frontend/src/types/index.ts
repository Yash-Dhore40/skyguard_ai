export type ClimateZoneType = 
  | 'WESTERN_HIMALAYAS'
  | 'GANGETIC_PLAINS'
  | 'THAR_DESERT'
  | 'TROPICAL_COASTAL'
  | 'DECCAN_PLATEAU';

export interface SensorReading {
  temperature: number; // Celsius
  pressure: number;    // hPa
  humidity: number;    // %
  timestamp: string;
  station_id?: string;
  climate_zone?: ClimateZoneType;
  elevation_m?: number;
}

export interface DriftChannelDetail {
  drift_detected: boolean;
  cusum: number;
  ewma: number;
  slope: number;
  offset: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL_RECALIBRATION' | 'WARMING_UP';
}

export interface DriftAnalysisReport {
  is_drift_detected: boolean;
  primary_drift_channel: string | null;
  severity: string;
  explanation: string;
  recommendation: string;
  channel_details: {
    temperature: DriftChannelDetail;
    pressure: DriftChannelDetail;
    humidity: DriftChannelDetail;
  };
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
  is_genuine_extreme?: boolean;
  climate_zone?: string;
  drift_details?: DriftAnalysisReport | null;
}

export interface AnomalyIncident extends AnomalyResponse {
  id: string;
  timestamp: string;
  reading: SensorReading;
  station_id?: string;
}

export interface StationHealth {
  score: number; // 0-100
  status: string; // 'Healthy' | 'Warning' | 'Critical'
  last_updated?: string;
  uptime_seconds?: number;
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
  is_genuine_extreme?: boolean;
  fault_type?: string | null;
  anomaly_score?: number;
  corrected_temperature?: number;
  corrected_pressure?: number;
  corrected_humidity?: number;
}

export interface StationInfo {
  id: string;
  name: string;
  state: string;
  climate_zone: ClimateZoneType;
  latitude: number;
  longitude: number;
  elevation_m: number;
  status: 'Operational' | 'Degraded' | 'Critical' | 'Offline';
  health_score: number;
  is_edge_mode: boolean;
  last_ping: string | null;
}

export interface FleetSummary {
  total_stations: number;
  operational: number;
  degraded: number;
  critical: number;
  offline: number;
  edge_mode_stations: number;
  average_network_health: number;
  zone_distribution: Record<string, number>;
  southwest_monsoon_active: boolean;
}

export interface PerformanceMetrics {
  status: string;
  benchmark_timestamp: string;
  total_test_scenarios: number;
  metrics: {
    accuracy: number;
    false_positive_rate: number;
    precision: number;
    recall: number;
    f1_score: number;
    mean_inference_latency_ms: number;
  };
  confusion_matrix: {
    true_positives: number;
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
  };
  india_optimizations_verified: {
    monsoon_saturation_false_alarms_prevented: boolean;
    thar_heatwave_distinguished: boolean;
    himalayan_altitude_lapse_compensated: boolean;
    gradual_drift_detected: boolean;
  };
  case_details: Array<{
    name: string;
    zone: string;
    actual_fault: boolean;
    predicted_fault: boolean;
    classification: string;
    fault_type: string | null;
    confidence: number;
    latency_ms: number;
  }>;
}

export interface LiveSatelliteWeatherReport {
  source: string;
  station_id: string;
  station_name?: string;
  state?: string;
  climate_zone?: string;
  latitude: number;
  longitude: number;
  elevation_api: number;
  timestamp: string;
  observation: {
    temperature: number;
    relative_humidity: number;
    apparent_temperature: number;
    surface_pressure: number;
    wind_speed_kmh: number;
    weather_code: number;
    condition: string;
  };
  forecast_24h: Array<{
    time: string;
    temperature: number | null;
    humidity: number | null;
    pressure: number | null;
  }>;
  cached: boolean;
  status: string;
  ai_evaluation?: AnomalyResponse;
}