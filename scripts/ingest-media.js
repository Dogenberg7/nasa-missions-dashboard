/**
 * Ingests media metadata from the NASA Image and Video Library API
 * (https://images-api.nasa.gov) into the media_assets table, searches
 * using the mission's search_keyword.
 * Does not require an API key.
 * 
 * Usage:
 * node scripts/ingest-media.js (for all missions)
 * node scripts/ingest-media.js <mission slug> (for a single mission)
 */
import { pool, query } from '../src/db.js';

const imageApi = 'https://images-api.nasa.gov/search';
const pageSize = 100;
const requestDelay = 300;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchPage(searchKeyword, page) {
    const url = `${imageApi}?q=${encodeURIComponent(searchKeyword)}&page=${page}&page_size=${pageSize}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`NASA API responded ${res.status} for "${searchKeyword}" page ${page}`);
    }
    return res.json();
}

function hasNextPage(collection) {
    return Boolean(collection.links?.some((link) => link.rel === 'next'));
}

async function ingestMission(mission) {
    const { rows: [job] } = await query(
        `INSERT INTO sync_jobs (mission_id, status) VALUES ($1, 'running') RETURNING id`,
        [mission.id]
    );

    let page = 1;
    let totalHits = null;
    let written = 0;

    try {
        while (true) {
            const { collection } = await fetchPage(mission.search_keyword, page);
            totalHits ??= collection.metadata?.total_hits ?? null;

            for (const item of collection.items) {
                const data = item.data?.[0];
                if (!data?.nasa_id || !data.media_type) continue;

                const { rowCount } = await query(
                    `INSERT INTO media_assets
                        (mission_id, nasa_id, title, description, media_type, date_created)
                    VALUES ($1, $2, $3, $4, $5, $6)
                    ON CONFLICT (mission_id, nasa_id) DO NOTHING`,
                    [
                        mission.id,
                        data.nasa_id,
                        data.title ?? '(untitled)',
                        data.description ?? null,
                        data.media_type,
                        data.date_created ? data.date_created.slice(0,10) : null
                    ]
                );
                written += rowCount;
            }

            if (!hasNextPage(collection)) break;
            page++;
            await sleep(requestDelay);
        }

        await query(
            `UPDATE sync_jobs
            SET finished_at = now(), status = 'success',
                assets_found = $2, assets_written = $3
            WHERE id = $1`,
            [job.id, totalHits, written]
        );
        console.log(`${mission.name}: ${written} new assets written (${totalHits ?? '?'} total hits)`);
    } catch (err) {
        await query(
            `UPDATE sync_jobs
            SET finished_at = now(), status = 'failed',
                assets_written = $2, error_message = $3
            WHERE id = $1`,
            [job.id, written, err.message]
        );
        console.error(`${mission.name}: ${err.message}`);
    }
}

async function main() {
    const slug = process.argv[2] ?? null;

    const { rows: missions } = await query(
        `SELECT id, name, search_keyword
        FROM missions
        WHERE ($1::text IS NULL OR slug = $1)
        ORDER BY launch_date`,
        [slug]
    );

    if (missions.length === 0) {
        console.error(slug ? `No mission found with slug "${slug}"` : 'No missions in database, run the seed script first.');
        process.exitCode = 1;
        return;
    }

    for (const mission of missions) {
        await ingestMission(mission);
    }

    await query('REFRESH MATERIALIZED VIEW CONCURRENTLY media_counts');
    console.log('Refreshed media_counts.');
}

main()
    .catch((err) => {
        console.error('Ingest failed:', err);
        process.exitCode = 1;
    })
    .finally(() => pool.end());