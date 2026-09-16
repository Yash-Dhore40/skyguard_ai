"""
Database Seeding Script for SkyGuard AI - 550 Indian AWS Network
Pre-populates the database with 550 realistic Automatic Weather Stations (AWS)
spanning all Indian states, union territories, elevation gradients, and IMD climate zones.
"""

import random
from datetime import datetime, timedelta
from database import engine, Base, SessionLocal
from db_models import StationModel, SensorReadingModel
from india_climate import ClimateZone

# Representative anchor stations across India's key meteorological clusters
REGIONAL_CLUSTERS = [
    # Western Himalayas (Alpine / Cold)
    {
        "zone": ClimateZone.WESTERN_HIMALAYAS.value,
        "states": ["Ladakh", "Jammu & Kashmir", "Himachal Pradesh", "Uttarakhand", "Sikkim"],
        "lat_range": (30.0, 35.5),
        "lon_range": (74.0, 80.0),
        "elev_range": (1500, 3600),
        "prefixes": ["Leh", "Kargil", "Gulmarg", "Srinagar", "Kullu", "Manali", "Shimla", "Dharamshala", "Dehradun", "Joshimath", "Gangtok"],
        "count": 75
    },
    # Gangetic Plains (Continental / Subtropical)
    {
        "zone": ClimateZone.GANGETIC_PLAINS.value,
        "states": ["Delhi", "Punjab", "Haryana", "Uttar Pradesh", "Bihar", "West Bengal"],
        "lat_range": (24.0, 30.5),
        "lon_range": (75.0, 88.5),
        "elev_range": (50, 300),
        "prefixes": ["Safdarjung", "Palam", "Amritsar", "Chandigarh", "Ambala", "Meerut", "Lucknow", "Varanasi", "Kanpur", "Patna", "Gaya", "Kolkata", "Siliguri"],
        "count": 140
    },
    # Thar Desert (Arid / Heat Extremes)
    {
        "zone": ClimateZone.THAR_DESERT.value,
        "states": ["Rajasthan", "Gujarat"],
        "lat_range": (24.5, 29.5),
        "lon_range": (69.5, 75.0),
        "elev_range": (100, 350),
        "prefixes": ["Phalodi", "Jaisalmer", "Bikaner", "Churu", "Barmer", "Jodhpur", "Bhuj", "Naliya", "Rajkot", "Surendranagar"],
        "count": 80
    },
    # Tropical Coastal & Maritime
    {
        "zone": ClimateZone.TROPICAL_COASTAL.value,
        "states": ["Maharashtra", "Goa", "Karnataka", "Kerala", "Tamil Nadu", "Andhra Pradesh", "Odisha"],
        "lat_range": (8.5, 21.0),
        "lon_range": (72.5, 86.5),
        "elev_range": (3, 60),
        "prefixes": ["Colaba", "Santacruz", "Ratnagiri", "Panaji", "Mangaluru", "Kochi", "Thiruvananthapuram", "Chennai", "Cuddalore", "Visakhapatnam", "Puri", "Paradip"],
        "count": 135
    },
    # Deccan Plateau (Semi-Arid Tableland)
    {
        "zone": ClimateZone.DECCAN_PLATEAU.value,
        "states": ["Madhya Pradesh", "Maharashtra", "Telangana", "Karnataka", "Chhattisgarh"],
        "lat_range": (12.5, 23.5),
        "lon_range": (75.0, 82.5),
        "elev_range": (450, 950),
        "prefixes": ["Bengaluru", "Mysuru", "Hyderabad", "Warangal", "Pune", "Nashik", "Nagpur", "Bhopal", "Indore", "Jabalpur", "Raipur"],
        "count": 120
    }
]

def seed_database():
    """Initializes tables and seeds 550 AWS stations"""
    print("Creating tables in database...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    existing_count = db.query(StationModel).count()
    if existing_count >= 550:
        print(f"Database already contains {existing_count} stations. Skipping seed.")
        db.close()
        return

    print(f"Existing stations: {existing_count}. Seeding up to 550 stations...")

    random.seed(42)
    station_id_counter = 1
    stations_to_add = []

    for cluster in REGIONAL_CLUSTERS:
        zone = cluster["zone"]
        count = cluster["count"]
        states = cluster["states"]
        prefixes = cluster["prefixes"]
        lat_min, lat_max = cluster["lat_range"]
        lon_min, lon_max = cluster["lon_range"]
        elev_min, elev_max = cluster["elev_range"]

        for i in range(count):
            sid = f"AWS-IND-{station_id_counter:03d}"
            station_id_counter += 1

            prefix = prefixes[i % len(prefixes)]
            state = states[i % len(states)]
            sub_id = (i // len(prefixes)) + 1
            name = f"{prefix} AWS-{sub_id}"

            lat = round(random.uniform(lat_min, lat_max), 4)
            lon = round(random.uniform(lon_min, lon_max), 4)
            elevation = round(random.uniform(elev_min, elev_max), 1)

            # Health & status distribution
            health_roll = random.random()
            if health_roll < 0.88:
                status = "Operational"
                health = round(random.uniform(90.0, 100.0), 1)
            elif health_roll < 0.96:
                status = "Degraded"
                health = round(random.uniform(60.0, 85.0), 1)
            elif health_roll < 0.99:
                status = "Critical"
                health = round(random.uniform(30.0, 55.0), 1)
            else:
                status = "Offline"
                health = 0.0

            # Mark high-altitude and deep desert as edge stations
            is_edge = (zone in [ClimateZone.WESTERN_HIMALAYAS.value, ClimateZone.THAR_DESERT.value]) and (random.random() < 0.4)

            station = StationModel(
                id=sid,
                name=name,
                state=state,
                climate_zone=zone,
                latitude=lat,
                longitude=lon,
                elevation_m=elevation,
                status=status,
                health_score=health,
                is_edge_mode=is_edge,
                last_ping=datetime.utcnow() - timedelta(minutes=random.randint(0, 120))
            )
            stations_to_add.append(station)

    # Bulk add
    db.bulk_save_objects(stations_to_add)
    db.commit()

    total = db.query(StationModel).count()
    print(f"Successfully seeded {total} Automatic Weather Stations into SkyGuard database.")
    db.close()

if __name__ == "__main__":
    seed_database()
