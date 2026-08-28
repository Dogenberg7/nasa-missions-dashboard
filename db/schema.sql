BEGIN;

CREATE TABLE launch_sites (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    locality    TEXT NOT NULL,
    country     TEXT NOT NULL,
    latitude    NUMERIC(8, 5) NOT NULL CHECK (latitude  BETWEEN  -90 AND  90),
    longitude   NUMERIC(8, 5) NOT NULL CHECK (longitude BETWEEN -180 AND 180)
);
