import React, { useMemo } from "react";

import st from "./ArmAngleControls.module.css";

import { ArmControl } from "./ArmAngleControl";
import { movablePartNames as partNames } from "./armParts";

export function ArmAngleControls({ currentAngles, setAngles }) {
    const controls = useMemo(() => {
        console.log("ArmAngleControls", {
            partNames,
            currentAngles,
            setAngles,
        });
        const cOut = [];
        for (let i = partNames.length - 1; i >= 0; i--) {
            cOut.push(
                <ArmControl
                    key={i}
                    name={partNames[i]}
                    currentAngle={currentAngles[i]}
                    setAngle={setAngles[i]}
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
