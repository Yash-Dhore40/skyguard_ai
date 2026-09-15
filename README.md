# SkyGuard AI - Intelligent Anomaly Detection for Automatic Weather Stations

## Overview
SkyGuard AI is a full-stack web application designed to detect anomalies in Automatic Weather Station (AWS) data streams using AI/ML techniques. The system analyzes temperature, pressure, and humidity readings to distinguish between genuine meteorological events and sensor faults.

## Features
- **Real-time Anomaly Detection**: Uses Isolation Forest and statistical methods to identify anomalies
- **Fault Classification**: Identifies specific fault types (spikes, drift, frozen sensors, thermodynamic inconsistencies)
- **Explainable AI**: Provides human-readable explanations for detected anomalies
- **Self-Healing Data**: Suggests corrected values for anomalous readings
- **Dynamic Health Scoring**: Provides a 0-100 station health score
- **Interactive Dashboard**: Real-time charts and visualizations
- **Fault Laboratory**: Simulate various sensor faults for testing

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **ML Library**: Scikit-learn (Isolation Forest)
- **Data Processing**: Pandas, NumPy
- **API**: RESTful endpoints with automatic documentation
- **ASGI Server**: Uvicorn

### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts for real-time data visualization
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Project Structure
```
skyguard_ai/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── requirements.txt        # Python dependencies
│   └── models/                 # Trained ML models (auto-generated)
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── AnomalyAlerts.tsx
│   │   │   ├── FaultLab.tsx
│   │   │   ├── SensorCharts.tsx
│   │   │   └── StationHealth.tsx
│   │   ├── services/           # API service layer
│   │   │   └── api.ts
│   │   ├── types/              # TypeScript interfaces
│   │   │   └── index.ts
│   │   ├── utils/              # Utility functions
│   │   ├── App.tsx             # Main application component
│   │   ├── index.css           # Tailwind styles
│   │   └── main.tsx            # Entry point
│   ├── package.json            # npm dependencies
│   ├── tailwind.config.js      # Tailwind configuration
│   └── vite.config.ts          # Vite configuration
└── README.md                   # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v16+)
- Python (v3.8+)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd skyguard_ai/backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the server:
   ```bash
   python main.py
   ```
   The API will be available at `http://localhost:8000`

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd skyguard_ai/frontend
   ```
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`

## API Endpoints

### POST `/detect`
Detect anomalies in sensor readings
- **Request Body**:
  ```json
  {
    "temperature": 25.5,
    "pressure": 1013.2,
    "humidity": 65.0,
    "timestamp": "2026-09-16T10:30:00Z"
  }
  ```
- **Response**:
  ```json
  {
    "is_anomaly": true,
    "anomaly_score": -0.15,
    "fault_type": "TEMPERATURE_SPIKE",
    "confidence": 0.87,
    "explanation": "Temperature spike detected: 40.5°C is 2.3 standard deviations from normal.",
    "corrected_values": {
      "temperature": 25.0,
      "pressure": 1013.0,
      "humidity": 60.0
    }
  }
  ```

### GET `/health`
Get station health status
- **Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-09-16T10:30:00Z"
  }
  ```

### GET `/models/info`
Get information about loaded models
- **Response**:
  ```json
  {
    "isolation_forest_loaded": true,
    "scaler_loaded": true,
    "historical_data_points": 1245,
    "feature_names": ["temperature", "pressure", "humidity"]
  }
  ```

## Usage
1. Start both backend and frontend servers
2. Open the frontend in your browser (typically http://localhost:5173)
3. The system will automatically:
   - Generate simulated sensor data every 2 seconds
   - Send data to the backend for anomaly detection
   - Display real-time charts of temperature, pressure, and humidity
   - Show station health score (0-100)
   - Display any detected anomalies with explanations and suggested corrections
   - Allow you to simulate specific faults using the Fault Laboratory

## Fault Types Detected
- **TEMPERATURE_SPIKE**: Sudden abnormal temperature changes
- **PRESSURE_SPIKE**: Sudden abnormal pressure changes
- **HUMIDITY_SPIKE**: Sudden abnormal humidity changes
- **TEMPERATURE_DRIFT**: Gradual temperature sensor deviation
- **PRESSURE_DRIFT**: Gradual pressure sensor deviation
- **HUMIDITY_DRIFT**: Gradual humidity sensor deviation
- **FROZEN_SENSOR**: Sensor readings stuck at constant values
- **THERMODYNAMIC_INCONSISTENCY**: Physically impossible combinations (e.g., very hot with very high humidity)
- **PRESSURE_ANOMALY**: Pressure values outside realistic atmospheric range

## Customization
- Adjust anomaly detection sensitivity in `backend/main.py` (contamination parameter, Z-score thresholds)
- Modify fault classification logic in the `classify_fault` function
- Update normal value ranges in `generate_synthetic_normal_data` function
- Customize the frontend UI by modifying components in `frontend/src/components/`

## Deployment
The application is designed for easy deployment:
- **Backend**: Can be deployed to any Python-supporting platform (Render, Railway, AWS, etc.)
- **Frontend**: Built with Vite, can be deployed to Vercel, Netlify, or any static hosting service
- **Database**: Currently uses in-memory storage; can be extended to use PostgreSQL or other databases

## Future Enhancements
- Integration with real AWS hardware via serial/API interfaces
- Spatial correlation with neighboring weather stations
- Predictive maintenance forecasting
- Edge AI deployment on ESP32/Raspberry Pi
- Multi-station dashboard and network view
- Historical data analysis and reporting
- User authentication and role-based access
- Export functionality for reports and logs

## License
MIT License - Feel free to use, modify, and distribute this project.

---
*SkyGuard AI - Ensuring reliable weather data through intelligent anomaly detection*