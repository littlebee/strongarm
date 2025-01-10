/* eslint react-hooks/rules-of-hooks: 0  */
//  TODO : I'm pretty sure that the useEffects are not being used incorrectly here, but I'm not sure how to fix the error.

import React, { useState, useEffect, useCallback, useRef } from "react";

import { findAngle } from "../util/angle_utils";
import st from "./ArmAngleControl.module.css";
import { IArmPart } from "../util/hubState";

const CIRCLE_CENTER = { x: 100, y: 100 };

interface ArmControlProps {
    part: IArmPart;
    currentAngle: number;
    setAngle: number;
    onSetAngle: (angle: number) => void;
}

export function ArmControl({
    part,
    currentAngle,
    setAngle,
    onSetAngle,
}: ArmControlProps) {
    const [grabberSelected, setGrabberSelected] = useState(false);
    const [grabberHovered, setGrabberHovered] = useState(false);
    const [changingAngle, setChangingAngle] = useState<number | null>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const motorRange = part.motorRange || 180;
    const minAngle = part.minAngle || 0;
    const maxAngle = part.maxAngle || motorRange;
    const midAngle = (maxAngle + minAngle) / 2;

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent | TouchEvent) => {
            if (
                !svgRef.current ||
                !grabberSelected ||
                !(e instanceof MouseEvent || e.touches)
            ) {
                return;
            }
            const clientX =
                e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
            const clientY =
                e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
            const rect = svgRef.current.getBoundingClientRect();
            const centerX = rect.left + CIRCLE_CENTER.x / 2;
            const centerY = rect.top + CIRCLE_CENTER.y;
            const angle = findAngle(centerX, centerY, clientX, clientY);
            onSetAngle(angle * -1);
        };

        const handleMouseUp = () => {
            if (grabberSelected) {
                setGrabberSelected(false);
            }
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

    const handleAngleInputBlur = useCallback(
        (
            e:
                | React.FocusEvent<HTMLInputElement>
                | React.ChangeEvent<HTMLInputElement>
        ) => {
            onSetAngle(parseInt(e.target.value));
            setChangingAngle(null);
        },
        [onSetAngle]
    );

    const handleAngleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            // allow small increments to be set without needing to press enter
            if (
                !changingAngle &&
                Math.abs(setAngle - Number.parseFloat(e.target.value)) < 2
            ) {
                handleAngleInputBlur(e);
            } else {
                setChangingAngle(Number.parseFloat(e.target.value));
            }
        },
        [changingAngle, setAngle, handleAngleInputBlur]
    );

    const handleAngleInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                handleAngleInputBlur(
                    e as unknown as React.FocusEvent<HTMLInputElement>
                );
            }
        },
        [handleAngleInputBlur]
    );

    const translateAngle = (angle: number) => {
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

    const handleCircleClick = (
        event: React.MouseEvent<SVGCircleElement, MouseEvent>
    ) => {
        const svg = svgRef.current;
        if (!svg) return;

        const rect = svgRef.current.getBoundingClientRect();
        const centerX = rect.left + CIRCLE_CENTER.x / 2;
        const centerY = rect.top + CIRCLE_CENTER.y;
        const angle = findAngle(centerX, centerY, event.clientX, event.clientY);
        onSetAngle(angle * -1);
    };

    return (
        <div className={st.container}>
            <div className={st.currentAngle}>
                {!!currentAngle &&
                    parseFloat(currentAngle.toString()).toFixed(3)}
                &deg;
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
                    strokeWidth="14"
                    onClick={handleCircleClick}
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
