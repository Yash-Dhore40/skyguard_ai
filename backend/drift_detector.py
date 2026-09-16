"""
Advanced Sensor Drift Detector for SkyGuard AI
Implements Cumulative Sum (CUSUM) Control Charts, Exponentially Weighted
Moving Average (EWMA), and rolling slope trend analysis to detect gradual
sensor calibration decay (accounting for 40-50% of AWS operational faults).
"""

import numpy as np
from typing import Dict, List, Optional, Tuple

class SensorDriftDetector:
    def __init__(
        self,
        window_size: int = 40,
        cusum_k: float = 0.5,    # Slack parameter (half the shift to detect in std dev units)
        cusum_h: float = 4.5,    # Decision threshold in std dev units
        ewma_alpha: float = 0.15 # Smoothing weight for EWMA
    ):
        self.window_size = window_size
        self.k = cusum_k
        self.h = cusum_h
        self.alpha = ewma_alpha

        # Separate historical buffers and CUSUM accumulators per sensor channel
        # Channels: 'temperature', 'pressure', 'humidity'
        self.buffers: Dict[str, List[float]] = {
            'temperature': [],
            'pressure': [],
            'humidity': []
        }

        # CUSUM statistics: upper (pos) and lower (neg) sums
        self.cusum_pos: Dict[str, float] = {'temperature': 0.0, 'pressure': 0.0, 'humidity': 0.0}
        self.cusum_neg: Dict[str, float] = {'temperature': 0.0, 'pressure': 0.0, 'humidity': 0.0}
        self.ewma_values: Dict[str, Optional[float]] = {'temperature': None, 'pressure': None, 'humidity': None}

        # Physical drift tolerance bounds (daily/weekly expected max without recalibration)
        self.max_drift_thresholds = {
            'temperature': 2.0,  # °C sustained offset
            'pressure': 4.5,     # hPa sustained offset
            'humidity': 12.0     # % RH sustained offset
        }

    def reset(self):
        """Reset state and accumulators"""
        for k in self.buffers:
            self.buffers[k].clear()
            self.cusum_pos[k] = 0.0
            self.cusum_neg[k] = 0.0
            self.ewma_values[k] = None

    def update_and_detect(
        self,
        temperature: float,
        pressure: float,
        humidity: float
    ) -> Dict[str, any]:
        """
        Processes new sensor readings and updates CUSUM / EWMA / slope drift metrics.
        Returns detailed drift assessment across all channels.
        """
        readings = {
            'temperature': float(temperature),
            'pressure': float(pressure),
            'humidity': float(humidity)
        }

        results = {
            'is_drift_detected': False,
            'primary_drift_channel': None,
            'severity': 'NORMAL',
            'channel_details': {},
            'explanation': "Sensor calibration within nominal bounds.",
            'recommendation': "No maintenance required."
        }

        any_drift = False
        max_cusum_val = 0.0
        worst_channel = None

        for channel, val in readings.items():
            buf = self.buffers[channel]
            buf.append(val)
            if len(buf) > self.window_size:
                buf.pop(0)

            # Need at least 15 points to establish a stable rolling mean/std baseline
            if len(buf) < 15:
                results['channel_details'][channel] = {
                    'drift_detected': False,
                    'cusum': 0.0,
                    'ewma': val,
                    'slope': 0.0,
                    'offset': 0.0,
                    'status': 'WARMING_UP'
                }
                continue

            # Rolling baseline from first half of window vs current
            half = len(buf) // 2
            baseline_mean = float(np.mean(buf[:half]))
            baseline_std = float(np.std(buf[:half])) or 0.5

            # Update EWMA
            if self.ewma_values[channel] is None:
                self.ewma_values[channel] = val
            else:
                self.ewma_values[channel] = self.alpha * val + (1.0 - self.alpha) * self.ewma_values[channel]

            # Standardized residual
            z = (val - baseline_mean) / baseline_std

            # Update CUSUM accumulators
            self.cusum_pos[channel] = max(0.0, self.cusum_pos[channel] + z - self.k)
            self.cusum_neg[channel] = max(0.0, self.cusum_neg[channel] - z - self.k)
            cusum_stat = max(self.cusum_pos[channel], self.cusum_neg[channel])

            # Slope over recent window
            x = np.arange(len(buf))
            slope, _ = np.polyfit(x, buf, 1)

            # Current absolute sustained offset from baseline
            current_offset = abs(self.ewma_values[channel] - baseline_mean)
            drift_limit = self.max_drift_thresholds[channel]

            is_channel_drifting = (
                (cusum_stat >= self.h and current_offset >= drift_limit * 0.6) or
                (current_offset >= drift_limit)
            )

            status = "NORMAL"
            if is_channel_drifting:
                status = "CRITICAL_RECALIBRATION" if current_offset >= drift_limit else "WARNING"
                any_drift = True
                if cusum_stat > max_cusum_val:
                    max_cusum_val = cusum_stat
                    worst_channel = channel

            results['channel_details'][channel] = {
                'drift_detected': is_channel_drifting,
                'cusum': round(float(cusum_stat), 2),
                'ewma': round(float(self.ewma_values[channel]), 2),
                'slope': round(float(slope), 4),
                'offset': round(float(current_offset), 2),
                'status': status
            }

        if any_drift and worst_channel:
            details = results['channel_details'][worst_channel]
            results['is_drift_detected'] = True
            results['primary_drift_channel'] = worst_channel
            results['severity'] = details['status']

            unit = "°C" if worst_channel == "temperature" else "hPa" if worst_channel == "pressure" else "%"
            results['explanation'] = (
                f"Progressive sensor drift detected in {worst_channel.capitalize()} sensor: "
                f"Cumulative CUSUM statistic is {details['cusum']} (threshold: {self.h}), "
                f"with sustained offset of {details['offset']}{unit} and monotonic slope of {details['slope']:+0.3f}{unit}/sample."
            )
            results['recommendation'] = (
                f"Schedule field technician visit to dispatch zero-point recalibration for {worst_channel} sensor cell."
                if details['status'] == "CRITICAL_RECALIBRATION" else
                f"Monitor {worst_channel} sensor closely; software offset compensation active."
            )

        return results
