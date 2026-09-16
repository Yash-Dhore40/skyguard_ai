"""
India-Specific Climate & Meteorological Dynamics Engine for SkyGuard AI
Implements India Meteorological Department (IMD) regional climate zone rules,
barometric lapse rates for mountain stations, monsoon saturation physics, and
heatwave/cyclonic extreme differentiation.
"""

from enum import Enum
from typing import Dict, Tuple, Optional
from datetime import datetime
import math

class ClimateZone(str, Enum):
    WESTERN_HIMALAYAS = "WESTERN_HIMALAYAS"   # Leh, Shimla, Srinagar (Cold, alpine, high altitude)
    GANGETIC_PLAINS = "GANGETIC_PLAINS"       # Delhi, Lucknow, Patna (Continental, fog, summer heat)
    THAR_DESERT = "THAR_DESERT"               # Jaisalmer, Phalodi, Bikaner (Arid, extreme heat to 52°C)
    TROPICAL_COASTAL = "TROPICAL_COASTAL"     # Mumbai, Chennai, Kochi (Maritime, monsoon saturation, cyclones)
    DECCAN_PLATEAU = "DECCAN_PLATEAU"         # Pune, Bengaluru, Hyderabad (Semi-arid, moderate elevation)

# IMD Regional Climate Baselines & Bounds
ZONE_PROFILES: Dict[ClimateZone, dict] = {
    ClimateZone.WESTERN_HIMALAYAS: {
        "name": "Western Himalayas / Cold Alpine",
        "description": "High altitude, sub-zero winters, rarefied atmosphere",
        "temp_range": (-25.0, 34.0),
        "typical_elevation": 2200.0,  # meters
        "humidity_range": (10.0, 95.0),
        "max_temp_rate_per_min": 2.5,
        "max_press_rate_per_min": 4.0,
    },
    ClimateZone.GANGETIC_PLAINS: {
        "name": "Gangetic Plains / Subtropical Continental",
        "description": "Dense winter radiation fog, May-June heatwaves, July-Aug monsoon",
        "temp_range": (2.0, 48.5),
        "typical_elevation": 180.0,
        "humidity_range": (15.0, 100.0),
        "max_temp_rate_per_min": 3.0,
        "max_press_rate_per_min": 5.0,
    },
    ClimateZone.THAR_DESERT: {
        "name": "Thar Desert / Arid Zone",
        "description": "Diurnal extreme swings, record summer temperatures up to 52°C, dust storms (Andhi)",
        "temp_range": (0.0, 52.5),
        "typical_elevation": 220.0,
        "humidity_range": (5.0, 85.0),
        "max_temp_rate_per_min": 4.0,
        "max_press_rate_per_min": 7.0,
    },
    ClimateZone.TROPICAL_COASTAL: {
        "name": "Tropical Coastal & Maritime",
        "description": "High humidity year-round, intense Southwest Monsoon downpours, Bay/Arabian Sea cyclones",
        "temp_range": (18.0, 40.0),
        "typical_elevation": 15.0,
        "humidity_range": (45.0, 100.0),
        "max_temp_rate_per_min": 2.0,
        "max_press_rate_per_min": 6.0,
    },
    ClimateZone.DECCAN_PLATEAU: {
        "name": "Deccan Plateau / Semi-Arid",
        "description": "Elevated tableland (500-900m), moderate climate, severe pre-monsoon convective squalls",
        "temp_range": (8.0, 44.0),
        "typical_elevation": 650.0,
        "humidity_range": (20.0, 98.0),
        "max_temp_rate_per_min": 3.0,
        "max_press_rate_per_min": 5.0,
    }
}

def calculate_expected_station_pressure(elevation_m: float, sea_level_press_hpa: float = 1013.25) -> float:
    """
    Computes barometrically expected station pressure at a given elevation (meters)
    using the International Standard Atmosphere (ISA) barometric formula.
    P = P0 * (1 - (0.0065 * h) / 288.15) ^ 5.255
    Prevents false pressure alarms at high elevation stations like Leh (3500m) or Shimla (2200m).
    """
    if elevation_m <= 0:
        return sea_level_press_hpa
    return sea_level_press_hpa * math.pow(1.0 - (0.0065 * elevation_m) / 288.15, 5.255)

def is_southwest_monsoon(timestamp: Optional[datetime] = None) -> bool:
    """Check if current time is within Indian Southwest Monsoon period (June to September)"""
    dt = timestamp or datetime.utcnow()
    return dt.month in (6, 7, 8, 9)

def is_pre_monsoon_summer(timestamp: Optional[datetime] = None) -> bool:
    """Check if current time is within Indian Pre-Monsoon Summer period (April to June)"""
    dt = timestamp or datetime.utcnow()
    return dt.month in (4, 5, 6)

def is_winter_fog_season(timestamp: Optional[datetime] = None) -> bool:
    """Check if current time is within Northern Plains winter fog period (December to January)"""
    dt = timestamp or datetime.utcnow()
    return dt.month in (12, 1)

def evaluate_india_context(
    temp: float,
    press: float,
    hum: float,
    zone_str: str = "GANGETIC_PLAINS",
    elevation_m: float = 100.0,
    timestamp: Optional[datetime] = None,
    rates: Optional[Dict[str, float]] = None
) -> Tuple[bool, Optional[str], Optional[str], float]:
    """
    Evaluates reading against India-specific meteorological physics.
    Returns:
      (is_genuine_extreme, event_type, physical_explanation, adjusted_confidence)
      - is_genuine_extreme: True if extreme values are physically genuine Indian weather (NOT a sensor fault)
      - event_type: Classification string (e.g. 'MONSOON_SATURATION_GENUINE', 'HEATWAVE_GENUINE')
      - physical_explanation: Domain-specific explanation
      - adjusted_confidence: Confidence multiplier (reduces false alarm)
    """
    try:
        zone = ClimateZone(zone_str.upper())
    except:
        zone = ClimateZone.GANGETIC_PLAINS

    profile = ZONE_PROFILES[zone]
    expected_baseline_press = calculate_expected_station_pressure(elevation_m)
    
    # 1. Elevation-adjusted pressure check
    press_diff_from_elevation = abs(press - expected_baseline_press)
    elevation_tolerance = 45.0  # hPa natural weather range around elevation mean

    rates = rates or {"temp_rate": 0.0, "press_rate": 0.0, "hum_rate": 0.0}

    # 2. Southwest Monsoon Saturation (Coastal, Gangetic Plains, Deccan Plateau, Western Ghats)
    # 95-100% humidity with rainfall and temp 22-32°C is standard monsoon behavior in India.
    if is_southwest_monsoon(timestamp) or zone == ClimateZone.TROPICAL_COASTAL:
        if hum >= 92.0 and (20.0 <= temp <= 35.0):
            # If humidity is high and temperature is in normal rain range, and rate is gradual
            if rates.get("temp_rate", 0) < profile["max_temp_rate_per_min"]:
                return (
                    True,
                    "GENUINE_MONSOON_SATURATION",
                    f"Indian Southwest Monsoon saturation active: RH {hum:.1f}% at {temp:.1f}°C in {zone.value} matches regional monsoon meteorological profile.",
                    0.96
                )

    # 3. Thar Desert / Gangetic Plains Pre-Monsoon Heatwave
    # Temps between 44°C and 52°C in May-June are genuine heatwaves in Rajasthan/Vidarbha
    if is_pre_monsoon_summer(timestamp) or zone == ClimateZone.THAR_DESERT:
        if (44.0 <= temp <= 52.5) and hum <= 35.0:
            if rates.get("temp_rate", 0) < profile["max_temp_rate_per_min"]:
                return (
                    True,
                    "GENUINE_HEATWAVE_EXTREME",
                    f"Verified IMD Heatwave event: Temperature {temp:.1f}°C with low RH {hum:.1f}% is consistent with {zone.value} May-June climatology.",
                    0.95
                )

    # 4. Western Himalayas / Himalayan Mountain Station Physics
    # Mountain stations routinely have pressure 650-850 hPa and sub-zero temperatures
    if zone == ClimateZone.WESTERN_HIMALAYAS or elevation_m > 1500.0:
        if (-25.0 <= temp <= 30.0) and press_diff_from_elevation <= elevation_tolerance:
            if rates.get("press_rate", 0) < profile["max_press_rate_per_min"]:
                return (
                    True,
                    "GENUINE_HIGH_ALTITUDE_METEOROLOGY",
                    f"High altitude station ({elevation_m:.0f}m): Station pressure {press:.1f} hPa matches ISA lapse rate (nominal {expected_baseline_press:.1f} hPa) and ambient temp {temp:.1f}°C.",
                    0.97
                )

    # 5. Tropical Cyclonic Depressions (Coastal Bay of Bengal / Arabian Sea)
    # Rapid pressure drop down to 965-990 hPa accompanied by high RH > 85%
    if zone == ClimateZone.TROPICAL_COASTAL and press < 992.0 and hum > 80.0:
        if rates.get("press_rate", 0) < profile["max_press_rate_per_min"]:
            return (
                True,
                "GENUINE_CYCLONIC_DEPRESSION",
                f"Coastal cyclonic low-pressure system detected: Station pressure {press:.1f} hPa with high humidity {hum:.1f}% indicates maritime cyclonic depression.",
                0.94
            )

    # 6. Winter Radiative Fog (Indo-Gangetic Plains)
    if is_winter_fog_season(timestamp) and zone == ClimateZone.GANGETIC_PLAINS:
        if (3.0 <= temp <= 16.0) and hum >= 90.0:
            return (
                True,
                "GENUINE_WINTER_FOG_EPISODE",
                f"Gangetic Plains winter radiation fog: RH {hum:.1f}% at {temp:.1f}°C is typical nocturnal/morning boundary layer inversion.",
                0.96
            )

    # Not a genuine extreme -> could be normal reading or real sensor fault
    return (False, None, None, 1.0)
