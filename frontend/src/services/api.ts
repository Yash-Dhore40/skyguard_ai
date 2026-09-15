import type { SensorReading, AnomalyResponse, StationHealth } from '../types';

const LIVE_RENDER_URL = 'https://skyguard-ai-backend-vh2h.onrender.com';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }
  return LIVE_RENDER_URL;
};

const API_BASE_URL = getBaseUrl();

export const api = {
  detectAnomaly: async (reading: SensorReading): Promise<AnomalyResponse> => {
    const response = await fetch(`${API_BASE_URL}/detect`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(reading),
    });
    if (!response.ok) {
      throw new Error(`Detection request failed: HTTP ${response.status}`);
    }
    return response.json();
  },

  getStationHealth: async (): Promise<StationHealth> => {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`Health check failed: HTTP ${response.status}`);
    }
    const data = await response.json();
    return {
      score: typeof data.score === 'number' ? data.score : 98.5,
      status: data.status === 'healthy' ? 'Healthy' : (data.status || 'Healthy'),
      last_updated: data.timestamp || new Date().toISOString()
    };
  },

  getModelInfo: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/models/info`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    if (!response.ok) {
      throw new Error(`Model info failed: HTTP ${response.status}`);
    }
    return response.json();
  }
};