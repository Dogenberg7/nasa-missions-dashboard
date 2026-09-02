import SideBar from "../../Components/SideBar/SideBar.jsx";
import './Missions.css';
import {useEffect, useState} from "react";
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import { useTheme } from "../../context/ThemeContext.jsx";
import {API_URL} from "../../config.js";
import axios from "axios";
import DoubleRange from "../../Components/DoubleRange/DoubleRange.jsx";

function Missions() {
    const { theme, toggleTheme } = useTheme();


    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const [results, setResults] = useState([])
    const [nameFilter, setNameFilter] = useState('')
    const [typeFilter, setTypeFilter] = useState()
    const [countryFilter, setCountryFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState()
    const [range, setRange] = useState({min: 1920, max: new Date().getFullYear()})
    const [openFilters, setOpenFilters] = useState(false)

    function handleDates(range){
        setRange(range)
    }

    function applyFilters(){
        axios.get(`${API_URL}/missions?name=${nameFilter}${typeFilter ? '&type=' + typeFilter : ''}${range.min ?? {} ? '&from=01-01-' + range.min : ''}${range.max ?? {} ? '&to=12-31-' + range.max : ''}${countryFilter ? '&country=' + countryFilter : ''}${statusFilter ? '&status=' + statusFilter : ''}`).then((r) => {
            setResults(r.data);
        })
    }


    useEffect(() => {
        applyFilters()
    }, []);

    return (
        <div>
            <SideBar onToggle={toggleTheme} />
            <section className="missions">
                <div className="row">
                    <div className="search">
                        <SearchRoundedIcon />
                        <input type="text" placeholder="type to search" onChange={(e) => setNameFilter(e.target.value)}/>
                        <button type="button" aria-label="Search">
                            <SendRoundedIcon onClick={applyFilters}/>
                        </button>
                    </div>
                    <div className={'filtersWrapper'}>
                        <button type="button" onClick={() => {setOpenFilters(!openFilters)}} className="filters" aria-label="Filtri">
                            <FilterAltRoundedIcon />
                        </button>
                        <div className={`filtersModal ${openFilters ? 'open': ''}`}>
                            <h2>Filters</h2>
                            <div className="filtersList">
                                <div className="filter">
                                    <h4>Type</h4>
                                    <label className="check">
                                        <input type="radio" name={'type'} defaultChecked={true} value={''} onChange={e => {setTypeFilter(e.target.value)}}/> ANY
                                    </label>
                                    <label className="check">
                                        <input type="radio" name={'type'} value={'crewed'} onChange={e => {setTypeFilter(e.target.value)}}/> CREWED
                                    </label>
                                    <label className="check">
                                        <input type="radio" name={'type'} value={'robotic'} onChange={e => {setTypeFilter(e.target.value)}}/> ROBOTIC
                                    </label>
                                    <label className="check">
                                        <input type="radio" name={'type'} value={'rover'} onChange={e => {setTypeFilter(e.target.value)}}/> ROVER
                                    </label>
                                    <label className="check">
                                        <input type="radio" name={'type'} value={'telescope'} onChange={e => {setTypeFilter(e.target.value)}}/> TELESCOPE
                                    </label>
                                </div>
                                <div className="filter">
                                    <h4>Country</h4>
                                    <input type="text" placeholder={'Insert country here'} onChange={(e) => setCountryFilter(e.target.value) }/>
                                    <h4>Status</h4>
                                    <label className="check">
                                        <input type="radio" name={'status'} defaultChecked={true} value={''} onChange={e => {setStatusFilter(e.target.value)}}/> ANY
                                    </label>
                                    <label className="check">
                                        <input type="radio" name={'status'} value={'ongoing'} onChange={e => {setStatusFilter(e.target.value)}}/> ONGOING
                                    </label>
                                    <label className="check">
                                        <input type="radio" name={'status'} value={'completed'} onChange={e => {setStatusFilter(e.target.value)}}/> COMPLETED
                                    </label>
                                </div>
                                <div className="filter">
                                    <h4>Launch year</h4>
                                    <DoubleRange onChange={handleDates}/>
                                </div>
                            </div>
                            <button onClick={applyFilters}>apply</button>
                        </div>
                    </div>

                </div>

                <div className="results">
                    {results.map((p) => (
                        <div className="card" key={p.id} onClick={() => window.location.href = `/missions/${p.slug}`}>
                            <img src={`https://images-assets.nasa.gov/image/${p.cover_nasa_id}/${p.cover_nasa_id}~thumb.jpg`} alt={p.name} />
                            <div className="info">
                                <h3>{p.name}</h3>
                                <p>{p.program}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Missions;