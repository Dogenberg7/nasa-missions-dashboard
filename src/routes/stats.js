import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

router.get('/missions', async (_req, res, next) => {
    try {
        const { rows: [counts] } = await query(
            `SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'ongoing') AS ongoing,
                COUNT(*) FILTER (WHERE status = 'completed') AS completed
            FROM missions`
        );
        console.log(counts);
        res.json({
            total: Number(counts.total),
            ongoing: Number(counts.ongoing),
            completed: Number(counts.completed)
        });
    } catch (err) {
        next(err);
    }
});

router.get('/media', async (_req, res, next) => {
    try {
        const { rows: [totals] } = await query(
            `SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE media_type = 'image') AS images,
                COUNT(*) FILTER (WHERE media_type = 'video') AS videos,
                COUNT(*) FILTER (WHERE media_type = 'audio') AS audio
            FROM media_assets`
        );

        const { rows: [topMission] } = await query(
            `SELECT m.slug, m.name, COUNT(ma.id) AS total,
                COUNT(ma.id) FILTER (WHERE ma.media_type = 'image') AS images,
                COUNT(ma.id) FILTER (WHERE ma.media_type = 'video') AS videos,
                COUNT(ma.id) FILTER (WHERE ma.media_type = 'audio') AS audio
                FROM missions m
                JOIN media_assets ma ON ma.mission_id = m.id
                GROUP BY m.id, m.slug, m.name
                ORDER BY total DESC
                LIMIT 1`
        );

        res.json({
            total: Number(totals.total),
            by_type: {
                image: Number(totals.images),
                video: Number(totals.videos),
                audio: Number(totals.audio)
            },
            top_mission: topMission
                ? {
                    slug: topMission.slug,
                    name: topMission.name,
                    total: Number(topMission.total),
                    by_type: {
                        image: Number(topMission.images),
                        video: Number(topMission.videos),
                        audio: Number(topMission.audio)
                    },
                }
                : null,
        });
    } catch (err) {
        next(err);
    }
});

router.get('/media/by-mission', async (_req, res, next) => {
    try {
        const { rows } = await query(
            `SELECT m.slug, m.name, COUNT(ma.id) AS total,
                COUNT(ma.id) FILTER (WHERE ma.media_type = 'image') AS images,
                COUNT(ma.id) FILTER (WHERE ma.media_type = 'video') AS videos,
                COUNT(ma.id) FILTER (WHERE ma.media_type = 'audio') AS audio
            FROM missions m
            LEFT JOIN media_assets ma ON ma.mission_id = m.id
            GROUP BY m.id, m.slug, m.name
            ORDER BY total DESC`
        );

        res.json(
            rows.map((r) => ({
                slug: r.slug,
                name: r.name,
                total: Number(r.total),
                by_type: {
                    image: Number(r.images),
                    video: Number(r.videos),
                    audio: Number(r.audio)
                }
            }))
        );
    } catch (err) {
        next(err);
    }
})

export default router;