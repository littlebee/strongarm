import React, { useMemo, useCallback } from "react";

import { sendSetAngles } from "../util/hubMessages";
import { ArmControl } from "./ArmAngleControl";
import { movablePartNames as partNames } from "./armParts";

import st from "./ArmAngleControls.module.css";

export function ArmAngleControls({ currentAngles, setAngles }) {
    const handleOnSetAngle = useCallback((angleIndex, angle) => {
        console.log("setting angle", { angleIndex, angle });
        const newAngles = [...setAngles];
        newAngles[angleIndex] = angle;
        sendSetAngles(newAngles);
    });

    const controls = useMemo(() => {
        // console.log("ArmAngleControls", {
        //     partNames,
        //     currentAngles,
        //     setAngles,
        // });
        const cOut = [];
        for (let i = partNames.length - 1; i >= 0; i--) {
            cOut.push(
                <ArmControl
                    key={i}
                    name={partNames[i]}
                    currentAngle={currentAngles[i]}
                    setAngle={setAngles[i]}
                    onSetAngle={(newAngle) => handleOnSetAngle(i, newAngle)}
                />
            );
        }
        return cOut;
    });

    return (
        <div>
            <h4>Arm Angles</h4>
            <div className={st.angleControls}>{controls}</div>
        </div>
    );
}
