CREATE TABLE biomes (
    id            INTEGER PRIMARY KEY,
    name          TEXT NOT NULL,
    texture       TEXT NOT NULL,     -- grass.jpg
    temperature   REAL,
    water_access  REAL,
    humidity      REAL,
    walk_cost     REAL,
    fertility     REAL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);