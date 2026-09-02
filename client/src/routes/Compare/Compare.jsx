import './compare.css'
import SideBar from "../../Components/SideBar/SideBar.jsx";
import { useEffect, useMemo, useState } from "react";
import { useTheme } from "../../context/ThemeContext.jsx";
import { API_URL } from "../../config.js";
import axios from "axios";
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${mm}-${dd}-${date.getFullYear()}`;
}

function durationDays(mission) {
    const ms = (!mission.end_date ? new Date() : new Date(mission.end_date)) - new Date(mission.launch_date);
    return Math.round(ms / 86400000);
}

function Compare() {
    const { toggleTheme, compareList, removeFromCompare } = useTheme();
    const [missions, setMissions] = useState([]);

    useEffect(() => {
        let active = true;
        Promise.all(compareList.map((slug) =>
            Promise.all([
                axios.get(`${API_URL}/missions/${slug}`),
                axios.get(`${API_URL}/missions/${slug}/media`)
            ]).then(([mission, media]) => ({ ...mission.data, media: media.data }))
        )).then((results) => {
            if (active) setMissions(results);
        });
        return () => { active = false };
    }, [compareList]);

    const stats = useMemo(() => {
        if (missions.length === 0) return null;

        const topByType = (type) => missions.reduce((best, m) => {
            const value = type === 'total' ? m.media.total : (m.media.by_type?.[type] ?? 0);
            return !best || value > best.value ? { name: m.name, value } : best;
        }, null);

        const oldest = missions.reduce((best, m) => (
            !best || new Date(m.launch_date) < new Date(best.launch_date) ? m : best
        ), null);

        const withDuration = missions
            .map((m) => ({ name: m.name, duration: durationDays(m) }))
            .filter((m) => m.duration !== null);
        const longest = withDuration.reduce((best, m) => (
            !best || m.duration > best.duration ? m : best
        ), null);

        return {
            total: topByType('total'),
            image: topByType('image'),
            video: topByType('video'),
            audio: topByType('audio'),
            oldest,
            longest
        };
    }, [missions]);

    return (
        <div>
            <SideBar onToggle={toggleTheme} />
            <section className="compare">
                <h1>Compare missions</h1>
                {missions.length === 0
                    ? <p className="empty">No missions selected yet. Add missions to compare from their detail page.</p>
                    : <>
                        <div className="tableWrapper">
                            <table>
                                <thead>
                                <tr>
                                    <th rowSpan={2}></th>
                                    <th colSpan={4}>Media</th>
                                    <th rowSpan={2}>Launch date</th>
                                    <th rowSpan={2}>End date</th>
                                    <th rowSpan={2}>Duration</th>
                                </tr>
                                <tr>
                                    <th>Total</th>
                                    <th>Images</th>
                                    <th>Videos</th>
                                    <th>Audio</th>
                                </tr>
                                </thead>
                                <tbody>
                                {missions.map((m) => {
                                    const duration = durationDays(m);
                                    return (
                                        <tr key={m.slug}>
                                            <td className="mission">
                                                <button type="button" className="remove" onClick={() => removeFromCompare(m.slug)} aria-label={`Remove ${m.name}`}>
                                                    <CancelRoundedIcon fontSize="small" />
                                                </button>
                                                {m.name}
                                            </td>
                                            <td>{m.media.total}</td>
                                            <td>{m.media.by_type?.image ?? 0}</td>
                                            <td>{m.media.by_type?.video ?? 0}</td>
                                            <td>{m.media.by_type?.audio ?? 0}</td>
                                            <td>{formatDate(m.launch_date)}</td>
                                            <td>{formatDate(m.end_date)}</td>
                                            <td>{duration !== null ? `${duration} days` : ''}</td>
                                        </tr>
                                    );
                                })}
                                </tbody>
                            </table>
                        </div>

                        <div className="summary">
                            <div className="group">
                                <h4>Mission with the most media by type</h4>
                                <div className="row"><span>Total</span><span>{stats.total?.name}</span></div>
                                <div className="row"><span>Images</span><span>{stats.image?.name}</span></div>
                                <div className="row"><span>Videos</span><span>{stats.video?.name}</span></div>
                                <div className="row"><span>Audio</span><span>{stats.audio?.name}</span></div>
                            </div>
                            <div className="group">
                                <h4>Oldest mission</h4>
                                <div className="row"><span>{stats.oldest?.name}</span><span>{formatDate(stats.oldest?.launch_date)}</span></div>
                            </div>
                            <div className="group">
                                <h4>Longest mission</h4>
                                {stats.longest
                                    ? <div className="row"><span>{stats.longest.name}</span><span>{stats.longest.duration} days</span></div>
                                    : <div className="row"><span>-</span></div>
                                }
                            </div>
                        </div>
                    </>
                }
            </section>
        </div>
    );
}

export default Compare;
