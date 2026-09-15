from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import joblib
import os
from typing import List, Optional

app = FastAPI(title="SkyGuard AI - Anomaly Detection for AWS", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class SensorReading(BaseModel):
    temperature: float  # Celsius
    pressure: float     # hPa
    humidity: float     # %
    timestamp: Optional[str] = None

class AnomalyResponse(BaseModel):
    is_anomaly: bool
    anomaly_score: float
    fault_type: Optional[str] = None
    confidence: float
    explanation: str
    corrected_values: Optional[dict] = None

# Global variables for models and data
isolation_forest = None
scaler = None
feature_names = ['temperature', 'pressure', 'humidity']
historical_data = []

@app.on_event("startup")
async def startup_event():
    """Load models and initialize on startup"""
    global isolation_forest, scaler
    try:
        # Try to load pre-trained models
        if os.path.exists("models/isolation_forest.pkl"):
            isolation_forest = joblib.load("models/isolation_forest.pkl")
            scaler = joblib.load("models/scaler.pkl")
            print("Loaded pre-trained models")
        else:
            # Initialize with dummy models for demo
            from sklearn.ensemble import IsolationForest
            from sklearn.preprocessing import StandardScaler
            isolation_forest = IsolationForest(contamination=0.1, random_state=42)
            scaler = StandardScaler()
            # Train with some synthetic normal data
            normal_data = generate_synthetic_normal_data(1000)
            scaled_data = scaler.fit_transform(normal_data)
            isolation_forest.fit(scaled_data)
            print("Initialized and trained new models")
    except Exception as e:
        print(f"Error loading models: {e}")
        # Fallback initialization
        from sklearn.ensemble import IsolationForest
        from sklearn.preprocessing import StandardScaler
        isolation_forest = IsolationForest(contamination=0.1, random_state=42)
        scaler = StandardScaler()
        normal_data = generate_synthetic_normal_data(1000)
        scaled_data = scaler.fit_transform(normal_data)
        isolation_forest.fit(scaled_data)

def generate_synthetic_normal_data(n_samples=1000):
    """Generate synthetic normal weather data for initial training"""
    np.random.seed(42)
    # Typical ranges for weather data
    temp = np.random.normal(25, 8, n_samples)  # 25°C ± 8°C
    pressure = np.random.normal(1013, 15, n_samples)  # 1013 hPa ± 15 hPa
    humidity = np.random.normal(60, 20, n_samples)  # 60% ± 20%
    
    # Ensure realistic bounds
    temp = np.clip(temp, -10, 50)
    pressure = np.clip(pressure, 980, 1050)
    humidity = np.clip(humidity, 10, 100)
    
    return np.column_stack([temp, pressure, humidity])

def detect_anomalies(temperature, pressure, humidity):
    """Detect anomalies using Isolation Forest and statistical methods"""
    global isolation_forest, scaler, historical_data
    
    # Prepare features
    features = np.array([[temperature, pressure, humidity]])
    
    # Statistical checks
    temp_zscore, pressure_zscore, humidity_zscore = calculate_z_scores(temperature, pressure, humidity)
    rate_of_change_score = calculate_rate_of_change(temperature, pressure, humidity)
    
    # ML-based anomaly detection
    try:
        scaled_features = scaler.transform(features)
        anomaly_score = isolation_forest.decision_function(scaled_features)[0]
        is_anomaly_ml = isolation_forest.predict(scaled_features)[0] == -1
    except:
        # Fallback if scaler not fitted
        anomaly_score = 0.0
        is_anomaly_ml = False
    
    # Combine scores
    statistical_threshold = 2.5  # Z-score threshold
    ml_threshold = 0.0  # Isolation Forest threshold (negative = anomaly)
    
    statistical_anomaly = (
        abs(temp_zscore) > statistical_threshold or 
        abs(pressure_zscore) > statistical_threshold or 
        abs(humidity_zscore) > statistical_threshold
    )
    
    ml_anomaly = is_anomaly_ml
    
    # Final decision (ensemble approach)
    is_anomaly = statistical_anomaly or ml_anomaly
    
    # Fault classification
    fault_type = classify_fault(temperature, pressure, humidity, temp_zscore, pressure_zscore, humidity_zscore)
    
    # Confidence score (simplified)
    confidence = min(0.95, max(0.5, 1.0 - abs(anomaly_score)))
    
    # Explanation
    explanation = generate_explanation(temperature, pressure, humidity, fault_type, temp_zscore, pressure_zscore, humidity_zscore)
    
    # Corrected values (if anomaly detected)
    corrected_values = None
    if is_anomaly:
        corrected_values = get_corrected_values(temperature, pressure, humidity)
    
    return {
        "is_anomaly": bool(is_anomaly),
        "anomaly_score": float(anomaly_score),
        "fault_type": fault_type,
        "confidence": float(confidence),
        "explanation": explanation,
        "corrected_values": corrected_values
    }

def calculate_z_scores(temp, press, hum):
    """Calculate Z-scores based on historical data"""
    global historical_data
    if len(historical_data) < 10:
        # Use synthetic baselines if insufficient history
        temp_mean, temp_std = 25, 8
        press_mean, press_std = 1013, 15
        hum_mean, hum_std = 60, 20
    else:
        # Calculate from historical data
        hist_array = np.array(historical_data)
        temp_mean, temp_std = np.mean(hist_array[:, 0]), np.std(hist_array[:, 0]) or 1
        press_mean, press_std = np.mean(hist_array[:, 1]), np.std(hist_array[:, 1]) or 1
        hum_mean, hum_std = np.mean(hist_array[:, 2]), np.std(hist_array[:, 2]) or 1
    
    temp_z = (temp - temp_mean) / temp_std if temp_std > 0 else 0
    press_z = (press - press_mean) / press_std if press_std > 0 else 0
    hum_z = (hum - hum_mean) / hum_std if hum_std > 0 else 0
    
    return temp_z, press_z, hum_z

def calculate_rate_of_change(temp, press, hum):
    """Calculate rate of change anomaly score"""
    global historical_data
    if len(historical_data) < 2:
        return 0.0
    
    # Get last reading
    last_temp, last_press, last_hum = historical_data[-1]
    
    # Calculate rate of change (per minute assumption)
    temp_rate = abs(temp - last_temp)
    press_rate = abs(press - last_press)
    hum_rate = abs(hum - last_hum)
    
    # Normalize rates (typical max changes per minute)
    temp_rate_score = min(temp_rate / 5.0, 1.0)  # 5°C/min max
    press_rate_score = min(press_rate / 10.0, 1.0)  # 10 hPa/min max
    hum_rate_score = min(hum_rate / 20.0, 1.0)   # 20%/min max
    
    return max(temp_rate_score, press_rate_score, hum_rate_score)

def classify_fault(temp, press, hum, temp_z, press_z, hum_z):
    """Classify the type of fault based on patterns"""
    # Check for frozen values (if we have history)
    if len(historical_data) >= 3:
        last_three = np.array(historical_data[-3:])
        temp_std = np.std(last_three[:, 0])
        press_std = np.std(last_three[:, 1])
        hum_std = np.std(last_three[:, 2])
        
        if temp_std < 0.1 and press_std < 0.1 and hum_std < 0.1:
            return "FROZEN_SENSOR"
    
    # Check for drift (consistent offset)
    if len(historical_data) >= 10:
        recent_avg = np.mean(np.array(historical_data[-10:]), axis=0)
        temp_drift = abs(temp - recent_avg[0])
        press_drift = abs(press - recent_avg[1])
        hum_drift = abs(hum - recent_avg[2])
        
        if temp_drift > 5 or press_drift > 20 or hum_drift > 30:
            if temp_drift > press_drift and temp_drift > hum_drift:
                return "TEMPERATURE_DRIFT"
            elif press_drift > temp_drift and press_drift > hum_drift:
                return "PRESSURE_DRIFT"
            else:
                return "HUMIDITY_DRIFT"
    
    # Check for spikes
    if abs(temp_z) > 3 or abs(press_z) > 3 or abs(hum_z) > 3:
        if abs(temp_z) > abs(press_z) and abs(temp_z) > abs(hum_z):
            return "TEMPERATURE_SPIKE"
        elif abs(press_z) > abs(temp_z) and abs(press_z) > abs(hum_z):
            return "PRESSURE_SPIKE"
        else:
            return "HUMIDITY_SPIKE"
    
    # Check thermodynamic consistency
    # Basic checks: temperature and humidity relationship, pressure extremes
    if temp > 45 and hum > 90:  # Unrealistic hot and humid
        return "THERMODYNAMIC_INCONSISTENCY"
    if temp < -10 and hum > 80:  # Unrealistic cold and humid
        return "THERMODYNAMIC_INCONSISTENCY"
    if press < 950 or press > 1050:  # Extreme pressure
        return "PRESSURE_ANOMALY"
    
    return "UNKNOWN_ANOMALY"

def generate_explanation(temp, press, hum, fault_type, temp_z, press_z, hum_z):
    """Generate human-readable explanation"""
    explanations = {
        "FROZEN_SENSOR": f"Sensor readings appear frozen: Temp={temp:.1f}°C, Pressure={press:.1f} hPa, Humidity={hum:.1f}% showing no variation over time.",
        "TEMPERATURE_DRIFT": f"Temperature drift detected: Reading {temp:.1f}°C deviates significantly from recent baseline.",
        "PRESSURE_DRIFT": f"Pressure drift detected: Reading {press:.1f} hPa deviates significantly from recent baseline.",
        "HUMIDITY_DRIFT": f"Humidity drift detected: Reading {hum:.1f}% deviates significantly from recent baseline.",
        "TEMPERATURE_SPIKE": f"Temperature spike detected: {temp:.1f}°C is {abs(temp_z):.1f} standard deviations from normal.",
        "PRESSURE_SPIKE": f"Pressure spike detected: {press:.1f} hPa is {abs(press_z):.1f} standard deviations from normal.",
        "HUMIDITY_SPIKE": f"Humidity spike detected: {hum:.1f}% is {abs(hum_z):.1f} standard deviations from normal.",
        "THERMODYNAMIC_INCONSISTENCY": f"Thermodynamic inconsistency: Temperature ({temp:.1f}°C) and humidity ({hum:.1f}%) combination is physically unrealistic.",
        "PRESSURE_ANOMALY": f"Pressure anomaly: Reading {press:.1f} hPa is outside realistic atmospheric range.",
        "UNKNOWN_ANOMALY": f"Anomaly detected in multi-sensor readings: T={temp:.1f}°C, P={press:.1f} hPa, H={hum:.1f}%"
    }
    
    return explanations.get(fault_type, f"Anomaly detected: T={temp:.1f}°C, P={press:.1f} hPa, H={hum:.1f}%")

def get_corrected_values(temp, press, hum):
    """Generate corrected/imputed values for anomalous readings"""
    global historical_data
    if len(historical_data) < 5:
        # Use synthetic baselines
        return {
            "temperature": 25.0,
            "pressure": 1013.0,
            "humidity": 60.0
        }
    
    # Use moving average of recent good values
    recent_data = np.array(historical_data[-10:])  # Last 10 readings
    # Simple approach: use median to reduce outlier influence
    corrected_temp = np.median(recent_data[:, 0])
    corrected_press = np.median(recent_data[:, 1])
    corrected_hum = np.median(recent_data[:, 2])
    
    return {
        "temperature": float(corrected_temp),
        "pressure": float(corrected_press),
        "humidity": float(corrected_hum)
    }

@app.post("/detect", response_model=AnomalyResponse)
async def detect_anomaly(reading: SensorReading):
    """Main endpoint for anomaly detection"""
    try:
        # Set timestamp if not provided
        if not reading.timestamp:
            reading.timestamp = datetime.now().isoformat()
        
        # Detect anomaly
        result = detect_anomalies(reading.temperature, reading.pressure, reading.humidity)
        
        # Add to historical data (for drift/frozen detection)
        historical_data.append([reading.temperature, reading.pressure, reading.humidity])
        # Keep only last 1000 readings to prevent memory issues
        if len(historical_data) > 1000:
            historical_data.pop(0)
        
        return AnomalyResponse(**result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/models/info")
async def model_info():
    """Get information about loaded models"""
    return {
        "isolation_forest_loaded": isolation_forest is not None,
        "scaler_loaded": scaler is not None,
        "historical_data_points": len(historical_data),
        "feature_names": feature_names
    }

if __name__ == "__main__":
    # Create models directory if it doesn't exist
    os.makedirs("models", exist_ok=True)
    
    # Save initial models
    if isolation_forest is not None and scaler is not None:
        joblib.dump(isolation_forest, "models/isolation_forest.pkl")
        joblib.dump(scaler, "models/scaler.pkl")
    
    uvicorn.run(app, host="0.0.0.0", port=8000)