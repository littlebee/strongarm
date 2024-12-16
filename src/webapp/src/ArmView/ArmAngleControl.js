import React, { useState, useEffect, useCallback, useRef, use } from "react";

import st from "./ArmAngleControl.module.css";

export function ArmControl({ part, currentAngle, setAngle, onSetAngle }) {
    const [grabberSelected, setGrabberSelected] = useState(false);
    const [grabberHovered, setGrabberHovered] = useState(false);
    const [changingAngle, setChangingAngle] = useState(null);
    const svgRef = useRef(null);

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (grabberSelected) {
                const rect = svgRef.current.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const angle = Math.atan2(y - 100, x - 100) * (180 / Math.PI);
                onSetAngle(angle * -1);
            }
        };

        const handleMouseUp = () => {
            setGrabberSelected(false);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [grabberSelected, onSetAngle]);

    const handleGrabberMouseDown = useCallback(() => {
        setGrabberSelected(true);
    });

    const handleAngleInputChange = useCallback((e) => {
        // allow small increments to be set without needing to press enter
        if (
            !changingAngle &&
            Math.abs(setAngle - Number.parseFloat(e.target.value)) < 2
        ) {
            handleAngleInputBlur(e);
        } else {
            setChangingAngle(e.target.value);
        }
    });

    const handleAngleInputBlur = useCallback((e) => {
        onSetAngle(parseInt(e.target.value));
        setChangingAngle(null);
    });

    const handleAngleInputKeyDown = useCallback((e) => {
        if (e.key === "Enter") {
            handleAngleInputBlur(e);
        }
    });

    const translateAngle = (angle) => {
        return 180 - angle;
    };

    return (
        <div className={st.container}>
            <div className={st.currentAngle}>{currentAngle}&deg;</div>
            <div className={st.textLabels}>
                <label>{part.name}</label>
                <div>
                    <div className={st.angleInputContainer}>
                        <input
                            type="number"
                            min={part.minAngle || 0}
                            max={part.maxAngle || 180}
                            className={st.angleInput}
                            value={changingAngle || setAngle?.toFixed(0) || 90}
                            onChange={handleAngleInputChange}
                            onBlur={handleAngleInputBlur}
                            onKeyDown={handleAngleInputKeyDown}
                        />
                        &deg;
                    </div>
                </div>
            </div>
            <svg width="300" height="100" viewBox="0 0 200 100" ref={svgRef}>
                <circle
                    cx="100"
                    cy="100"
                    r={80}
                    fill="none"
                    stroke="#c777"
                    strokeWidth="10"
                />
                <rect
                    className={st.grabber}
                    x="0"
                    y="90"
                    height="20"
                    width="50"
                    rx="10"
                    fill="#9d6" // from lcars.css
                    transform={`rotate(${translateAngle(
                        currentAngle
                    )} 100 100)`}
                    opacity={grabberSelected ? 1 : grabberHovered ? 0.8 : 0.5}
                    onMouseDown={handleGrabberMouseDown}
                    onMouseEnter={() => setGrabberHovered(true)}
                    onMouseLeave={() => setGrabberHovered(false)}
                />
                <line
                    x1="55"
                    y1="100"
                    x2="100"
                    y2="100"
                    fill="none"
                    stroke="#ffff00"
                    strokeWidth="1"
                    transform={`rotate(${translateAngle(
                        setAngle || 90
                    )} 100 100)`}
                />
            </svg>
        </div>
    );
}
