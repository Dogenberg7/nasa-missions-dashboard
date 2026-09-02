import { useState } from "react";
import "./double.css";

function DoubleRange({ min = 1920, max =  new Date().getFullYear(), onChange }) {
    const [minVal, setMinVal] = useState(min);
    const [maxVal, setMaxVal] = useState(max);

    const handleMin = (e) => {
        const value = Math.min(Number(e.target.value), maxVal - 1);
        setMinVal(value);
        onChange?.({ min: value, max: maxVal });
    };

    const handleMax = (e) => {
        const value = Math.max(Number(e.target.value), minVal + 1);
        setMaxVal(value);
        onChange?.({ min: minVal, max: value });
    };

    const percent = (v) => ((v - min) / (max - min)) * 100;

    return (
        <div className="double-range">
            <div className="track" />
            <div
                className="range"
                style={{ left: `${percent(minVal)}%`, right: `${100 - percent(maxVal)}%` }}
            />
            <input type="range" min={min} max={max} value={minVal} onChange={handleMin} />
            <input type="range" min={min} max={max} value={maxVal} onChange={handleMax} />
            <div className="values"><span>{minVal}</span><span>{maxVal}</span></div>
        </div>
    );
}

export default DoubleRange;