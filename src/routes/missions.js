import { Router } from 'express';
import { query } from '../db.js';

const router = Router();

const coverSubquery = `
    COALESCE(
        m.cover_image_override,
        (SELECT ma.nasa_id
        FROM media_assets ma
        WHERE ma.mission_id = m.id AND ma.media_type = 'image'
        ORDER BY ma.date_created NULLS LAST, ma.nasa_id
        LIMIT 1)
    ) AS cover_nasa_id
`;

// GET /api/missions
// optional filters: name, from, to, type, country, status
router.get('/', async (req, res, next) => {
    try {
        const { name = null, from = null, to = null, type = null, country = null, status = null } = req.query;
        const { rows } = await query(
            `SELECT m.id, m.slug, m.name, m.program, m.launch_date, m.end_date,
                    m.type, m.destination, m.status, m.outcome,
                    ls.name AS launch_site_name, ls.locality, ls.country, ls.latitude, ls.longitude,
                    ${coverSubquery}
            FROM missions m
            JOIN launch_sites ls ON ls.id = m.launch_site_id
            WHERE ($1::text IS NULL OR m.name ILIKE '%' || $1 || '%')
                AND ($2::date IS NULL OR m.launch_date >= $2)
                AND ($3::date IS NULL OR m.launch_date <= $3)
                AND ($4::text IS NULL OR m.type = $4)
                AND ($5::text IS NULL OR ls.country = $5)
                AND ($6::text IS NULL OR m.status = $6)
            ORDER BY m.launch_date DESC`,
            [name, from, to, type, country, status]
        );
        res.json(rows);
    } catch (err) {
        next(err);
    }
});

// GET /api/missions/:slug
router.get('/:slug', async (req, res, next) => {
    try {
        const { rows } = await query(
            `SELECT m.*, ls.name AS launch_site_name, ls.locality, ls.country,
                    ls.latitude, ls.longitude,
                    ${coverSubquery}
            FROM missions m
            JOIN launch_sites ls ON ls.id = m.launch_site_id
            WHERE m.slug = $1`,
            [req.params.slug]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Mission not found' });
        res.json(rows[0]);
    } catch (err) {
        next(err);
    }
});

export default router;