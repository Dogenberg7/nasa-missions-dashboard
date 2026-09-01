import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

// GET /api/stats/missions
// Mission counts: total, ongoing, completed
router.get('/missions', async (_req, res, next) => {
    try {
        const { rows: [counts] } = await query(
            `SELECT
                COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'ongoing') AS ongoing,
                COUNT(*) FILTER (WHERE status = 'completed') AS completed
            FROM missions`
        );
        res.json({
            label: "Missions available",
            total: Number(counts.total),
            by_type: {
                ongoing: Number(counts.ongoing),
                completed: Number(counts.completed)
            }
        });
    } catch (err) {
        next(err);
    }
});

// GET /api/stats/media
// Media totals, broken down by category, with the mission with the most media
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
            label: "Media available",
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

// GET /api/stats/media/by-mission
// Media counts, broken down by category for each mission
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
});

// GET /api/stats/launch-sites
// Counts of missions launched from each launch site and how many are still ongoing
router.get('/launch-sites', async (_req, res, next) => {
    try {
        const {rows } = await query(
            `SELECT ls.id, ls.name, ls.latitude, ls.longitude,
                COUNT(m.id) AS missions_launched,
                COUNT(m.id) FILTER (WHERE m.status = 'ongoing') AS still_ongoing
            FROM launch_sites ls
            LEFT JOIN missions m ON m.launch_site_id = ls.id
            GROUP BY ls.id
            ORDER BY missions_launched DESC`
        );

        res.json(
            rows.map((r) => ({
                id: r.id,
                name: r.name,
                latitude: Number(r.latitude),
                longitude: Number(r.longitude),
                missions_launched: Number(r.missions_launched),
                still_ongoing: Number(r.still_ongoing)
            }))
        );
    } catch (err) {
        next(err);
    }
});

export default router;