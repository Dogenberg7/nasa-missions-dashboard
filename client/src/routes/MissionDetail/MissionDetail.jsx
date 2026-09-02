import {useTheme} from "../../context/ThemeContext.jsx";
import SideBar from "../../Components/SideBar/SideBar.jsx";
import { useNavigate, useParams } from "react-router-dom";
import {useEffect, useState} from "react";
import {API_URL} from "../../config.js";
import axios from "axios";
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import './missionDetail.css'
function MissionDetail() {

  const { slug } = useParams();
  const navigate = useNavigate();
  const { toggleTheme, compareList, addToCompare, removeFromCompare } = useTheme();
  const [data, setData] = useState()
  const [media, setMedia] = useState()
  const isInCompare = compareList.includes(slug);

  useEffect(() => {
    axios.get(`${API_URL}/missions/${slug}`).then(data => {
      setData(data.data)
    })
    axios.get(`${API_URL}/missions/${slug}/media`).then(data => {
      setMedia(data.data)
    })
  }, [slug]);

  function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${mm}-${dd}-${date.getFullYear()}`;
  }

    return (
        <div>
          <SideBar onToggle={toggleTheme} />
          <section className={'details'}>
            <button type="button" className="back" onClick={() => navigate(-1)} aria-label="Back">
              <ArrowBackRoundedIcon/>
            </button>
            {data &&
              <>
                <div className="card">
                  <img className="cover" src={`https://images-assets.nasa.gov/image/${data.cover_nasa_id}/${data.cover_nasa_id}~small.jpg`} alt={data.name}/>
                  <div className="content">
                    <div className="header">
                      <h1 className="name">
                        {data.name}
                      </h1>
                      <button
                          type="button"
                          className={`compareBtn ${isInCompare ? 'added' : ''}`}
                          onClick={() => isInCompare ? removeFromCompare(slug) : addToCompare(slug)}
                      >
                        <CompareArrowsRoundedIcon fontSize="small" />
                        {isInCompare ? 'Added' : 'Compare'}
                      </button>
                    </div>
                    <div className="info-grid">
                      <div className="row">
                        <div className="field">
                          <h4>Program</h4>
                          <p>{data.program}</p>
                        </div>
                        <div className="field">
                          <h4>Type</h4>
                          <p>{data.type}</p>
                        </div>
                        <div className="field">
                          <h4>Destination</h4>
                          <p>{data.destination}</p>
                        </div>
                      </div>
                      <div className="row">
                        <div className="field">
                          <h4>Status</h4>
                          <p><span className={`badge ${data.status}`}>{data.status}</span></p>
                        </div>
                        {data.outcome &&
                            <div className="field">
                              <h4>Outcome</h4>
                              <p><span className={`badge ${data.outcome}`}>{data.outcome}</span></p>
                            </div>
                        }
                        <div className="field">
                          <h4>Launch date</h4>
                          <p>{formatDate(data.launch_date)}</p>
                        </div>
                        {data.end_date &&
                            <div className="field">
                              <h4>End date</h4>
                              <p>{formatDate(data.end_date)}</p>
                            </div>
                        }
                      </div>
                      <div className="row">
                        <div className="field span">
                          <h4>Launch site</h4>
                          <p className={'launch-site'} onClick={() => window.location.href = `/launch-sites/${data.launch_site_id}`}>{[data.launch_site_name, data.locality, data.country].filter(Boolean).join(', ')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {media &&
                    <div className="media">
                      <h2>Available media</h2>
                      <div className="mediaGrid">
                        <div className="group">
                          <span className="accent"></span>
                          <p className="label">Total</p>
                          <p className="value">{media.total}</p>
                        </div>
                        <div className="group">
                          <span className="accent"></span>
                          <p className="label">Images</p>
                          <p className="value">{media.by_type?.image ?? 0}</p>
                        </div>
                        <div className="group">
                          <span className="accent"></span>
                          <p className="label">Videos</p>
                          <p className="value">{media.by_type?.video ?? 0}</p>
                        </div>
                        <div className="group">
                          <span className="accent"></span>
                          <p className="label">Audio</p>
                          <p className="value">{media.by_type?.audio ?? 0}</p>
                        </div>
                      </div>
                    </div>
                }
              </>
            }
          </section>
        </div>
    );
}

export default MissionDetail;
