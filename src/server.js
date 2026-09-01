import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import { query } from './db.js';
import missionsRouter from './routes/missions.js';
import statsRouter from './routes/stats.js';
import missionMediaRouter from './routes/mission-media.js';
import launchSitesRouter from './routes/launch-sites.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
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
app.use('/api/stats', statsRouter);
app.use('/api/missions/:slug/media', missionMediaRouter);
app.use('/api/launch-sites', launchSitesRouter);

app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`NASA missions dashboard listening on http://localhost:${port}`);
});