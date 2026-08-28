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

CREATE INDEX idx_missions_launch_date ON missions (launch_date);
CREATE INDEX idx_missions_type        ON missions (type);
CREATE INDEX idx_missions_site        ON missions (launch_site_id);

CREATE TABLE media_assets (
    id            BIGSERIAL PRIMARY KEY,
    mission_id    INT NOT NULL REFERENCES missions(id) ON DELETE CASCADE,
    nasa_id       TEXT NOT NULL,
    title         TEXT NOT NULL,
    description   TEXT,
    media_type    TEXT NOT NULL
                  CHECK (media_type IN ('image', 'video', 'audio')),
    date_created  DATE,
    ingested_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (mission_id, nasa_id)
);

CREATE INDEX idx_media_mission_date ON media_assets (mission_id, date_created);
CREATE INDEX idx_media_type ON media_assets (media_type);
CREATE INDEX idx_media_date ON media_assets (date_created);

CREATE TABLE sync_jobs (
    id              SERIAL PRIMARY KEY,
    mission_id      INT REFERENCES missions(id) ON DELETE SET NULL,
    started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    finished_at     TIMESTAMPTZ,
    status          TEXT NOT NULL DEFAULT 'running'
                    CHECK (status IN ('running', 'success', 'partial', 'failed')),
    assets_found    INT,
    assets_written  INT,
    error_message   TEXT
);

CREATE INDEX idx_sync_jobs_mission ON sync_jobs (mission_id, started_at DESC);

CREATE TABLE api_cache (
    cache_key   TEXT PRIMARY KEY,
    payload     JSONB NOT NULL,
    fetched_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at  TIMESTAMPTZ
);

CREATE INDEX idx_api_cache_expiry ON api_cache (expires_at);

CREATE MATERIALIZED VIEW media_counts AS
SELECT
    m.id                    AS mission_id,
    ma.media_type,
    COUNT(*)                AS asset_count,
    MIN(ma.date_created)    AS first_asset_date,
    MAX(ma.date_created)    AS last_asset_date
FROM missions m
JOIN media_assets ma ON ma.mission_id = m.id
GROUP BY m.id, ma.media_type;

CREATE UNIQUE INDEX idx_media_counts_pk ON media_counts (mission_id, media_type);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at := now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_missions_updated_at
BEFORE UPDATE ON missions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMIT;