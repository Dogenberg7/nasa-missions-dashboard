import { Router } from 'express';
import { query } from '../db.js';
import { fetchSatelliteImage } from '../gibs.js';

const router = Router();
const cacheTTL = 12 * 60 * 60 * 1000 // 12 hours

// GET /api/launch-sites/:id
// Launch site details, the list of missions launched from it,
// and a link to its cached satellite image.
router.get('/:id', async (req, res, next) => {
    try {
        const { rows: [site] } = await query(
            'SELECT * FROM launch_sites WHERE id = $1',
            [req.params.id]
        );
        if (!site) return res.status(404).json({ error: 'Launch site not found' });

        const { rows: missions } = await query(
            `SELECT m.name, m.program,
                COALESCE(
                    m.cover_image_override,
                    (SELECT ma.nasa_id
                    FROM media_assets ma
                    WHERE ma.mission_id = m.id AND ma.media_type = 'image'
                    ORDER BY ma.date_created NULLS LAST, ma.nasa_id
                    LIMIT 1)
                ) AS cover_nasa_id
            FROM missions m
            WHERE m.launch_site_id = $1
            ORDER BY m.launch_date`,
            [site.id]
        );

        const { rows: [cached] } = await query(
            'SELECT expires_at FROM api_cache WHERE cache_key = $1',
            [`gibs:${site.id}`]
        );

        res.json({
            ...site,
            missions,
            satellite_image: {
                url: `/api/launch-sites/${site.id}/satellite-image`,
                cached_until: cached?.expires_at ?? null
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/launch-sites/:id/satellite-image
// Serves the cached GIBS satellite image,
// fetches a fresh one after a 12 hours TTL
router.get('/:id/satellite-image', async (req, res, next) => {
    try {
        const { rows: [site] } = await query(
            'SELECT latitude, longitude FROM launch_sites WHERE id = $1',
            [req.params.id]
        );
        if (!site) return res.status(404).json({ error: 'Launch site not found'} );

        const cacheKey = `gibs:${req.params.id}`;
        const { rows: [cached] } = await query(
            'SELECT payload, expires_at FROM api_cache WHERE cache_key = $1',
            [cacheKey]
        );

        let payload;
        if (cached && new Date(cached.expires_at) > new Date()) {
            payload = cached.payload;
        } else {
            payload = await fetchSatelliteImage(site.latitude, site.longitude);
            await query(
                `INSERT INTO api_cache (cache_key, payload, fetched_at, expires_at)
                VALUES ($1, $2, now(), now() + interval '12 hour')
                ON CONFLICT (cache_key) DO UPDATE
                SET payload = EXCLUDED.payload, fetched_at = now(), expires_at = EXCLUDED.expires_at`,
                [cacheKey, payload]
            );
        }

        res.set('Content-Type', payload.contentType);
        res.send(Buffer.from(payload.base64, 'base64'));
    } catch (err) {
        next(err);
    }
});

export default router;