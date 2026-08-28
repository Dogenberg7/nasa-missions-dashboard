BEGIN;

CREATE TABLE launch_sites (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    locality    TEXT NOT NULL,
    country     TEXT NOT NULL,
    latitude    NUMERIC(8, 5) NOT NULL CHECK (latitude  BETWEEN  -90 AND  90),
    longitude   NUMERIC(8, 5) NOT NULL CHECK (longitude BETWEEN -180 AND 180)
);

CREATE TABLE missions (
    id                   SERIAL PRIMARY KEY,
    slug                 TEXT NOT NULL UNIQUE,
    name                 TEXT NOT NULL UNIQUE,
    program              TEXT,
    launch_date          DATE NOT NULL,
    end_date             DATE,
    type                 TEXT NOT NULL
                         CHECK (type IN ('crewed', 'robotic', 'telescope', 'rover')),
    destination          TEXT NOT NULL,
    outcome              TEXT
                         CHECK (outcome IN ('success', 'partial', 'failure')),
    launch_site_id       TEXT NOT NULL REFERENCES launch_sites(id),
    search_keyword       TEXT NOT NULL,
    cover_image_override TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),

    status               TEXT GENERATED ALWAYS AS (
                             CASE WHEN end_date IS NULL THEN 'ongoing'
                                  ELSE 'completed' END
                         ) STORED,

    CHECK (end_date IS NULL OR end_date >= launch_date)
);