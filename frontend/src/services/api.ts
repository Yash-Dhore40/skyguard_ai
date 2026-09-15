import type { SensorReading, AnomalyResponse, StationHealth } from '../types';

const LIVE_RENDER_URL = 'https://skyguard-ai-backend-vh2h.onrender.com';

const getBaseUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
  }
  // Default to the live Render cloud deployment
  return LIVE_RENDER_URL;
};

const API_BASE_URL = getBaseUrl();

export const api = {
  detectAnomaly: async (reading: SensorReading): Promise<AnomalyResponse> => {
    const response = await fetch(`${API_BASE_URL}/detect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reading),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return response.json();
  },

  getStationHealth: async (): Promise<StationHealth> => {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return response.json();
  },

  getModelInfo: async (): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/models/info`);
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    return response.json();
  }
};