import React, { useMemo } from "react";

import Arm3D from "./Arm3d";

import st from "./index.module.css";
import { ArmAngleControls } from "./ArmAngleControls";

const lastCurrentAngles = null;

export function ArmView({ hubState }) {
    // console.log("ArmView", { hubState, lastCurrentAngles });

    const partNames = useMemo(
        () => hubState.arm_parts?.filter((p) => !p.fixed).map((p) => p.name),
        [hubState.arm_parts]
    );

    return (
        <div className={st.container}>
            <div className={st.visualization}>
                <Arm3D
                    armParts={hubState.arm_parts}
                    currentAngles={hubState.current_angles}
                />
            </div>
            <div className={st.controls}>
                <ArmAngleControls
                    partNames={partNames}
                    currentAngles={hubState.current_angles}
                    setAngles={hubState.set_angles}
                />
            </div>
        </div>
    );
}