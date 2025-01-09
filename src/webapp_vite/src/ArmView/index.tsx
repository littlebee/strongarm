import React, { useMemo } from "react";

import Arm3D from "./Arm3d";

import st from "./index.module.css";
import { ArmAngleControls } from "./ArmAngleControls";

interface HubState {
    arm_config: {
        arm_parts: Array<{
            fixed: boolean;
        }>;
        [key: string]: any;
    };
    current_angles: number[];
    set_angles: number[];
}

interface ArmViewProps {
    hubState: HubState;
}

const lastCurrentAngles = null;

export function ArmView({ hubState }: ArmViewProps) {
    // console.log("ArmView", { hubState, lastCurrentAngles });

    const parts = useMemo(
        () => hubState.arm_config.arm_parts?.filter((p) => !p.fixed),
        [hubState.arm_config.arm_parts]
    );

    console.log("ArmView", { parts });

    return (
        <div className={st.container}>
            <div className={st.visualization}>
                <Arm3D
                    armParts={hubState.arm_config.arm_parts}
                    currentAngles={hubState.current_angles}
                />
            </div>
            <div className={st.controls}>
                <ArmAngleControls
                    parts={parts}
                    currentAngles={hubState.current_angles}
                    setAngles={hubState.set_angles}
                />
            </div>
        </div>
    );
}
