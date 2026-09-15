import type { SensorReading, AnomalyResponse, StationHealth } from '../types';

const CLOUD_RENDER_URL = 'https://skyguard-ai-backend-vh2h.onrender.com';
const LOCAL_DEV_URL = 'http://127.0.0.1:8000';

// Determine initial candidate URLs to check
const CANDIDATE_URLS: string[] = [];

if (import.meta.env.VITE_API_BASE_URL) {
  CANDIDATE_URLS.push(import.meta.env.VITE_API_BASE_URL.replace(/\/$/, ''));
}
CANDIDATE_URLS.push(CLOUD_RENDER_URL);
CANDIDATE_URLS.push(LOCAL_DEV_URL);
CANDIDATE_URLS.push('http://localhost:8000');

// Deduplicate URLs
const UNIQUE_URLS = Array.from(new Set(CANDIDATE_URLS));

let resolvedBaseUrl = UNIQUE_URLS[0];

/**
 * Intelligent fetch wrapper with automatic failover between Cloud Render and Local Backend
 */
async function fetchWithFailover(endpoint: string, options?: RequestInit): Promise<Response> {
  // First attempt with current resolved URL
  const primaryUrl = `${resolvedBaseUrl}${endpoint}`;
  try {
    const res = await fetch(primaryUrl, options);
    if (res.ok) return res;
  } catch {
    // Primary failed, proceed to try fallback candidates
  }

  // Iterate other candidate endpoints
  for (const candidate of UNIQUE_URLS) {
    if (candidate === resolvedBaseUrl) continue;
    try {
      const candidateUrl = `${candidate}${endpoint}`;
      const res = await fetch(candidateUrl, options);
      if (res.ok) {
        resolvedBaseUrl = candidate;
        return res;
      }
    } catch {
      // Continue to next candidate
    }
  }

  throw new Error(`All backend candidates unreachable for endpoint ${endpoint}`);
}

export const api = {
  getActiveUrl: () => resolvedBaseUrl,

  detectAnomaly: async (reading: SensorReading): Promise<AnomalyResponse> => {
    const response = await fetchWithFailover('/detect', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(reading),
    });
    return response.json();
  },

  getStationHealth: async (): Promise<StationHealth> => {
    const response = await fetchWithFailover('/health', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    const data = await response.json();
    return {
      score: typeof data.score === 'number' ? data.score : 98.5,
      status: data.status === 'healthy' ? 'Healthy' : (data.status || 'Healthy'),
      last_updated: data.timestamp || new Date().toISOString()
    };
  },

  getModelInfo: async (): Promise<any> => {
    const response = await fetchWithFailover('/models/info', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Accept': 'application/json',
      }
    });
    return response.json();
  }
};