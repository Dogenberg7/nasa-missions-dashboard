import './Home.css'
import {useEffect, useState} from "react";
import { API_URL } from "../../config.js";
import axios from "axios";

function Home() {
    const [missionData, setMissionData] = useState([]);
    const [topMission, setTopMission] = useState({})

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const [missionsRes, mediaRes] = await Promise.all([
                    axios.get(`${API_URL}/stats/missions`),
                    axios.get(`${API_URL}/stats/media`),
                ]);
                if (!active) return;
                setMissionData([missionsRes.data, mediaRes.data]);
                setTopMission(mediaRes.data.top_mission)
            } catch (err) {
                console.error("fetch stats fallita:", err);
            }
        })();
        return () => { active = false; };
    }, []);


    useEffect(() => {
        console.log(missionData)
    }, [missionData]);

    return (
        <div>
            
            <section className={'home'}>
                <h1>Welcome to the NASA missions database</h1>
                <p>Use the sidebar to navigate to specific sections, you can look up missions, launch sites and run comparisons</p>
                <section className={'data'}>
                    {missionData.map((mission) => {
                        return (
                            <div className="group">
                                <span className="accent"></span>
                                <p className="label">{mission.label}</p>
                                <p className="value">{mission.total}</p>
                                {Object.entries(mission.by_type ?? {}).map(([k, v]) => {
                                    return (
                                        <div className="row"><span>{k}</span><span>{v}</span></div>
                                    )
                                })}
                            </div>
                        )
                    })}
                    <div className="group">
                        <span className="accent"></span>
                        <p className={'label'}>{topMission.name} media</p>
                        <p className="value">{topMission.total}</p>
                        {Object.entries(topMission.by_type ?? {}).map(([k, v]) => {
                            return (
                                <div className="row"><span>{k}</span><span>{v}</span></div>
                            )
                        })}
                    </div>
                </section>
            </section>
            
        </div>
    );
}

export default Home;