from sqlalchemy import Column, Integer, Float, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class StationModel(Base):
    __tablename__ = "stations"

    id = Column(String(64), primary_key=True, index=True)  # e.g., 'AWS-IND-001'
    name = Column(String(128), nullable=False)              # e.g., 'Safdarjung, Delhi'
    state = Column(String(64), nullable=False)             # e.g., 'Delhi'
    climate_zone = Column(String(64), nullable=False)      # GANGETIC_PLAINS, THAR_DESERT, etc.
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    elevation_m = Column(Float, default=100.0)
    status = Column(String(32), default="Operational")     # Operational, Degraded, Critical, Offline
    health_score = Column(Float, default=100.0)
    is_edge_mode = Column(Boolean, default=False)
    last_ping = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    readings = relationship("SensorReadingModel", back_populates="station", cascade="all, delete-orphan")
    anomalies = relationship("AnomalyLogModel", back_populates="station", cascade="all, delete-orphan")
    drift_logs = relationship("DriftLogModel", back_populates="station", cascade="all, delete-orphan")

class SensorReadingModel(Base):
    __tablename__ = "sensor_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    station_id = Column(String(64), ForeignKey("stations.id"), index=True, nullable=False)
    temperature = Column(Float, nullable=False)
    pressure = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    is_anomaly = Column(Boolean, default=False)
    fault_type = Column(String(64), nullable=True)
    anomaly_score = Column(Float, default=0.0)
    confidence = Column(Float, default=0.0)

    station = relationship("StationModel", back_populates="readings")

class AnomalyLogModel(Base):
    __tablename__ = "anomaly_logs"

    id = Column(String(128), primary_key=True)  # e.g. INC-1718000000-123
    station_id = Column(String(64), ForeignKey("stations.id"), index=True, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    fault_type = Column(String(64), nullable=False)
    anomaly_score = Column(Float, nullable=False)
    confidence = Column(Float, nullable=False)
    explanation = Column(Text, nullable=False)
    temperature = Column(Float, nullable=False)
    pressure = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    corrected_temp = Column(Float, nullable=True)
    corrected_press = Column(Float, nullable=True)
    corrected_hum = Column(Float, nullable=True)
    is_meteorological_extreme = Column(Boolean, default=False)

    station = relationship("StationModel", back_populates="anomalies")

class DriftLogModel(Base):
    __tablename__ = "drift_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    station_id = Column(String(64), ForeignKey("stations.id"), index=True, nullable=False)
    sensor_type = Column(String(32), nullable=False)  # temperature, pressure, humidity
    detected_at = Column(DateTime, default=datetime.utcnow)
    drift_magnitude = Column(Float, nullable=False)
    drift_velocity = Column(Float, nullable=False)     # drift per unit time
    cusum_statistic = Column(Float, nullable=False)
    severity = Column(String(32), default="WARNING")   # WARNING, CRITICAL_RECALIBRATION
    recommendation = Column(Text, nullable=True)

    station = relationship("StationModel", back_populates="drift_logs")
