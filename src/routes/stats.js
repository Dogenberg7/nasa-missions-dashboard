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

export default router;