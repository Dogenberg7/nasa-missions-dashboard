import { readFile } from 'node:fs/promises';
import { pool } from '../src/db.js';

const slugify = (name) => 
    name.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const seed = JSON.parse(
    await readFile(new URL('../db/seed_missions.json', import.meta.url), 'utf8')
);

const client = await pool.connect();
try {
    await client.query('BEGIN');

    for (const s of seed.launch_sites) {
        await client.query(
            `INSERT INTO launch_sites (id, name, locality, country, latitude, longitude)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (id) DO UPDATE
            SET name = EXCLUDED.name, locality = EXCLUDED.locality,
                country = EXCLUDED.country, latitude = EXCLUDED.latitude,
                longitude = EXCLUDED.longitude`,
            [s.id, s.name, s.locality, s.country, s.latitude, s.longitude]
        );
    }

    let inserted = 0;
    for (const m of seed.missions) {
        const { rowCount } = await client.query(
            `INSERT INTO missions
                (slug, name, program, launch_date, end_date, type, destination,
                outcome, launch_site_id, search_keyword)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            ON CONFLICT (slug) DO NOTHING`,
            [
                slugify(m.name), m.name, m.program, m.launch_date, m.end_date,
                m.type, m.destination, m.outcome, m.launch_site_id, m.search_keyword
            ]
        );
        inserted += rowCount;
    }

    await client.query('COMMIT');
    console.log(`Seed complete: ${seed.launch_sites.length} launch sites, ${inserted} new missions (${seed.missions.length} in seed).`);
} catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed, rolled back:', err.message);
    process.exitCode = 1;
} finally {
    client.release();
    await pool.end();
}