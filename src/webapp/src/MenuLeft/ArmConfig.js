import React, { useCallback } from "react";

import { sendArmConfigSelected } from "../util/hubMessages";
import st from "./ArmConfig.module.css";

export function ArmConfig({ hubState }) {
    const handleArmConfigClick = useCallback((file) => {
        sendArmConfigSelected(file);
    });

    console.log("rendering ArmConfig", { hubState });
    return (
        <div className={st.container}>
            <div className={st.title}>Select arm config</div>
            <div>
                {hubState.arm_config_files.map((file, index) => (
                    <div key={index}>
                        <a
                            onClick={() => handleArmConfigClick(file)}
                            className={
                                (file === hubState.arm_config.filename &&
                                    st.selected) ||
                                null
                            }
                        >
                            {file}
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}
