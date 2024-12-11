import React from "react";

import Arm3D from "./Arm3d";

import st from "./index.module.css";
import { ArmAngleControls } from "./ArmAngleControls";

export function ArmView({ hubState }) {
    console.log("ArmView", { hubState });
    return (
        <div className={st.container}>
            <div className={st.visualization}>
                <Arm3D currentAngles={hubState.currentAngles} />
            </div>
            <div className={st.controls}>
                <ArmAngleControls
                    currentAngles={hubState.current_angles}
                    setAngles={hubState.set_angles}
                />
            </div>
        </div>
    );
}
