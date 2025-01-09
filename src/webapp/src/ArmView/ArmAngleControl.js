import React, { useState, useEffect, useCallback, useRef, use } from "react";

import { findAngle } from "../util/angle_utils";
import st from "./ArmAngleControl.module.css";

const CIRCLE_CENTER = { x: 100, y: 100 };

export function ArmControl({ part, currentAngle, setAngle, onSetAngle }) {
    const [grabberSelected, setGrabberSelected] = useState(false);
    const [grabberHovered, setGrabberHovered] = useState(false);
    const [changingAngle, setChangingAngle] = useState(null);
    const svgRef = useRef(null);
    const motorRange = part.motorRange || 180;
    const minAngle = part.minAngle || 0;
    const maxAngle = part.maxAngle || motorRange;
    const midAngle = (maxAngle + minAngle) / 2;

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (
                !svgRef.current ||
                !grabberSelected ||
                !(e.clientX || e.touches)
            ) {
                return;
            }
            const clientX = e.clientX || e.touches[0].clientX;
            const clientY = e.clientY || e.touches[0].clientY;
            const rect = svgRef.current.getBoundingClientRect();
            const centerX = rect.left + CIRCLE_CENTER.x / 2;
            const centerY = rect.top + CIRCLE_CENTER.y;
            const angle = findAngle(centerX, centerY, clientX, clientY);
            onSetAngle(angle * -1);
        };

        const handleMouseUp = () => {
            grabberSelected && setGrabberSelected(false);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        document.addEventListener("touchmove", handleMouseMove);
        document.addEventListener("touchend", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
            document.removeEventListener("touchmove", handleMouseMove);
            document.removeEventListener("touchend", handleMouseUp);
        };
    }, [grabberSelected, onSetAngle, motorRange]);

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
        return 90 + midAngle - angle;
    };

    const grabberHashMarks = [];
    for (let i = 0; i < 3; i++) {
        const x = 10 + i * 10;
        grabberHashMarks.push(
            <line
                key={i}
                x1={x}
                y1="95"
                x2={x}
                y2="105"
                fill="none"
                stroke="#000"
                strokeWidth="1"
            />
        );
    }

    return (
        <div className={st.container}>
            <div className={st.currentAngle}>
                {parseFloat(currentAngle).toFixed(3)}&deg;
            </div>
            <div className={st.textLabels}>
                <label>{part.name}</label>
                <div>
                    <div className={st.angleInputContainer}>
                        <input
                            type="number"
                            min={minAngle}
                            max={maxAngle}
                            className={st.angleInput}
                            value={changingAngle || setAngle?.toFixed(0) || 0}
                            onChange={handleAngleInputChange}
                            onBlur={handleAngleInputBlur}
                            onKeyDown={handleAngleInputKeyDown}
                        />
                        &deg;
                    </div>
                </div>
            </div>
            <svg width="200" height="100" viewBox="0 0 200 180" ref={svgRef}>
                <circle
                    cx={CIRCLE_CENTER.x}
                    cy={CIRCLE_CENTER.y}
                    r={90}
                    fill="none"
                    stroke="#c777"
                    strokeWidth="10"
                />
                <g
                    transform={`rotate(${translateAngle(setAngle)} ${
                        CIRCLE_CENTER.x
                    } ${CIRCLE_CENTER.y})`}
                >
                    <rect
                        className={st.grabber}
                        x="-10"
                        y="88"
                        height="25"
                        width="60"
                        rx="10"
                        fill="#9d6" // from lcars.css
                        opacity={
                            grabberSelected ? 1 : grabberHovered ? 0.8 : 0.7
                        }
                        onMouseDown={handleGrabberMouseDown}
                        onTouchStart={handleGrabberMouseDown}
                        onMouseEnter={() => setGrabberHovered(true)}
                        onMouseLeave={() => setGrabberHovered(false)}
                    />
                    {grabberHashMarks}
                </g>
                <line
                    x1="35"
                    y1={CIRCLE_CENTER.x}
                    x2={CIRCLE_CENTER.x}
                    y2={CIRCLE_CENTER.y}
                    fill="none"
                    stroke="#ffff00"
                    strokeWidth="1"
                    transform={`rotate(${translateAngle(currentAngle || 0)} ${
                        CIRCLE_CENTER.x
                    } ${CIRCLE_CENTER.y})`}
                />
                <line
                    x1="0"
                    y1={CIRCLE_CENTER.x}
                    x2={CIRCLE_CENTER.x}
                    y2={CIRCLE_CENTER.y}
                    fill="none"
                    stroke="#770000"
                    strokeWidth="4"
                    strokeDasharray="5"
                    transform={`rotate(${translateAngle(minAngle)} ${
                        CIRCLE_CENTER.x
                    } ${CIRCLE_CENTER.y})`}
                />
                <line
                    x1="25"
                    y1={CIRCLE_CENTER.x}
                    x2={CIRCLE_CENTER.x}
                    y2={CIRCLE_CENTER.y}
                    fill="none"
                    stroke="#770000"
                    strokeWidth="4"
                    strokeDasharray="5"
                    transform={`rotate(${translateAngle(maxAngle)} ${
                        CIRCLE_CENTER.x
                    } ${CIRCLE_CENTER.y})`}
                />
            </svg>
        </div>
    );
}
