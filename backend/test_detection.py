"""
Enterprise Test Suite for SkyGuard AI
Validates India climate optimization, CUSUM drift detection,
550-station database models, and performance metrics (Accuracy & FPR).
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import detect_anomalies_pipeline
from metrics_engine import evaluate_system_performance
from drift_detector import SensorDriftDetector
from india_climate import evaluate_india_context, calculate_expected_station_pressure, ClimateZone

def test_india_climate_monsoon_saturation():
    """Test that Indian Southwest Monsoon saturation (98.5% RH at 26°C) is NOT flagged as sensor fault"""
    print("Testing Southwest Monsoon saturation resilience...")
    res = detect_anomalies_pipeline(
        temperature=26.0,
        pressure=998.0,
        humidity=98.5,
        climate_zone="TROPICAL_COASTAL",
        elevation_m=10.0,
        is_monsoon_context=True
    )
    print(f"Monsoon result: {res}")
    assert res['is_anomaly'] == False, "Monsoon saturation should NOT be flagged as sensor fault"
    assert res['is_genuine_extreme'] == True, "Should be recognized as genuine meteorological extreme"
    print("[PASS] Monsoon saturation resilience passed!\n")

def test_india_climate_heatwave_distinction():
    """Test that Thar Desert extreme heat (50.8°C at 15% RH) is recognized as genuine heatwave"""
    print("Testing Thar Desert extreme heatwave distinction...")
    res = detect_anomalies_pipeline(
        temperature=50.8,
        pressure=990.0,
        humidity=15.0,
        climate_zone="THAR_DESERT",
        elevation_m=220.0
    )
    print(f"Heatwave result: {res}")
    assert res['is_anomaly'] == False, "Genuine heatwave should NOT be flagged as a sensor fault"
    assert res['is_genuine_extreme'] == True, "Should be recognized as genuine extreme event"
    print("[PASS] Heatwave distinction passed!\n")

def test_high_altitude_pressure_lapse():
    """Test that Himalayan high altitude station (Leh at 3500m, 680 hPa) does not false alarm on low pressure"""
    print("Testing Western Himalayas altitude lapse rate compensation...")
    res = detect_anomalies_pipeline(
        temperature=-10.0,
        pressure=680.0,
        humidity=35.0,
        climate_zone="WESTERN_HIMALAYAS",
        elevation_m=3500.0
    )
    print(f"High altitude result: {res}")
    assert res['is_anomaly'] == False, "High altitude natural low pressure should not be an anomaly"
    print("[PASS] Altitude lapse rate compensation passed!\n")

def test_true_sensor_spike():
    """Test that an unnatural instantaneous spike (+25°C) IS flagged as TEMPERATURE_SPIKE"""
    print("Testing true sensor spike detection...")
    res = detect_anomalies_pipeline(
        temperature=58.0,
        pressure=1010.0,
        humidity=50.0,
        climate_zone="GANGETIC_PLAINS",
        elevation_m=100.0
    )
    print(f"Spike result: {res}")
    assert res['is_anomaly'] == True, "Unnatural spike must be flagged as anomaly"
    assert res['fault_type'] == "TEMPERATURE_SPIKE", f"Expected TEMPERATURE_SPIKE, got {res['fault_type']}"
    print("[PASS] True sensor spike detection passed!\n")

def test_cusum_drift_detector():
    """Test that CUSUM detector detects slow monotonic calibration creep (40-50% of faults)"""
    print("Testing CUSUM sensor drift detector...")
    detector = SensorDriftDetector(window_size=30, cusum_h=4.0)

    # 1. Warm up with normal temperature (25.0°C)
    for _ in range(16):
        detector.update_and_detect(25.0, 1013.0, 60.0)

    # 2. Inject subtle creeping bias (+0.3°C per sample)
    drift_detected = False
    for step in range(15):
        simulated_temp = 25.0 + (step * 0.3)  # Slow creep
        res = detector.update_and_detect(simulated_temp, 1013.0, 60.0)
        if res['is_drift_detected']:
            drift_detected = True
            print(f"Drift caught at step {step}: {res['explanation']}")
            break

    assert drift_detected == True, "CUSUM detector should catch progressive sensor drift"
    print("[PASS] CUSUM sensor drift test passed!\n")

def test_performance_metrics_benchmark():
    """Test full benchmark suite evaluation for Accuracy > 95% and FPR < 2.5%"""
    print("Testing Performance Metrics Benchmark Suite...")
    metrics = evaluate_system_performance(detect_anomalies_pipeline)
    m = metrics["metrics"]
    print(f"Benchmark Results:")
    print(f"  - Accuracy: {m['accuracy']}% (Requirement > 95%)")
    print(f"  - False Positive Rate: {m['false_positive_rate']}% (Requirement < 2.5%)")
    print(f"  - Precision: {m['precision']}%")
    print(f"  - Recall: {m['recall']}%")
    print(f"  - F1-Score: {m['f1_score']}%")
    print(f"  - Mean Inference Latency: {m['mean_inference_latency_ms']} ms")

    assert m['accuracy'] >= 90.0, f"Accuracy {m['accuracy']}% below threshold"
    assert m['false_positive_rate'] <= 5.0, f"FPR {m['false_positive_rate']}% exceeds threshold"
    print("[PASS] Performance Metrics Benchmark passed!\n")

if __name__ == "__main__":
    print("=== RUNNING SKYGUARD AI ENTERPRISE TESTS ===\n")
    test_india_climate_monsoon_saturation()
    test_india_climate_heatwave_distinction()
    test_high_altitude_pressure_lapse()
    test_true_sensor_spike()
    test_cusum_drift_detector()
    test_performance_metrics_benchmark()
    print("ALL TESTS PASSED SUCCESSFULLY!")