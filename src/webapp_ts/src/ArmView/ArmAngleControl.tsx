import React, { useState, useEffect, useCallback, useRef } from "react";

import st from "./ArmAngleControl.module.css";

interface ArmControlProps {
    part: any;
    currentAngle: number;
    setAngle: number;
    onSetAngle: (angle: number) => void;
}

export function ArmControl({ part, currentAngle, setAngle, onSetAngle }: ArmControlProps) {
    const [grabberSelected, setGrabberSelected] = useState(false);
    const [grabberHovered, setGrabberHovered] = useState(false);
    const [changingAngle, setChangingAngle] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const motorRange = part.motorRange || 180;
    const minAngle = part.minAngle || 0;
    const maxAngle = part.maxAngle || motorRange;
    const midAngle = (maxAngle + minAngle) / 2;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent | TouchEvent) => {
            if (!svgRef.current || !grabberSelected || !(e instanceof MouseEvent || e.touches)) {
                return;
            }
            const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
            const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
            const rect = svgRef.current.getBoundingClientRect();
            const x = clientX - rect.left;
            const y = clientY - rect.top;
            const angle = Math.atan2(y - 100, x - 100) * (360 / Math.PI);
            onSetAngle(angle * -1);

            console.log("Mouse move", { x, y, angle });
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
    }, []);

    const handleAngleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        // allow small increments to be set without needing to press enter
        if (!changingAngle && Math.abs(setAngle - Number.parseFloat(e.target.value)) < 2) {
            handleAngleInputBlur(e);
        } else {
            setChangingAngle(Number.parseFloat(e.target.value));
        }
    }, [changingAngle, setAngle]);

    const handleAngleInputBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
        onSetAngle(parseInt(e.target.value));
        setChangingAngle(null);
    }, [onSetAngle]);

    const handleAngleInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            handleAngleInputBlur(e as unknown as React.FocusEvent<HTMLInputElement>);
        }
    }, [handleAngleInputBlur]);

    const translateAngle = (angle: number) => {
        return 90 + midAngle - angle;
    };

    return (
        <div className={st.container}>
            <div className={st.currentAngle}>
                {parseFloat(currentAngle.toString()).toFixed(3)}&deg;
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
            <svg width="200" height="100" viewBox="0 0 200 200" ref={svgRef}>
                <circle
                    cx="100"
                    cy="100"
                    r={70}
                    fill="none"
                    stroke="#c777"
                    strokeWidth="10"
                />
                <rect
                    className={st.grabber}
                    x="10"
                    y="90"
                    height="20"
                    width="50"
                    rx="10"
                    fill="#9d6" // from lcars.css
                    transform={`rotate(${translateAngle(setAngle)} 100 100)`}
                    opacity={grabberSelected ? 1 : grabberHovered ? 0.8 : 0.7}
                    onMouseDown={handleGrabberMouseDown}
                    onTouchStart={handleGrabberMouseDown}
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
                        currentAngle || 0
                    )} 100 100)`}
                />
                <line
                    x1="0"
                    y1="100"
                    x2="100"
                    y2="100"
                    fill="none"
                    stroke="#770000"
                    strokeWidth="4"
                    strokeDasharray="5"
                    transform={`rotate(${translateAngle(minAngle)} 100 100)`}
                />
                <line
                    x1="25"
                    y1="100"
                    x2="100"
                    y2="100"
                    fill="none"
                    stroke="#770000"
                    strokeWidth="4"
                    strokeDasharray="5"
                    transform={`rotate(${translateAngle(maxAngle)} 100 100)`}
                />
            </svg>
        </div>
    );
}
