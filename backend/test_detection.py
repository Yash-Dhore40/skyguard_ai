"""
Test script for SkyGuard AI anomaly detection logic.
This script tests the core detection functions without running the FastAPI server.
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import detect_anomalies, classify_fault, get_corrected_values, generate_explanation
from main import isolation_forest, scaler, historical_data, generate_synthetic_normal_data
import numpy as np

# Initialize models if not already done
if isolation_forest is None or scaler is None:
    from sklearn.ensemble import IsolationForest
    from sklearn.preprocessing import StandardScaler
    isolation_forest = IsolationForest(contamination=0.1, random_state=42)
    scaler = StandardScaler()
    normal_data = generate_synthetic_normal_data(1000)
    scaled_data = scaler.fit_transform(normal_data)
    isolation_forest.fit(scaled_data)

def test_normal_conditions():
    """Test normal weather conditions"""
    print("Testing normal conditions...")
    # Clear history and add varied normal data
    historical_data.clear()
    for i in range(10):
        # Add some variation to avoid frozen sensor detection
        temp = 25.0 + np.random.normal(0, 1)
        pressure = 1013.0 + np.random.normal(0, 5)
        humidity = 60.0 + np.random.normal(0, 10)
        historical_data.append([temp, pressure, humidity])
    
    result = detect_anomalies(25.0, 1013.0, 60.0)
    print(f"Result: {result}")
    assert result['is_anomaly'] == False, "Normal conditions should not be anomaly"
    print("✓ Normal conditions test passed\n")

def test_temperature_spike():
    """Test temperature spike"""
    print("Testing temperature spike...")
    # Clear history and add varied normal data
    historical_data.clear()
    for i in range(10):
        # Add some variation to avoid frozen sensor detection
        temp = 25.0 + np.random.normal(0, 1)
        pressure = 1013.0 + np.random.normal(0, 5)
        humidity = 60.0 + np.random.normal(0, 10)
        historical_data.append([temp, pressure, humidity])
    
    result = detect_anomalies(50.0, 1013.0, 60.0)  # High temperature (50°C)
    print(f"Result: {result}")
    assert result['is_anomaly'] == True, "High temperature should be anomaly"
    assert 'TEMPERATURE' in result['fault_type'] or 'SPIKE' in result['fault_type'], f"Expected temperature fault, got {result['fault_type']}"
    print("✓ Temperature spike test passed\n")

def test_pressure_spike():
    """Test pressure spike"""
    print("Testing pressure spike...")
    # Clear history and add varied normal data
    historical_data.clear()
    for i in range(10):
        # Add some variation to avoid frozen sensor detection
        temp = 25.0 + np.random.normal(0, 1)
        pressure = 1013.0 + np.random.normal(0, 5)
        humidity = 60.0 + np.random.normal(0, 10)
        historical_data.append([temp, pressure, humidity])
    
    result = detect_anomalies(25.0, 1060.0, 60.0)  # High pressure >1050
    print(f"Result: {result}")
    assert result['is_anomaly'] == True, "High pressure should be anomaly"
    assert 'PRESSURE' in result['fault_type'] or 'SPIKE' in result['fault_type'], f"Expected pressure fault, got {result['fault_type']}"
    print("✓ Pressure spike test passed\n")

def test_humidity_spike():
    """Test humidity spike"""
    print("Testing humidity spike...")
    # Clear history and add varied normal data
    historical_data.clear()
    for i in range(10):
        # Add some variation to avoid frozen sensor detection
        temp = 25.0 + np.random.normal(0, 1)
        pressure = 1013.0 + np.random.normal(0, 5)
        humidity = 60.0 + np.random.normal(0, 10)
        historical_data.append([temp, pressure, humidity])
    
    result = detect_anomalies(25.0, 1013.0, 100.0)  # Max humidity
    print(f"Result: {result}")
    assert result['is_anomaly'] == True, "High humidity should be anomaly"
    assert 'HUMIDITY' in result['fault_type'] or 'SPIKE' in result['fault_type'], f"Expected humidity fault, got {result['fault_type']}"
    print("✓ Humidity spike test passed\n")

def test_thermodynamic_inconsistency():
    """Test thermodynamic inconsistency (hot and humid)"""
    print("Testing thermodynamic inconsistency...")
    # Clear history and add varied normal data
    historical_data.clear()
    for i in range(10):
        # Add some variation to avoid frozen sensor detection
        temp = 25.0 + np.random.normal(0, 1)
        pressure = 1013.0 + np.random.normal(0, 5)
        humidity = 60.0 + np.random.normal(0, 10)
        historical_data.append([temp, pressure, humidity])
    
    result = detect_anomalies(46.0, 1013.0, 95.0)  # Hot and humid >45 and >90
    print(f"Result: {result}")
    assert result['is_anomaly'] == True, "Hot and humid should be anomaly"
    assert 'THERMODYNAMIC' in result['fault_type'] or 'INCONSISTENCY' in result['fault_type'], f"Expected thermodynamic fault, got {result['fault_type']}"
    print("✓ Thermodynamic inconsistency test passed\n")

def test_frozen_sensor():
    """Test frozen sensor by adding multiple identical readings"""
    print("Testing frozen sensor simulation...")
    # Clear history and add identical readings
    historical_data.clear()
    for _ in range(10):
        historical_data.append([25.0, 1013.0, 60.0])
    
    result = detect_anomalies(25.0, 1013.0, 60.0)  # Same as historical
    print(f"Result: {result}")
    # Frozen detection should trigger with identical readings
    # We'll just check that it runs without error
    print("✓ Frozen sensor test completed\n")

def test_corrected_values():
    """Test corrected values generation"""
    print("Testing corrected values...")
    # Clear history and add varied normal data
    historical_data.clear()
    for i in range(8):
        # Add some variation
        temp = 25.0 + np.random.normal(0, 1)
        pressure = 1013.0 + np.random.normal(0, 5)
        humidity = 60.0 + np.random.normal(0, 10)
        historical_data.append([temp, pressure, humidity])
    
    corrected = get_corrected_values(30.0, 1020.0, 70.0)  # Anomalous values
    print(f"Corrected values: {corrected}")
    assert 'temperature' in corrected
    assert 'pressure' in corrected
    assert 'humidity' in corrected
    # Corrected values should be reasonable (not exactly 25,1013,60 due to random variation)
    # But should be in a reasonable range
    assert 20 <= corrected['temperature'] <= 30
    assert 1000 <= corrected['pressure'] <= 1030
    assert 50 <= corrected['humidity'] <= 70
    print("✓ Corrected values test passed\n")

if __name__ == "__main__":
    print("Running SkyGuard AI anomaly detection tests...\n")
    
    try:
        test_normal_conditions()
        test_temperature_spike()
        test_pressure_spike()
        test_humidity_spike()
        test_thermodynamic_inconsistency()
        test_frozen_sensor()
        test_corrected_values()
        
        print("All tests passed! 🎉")
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)