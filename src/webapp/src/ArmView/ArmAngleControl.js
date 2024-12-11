import React from "react";

import st from "./ArmAngleControl.module.css";

export function ArmControl({ name, currentAngle, setAngle }) {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;

    const translateAngle = (angle) => {
        return -180 + angle;
    };

    console.log("ArmControl", {
        name,
        currentAngle,
        setAngle,
        translateAngle: translateAngle(currentAngle),
    });

    return (
        <div className={st.container}>
            <label>{name}</label>
            <svg width="200" height="80" viewBox="0 0 120 60">
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#e6e6e6"
                    strokeWidth="1"
                />
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#00ff00"
                    strokeWidth="100"
                    strokeDasharray="1 355"
                    transform={`rotate(${translateAngle(currentAngle)} 60 60)`}
                />
                <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    fill="none"
                    stroke="#ffff00"
                    strokeWidth="10"
                    strokeDasharray="1 355"
                    transform={`rotate(${translateAngle(setAngle)} 60 60)`}
                    strokeOpacity="0.6"
                />
            </svg>
            <input
                type="range"
                min={0}
                max={180}
                value={setAngle}
                onChange={(e) => {
                    // handle change
                    // onSetAngle(parseInt(e.target.value));
                }}
            />
        </div>
    );
}
