import express from 'express';
import 'dotenv/config';
import { query } from './db.js';
import missionsRouter from './routes/missions.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/health', async (_req, res) => {
    try {
        await query('SELECT 1');
        res.json({status: 'ok', database: 'connected'});
    } catch {
        res.status(503).json({status: 'degraded', database: 'unreachable'});
    }
});

app.use('/api/missions', missionsRouter);

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, () => {
    console.log(`NASA missions dashboard listening on http://localhost:${port}`);
});