import { Router } from 'express';
import { query } from '../db.js';

const router = Router({ mergeParams: true });

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

export default router;