import './launchsites.css'
import { useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../config.js";
import SideBar from "../../Components/SideBar/SideBar.jsx";
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

const API_HOST = API_URL.replace(/\/api\/?$/, '');

function LaunchSites() {

    const { id } = useParams();
    const navigate = useNavigate();
    const { toggleTheme } = useTheme();
    const [data, setData] = useState()
    const [stats, setStats] = useState()

    useEffect(() => {
        axios.get(`${API_URL}/launch-sites/${id}`).then(res => {
            setData(res.data)
        })
        axios.get(`${API_URL}/stats/launch-sites`).then(res => {
            setStats(res.data.find(s => s.id === id))
        })
    }, [id]);

    return (
        <div>
            <SideBar onToggle={toggleTheme}/>
            <section className={'launch-sites'}>
                <button type="button" className="back" onClick={() => navigate(-1)} aria-label="Back">
                    <ArrowBackRoundedIcon/>
                </button>
                {data &&
                    <>
                        <div className="card">
                            <img className="satellite" src={`${API_HOST}${data.satellite_image.url}`} alt={`${data.name} satellite view`}/>
                            <div className="content">
                            <h1 className="name">{data.name}</h1>
                            <div className="info-grid">
                                <div className="row">
                                    <div className="field">
                                        <h4>Locality</h4>
                                        <p>{data.locality}</p>
                                    </div>
                                    <div className="field">
                                        <h4>Country</h4>
                                        <p>{data.country}</p>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="field">
                                        <h4>Latitude</h4>
                                        <p>{data.latitude}</p>
                                    </div>
                                    <div className="field">
                                        <h4>Longitude</h4>
                                        <p>{data.longitude}</p>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="field">
                                        <h4>Missions launched</h4>
                                        <p>{stats?.missions_launched ?? data.missions.length}</p>
                                    </div>
                                    <div className="field">
                                        <h4>Missions still ongoing</h4>
                                        <p>{stats?.still_ongoing ?? 0}</p>
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>

                        <h2>Missions launched from this site</h2>
                        <div className="missionsGrid">
                            {data.missions.map((m) => (
                                <div className="missionCard" key={m.name} onClick={() => window.location.href = `/missions/${m.slug}`}>
                                    <img src={`https://images-assets.nasa.gov/image/${m.cover_nasa_id}/${m.cover_nasa_id}~thumb.jpg`} alt={m.name}/>
                                    <div className="info">
                                        <h3>{m.name}</h3>
                                        <p>{m.program}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                }
            </section>
        </div>
    );
}

export default LaunchSites;
