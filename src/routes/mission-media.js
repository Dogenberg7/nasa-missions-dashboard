import { Router } from 'express';
import { query } from '../db.js';

const router = Router({ mergeParams: true });

// GET /api/missions/:slug/media
// Media breakdown of the specified mission
router.get('/', async (req, res, next) => {
    try {
        const { rows: [mission] } = await query('SELECT id FROM missions WHERE slug = $1', [req.params.slug]);
        if (!mission) return res.status(404).json({ error: 'Mission not found' });

        const { rows } = await query(
            `SELECT media_type, asset_count, first_asset_date, last_asset_date
            FROM media_counts
            WHERE mission_id = $1`,
            [mission.id]
        );

        const byType = { image: 0, video: 0, audio: 0};
        let firstAssetDate = null;
        let lastAssetDate = null;
        for (const row of rows) {
            byType[row.media_type] = Number(row.asset_count);
            if(!firstAssetDate || row.first_asset_date < firstAssetDate) firstAssetDate = row.first_asset_date;
            if(!lastAssetDate || row.last_asset_date < lastAssetDate) lastAssetDate = row.last_asset_date;
        }

        res.json({
            total: byType.image + byType.video + byType.audio,
            by_type: byType,
            first_asset_date: firstAssetDate,
            last_asset_date: lastAssetDate
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/missions/:slug/media/timeline
// Media timeline of the specified mission per month
router.get('/timeline', async (req, res, next) => {
    try {
        const { rows: [mission] } = await query('SELECT id FROM missions WHERE slug = $1', [req.params.slug]);
        if (!mission) return res.status(404).json({ error: 'Mission not found' });

        const { rows } = await query(
            `SELECT date_trunc('month', date_created)::date AS month, COUNT(*) AS assets
            FROM media_assets
            WHERE mission_id = $1 AND date_created IS NOT NULL
            GROUP BY 1
            ORDER BY 1`,
            [mission.id]
        );

        res.json(rows.map((r) => ({ month: r.month, assets: Number(r.assets) })));
    } catch (err) {
        next(err);
    }
});

async function fetchMedia(slug, type, page = 1, size = 10) {
    const { rows: [mission] } = await query('SELECT id FROM missions WHERE slug=$1', [slug]);
    if (!mission) return null;

    const offset = (page - 1) * size;

    const [{ rows }, { rows: [{ count }] }] = await Promise.all([
        query(
            `SELECT nasa_id, title, description, media_type, date_created
            FROM media_assets
            WHERE mission_id = $1 AND media_type = $2
            ORDER BY date_created, nasa_id
            LIMIT $3 OFFSET $4`,
            [mission.id, type, size, offset]
        ),
        query(
            `SELECT COUNT(*)
            FROM media_assets
            WHERE mission_id = $1 AND media_type = $2`,
            [mission.id, type]
        )
    ]);

    const totalHits = Number(count);
    const hasNext = offset + rows.length < totalHits;

    return {
        items: rows,
        page,
        size,
        total_hits: totalHits,
        next: hasNext ? Number(page) + 1 : null
    };
}

// GET /api/missions/:slug/media/images
// Images of the specified mission,
// optional params: page, size
router.get('/images', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { page = 1, size = 10 } = req.query;

        const images = await fetchMedia(slug, 'image', page, size);
        if (!images) return res.status(404).json({ error: 'Mission not found' });

        const items = images.items.map((i) => {
            return {
                ...i,
                links: [
                    `https://images-assets.nasa.gov/image/${i.nasa_id}/${i.nasa_id}~thumb.jpg`,
                    `https://images-assets.nasa.gov/image/${i.nasa_id}/${i.nasa_id}~small.jpg`,
                    `https://images-assets.nasa.gov/image/${i.nasa_id}/${i.nasa_id}~medium.jpg`,
                    `https://images-assets.nasa.gov/image/${i.nasa_id}/${i.nasa_id}~large.jpg`
                ]
            }
        });

        res.json({
            items,
            page: images.page,
            size: images.size,
            total_hits: images.total_hits,
            next: images.next
        })
    } catch (err) {
        next(err);
    }
});

export default router;