import { useCallback } from "react";

import { sendArmConfigSelected } from "../util/hubMessages";
import { IHubState } from "../util/hubState";
import st from "./ArmConfig.module.css";

interface ArmConfigProps {
    hubState: IHubState;
}

export function ArmConfig({ hubState }: ArmConfigProps) {
    const handleArmConfigClick = useCallback((file: string) => {
        sendArmConfigSelected(file);
    }, []);

    return (
        <div className={st.container}>
            <div className={st.title}>Select arm config</div>
            <div>
                {hubState.arm_config_files.map((file, index) => (
                    <a
                        key={index}
                        data-testid="selectable-arm-config"
                        onClick={() => handleArmConfigClick(file)}
                        className={
                            (file === hubState.arm_config.filename &&
                                "selected") ||
                            ""
                        }
                    >
                        {file}
                    </a>
                ))}
            </div>
        </div>
    );
}
