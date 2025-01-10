import { useMemo, useCallback } from "react";

import { IArmPart } from "../util/hubState";
import { sendSetAngles } from "../util/hubMessages";
import { ArmControl } from "./ArmAngleControl";

import st from "./ArmAngleControls.module.css";

interface ArmAngleControlsProps {
    parts: IArmPart[];
    currentAngles: number[];
    setAngles: number[];
}

export function ArmAngleControls({
    parts,
    currentAngles,
    setAngles,
}: ArmAngleControlsProps) {
    const handleOnSetAngle = useCallback(
        (angleIndex: number, angle: number) => {
            console.log("setting angle", { angleIndex, angle });
            const newAngles = [...setAngles];
            newAngles[angleIndex] = angle;
            sendSetAngles(newAngles);
        },
        [setAngles]
    );

    const controls = useMemo(() => {
        if (!parts?.length) return null;

        const cOut = [];
        for (let i = parts.length - 1; i >= 0; i--) {
            cOut.push(
                <ArmControl
                    key={i}
                    part={parts[i]}
                    currentAngle={currentAngles[i]}
                    setAngle={setAngles[i]}
                    onSetAngle={(newAngle) => handleOnSetAngle(i, newAngle)}
                />
            );
        }
        return cOut;
    }, [parts, currentAngles, setAngles, handleOnSetAngle]);

    return (
        <div>
            <h4>Arm Angles</h4>
            <div className={st.angleControls}>{controls}</div>
        </div>
    );
}
