import { useCallback } from "react";

import { sendArmConfigSelected } from "../util/hubMessages";
import st from "./ArmConfig.module.css";

interface ArmConfigProps {
    hubState: {
        arm_config_files: string[];
        arm_config: {
            filename: string;
        };
    };
}

export function ArmConfig({ hubState }: ArmConfigProps) {
    const handleArmConfigClick = useCallback((file: string) => {
        sendArmConfigSelected(file);
    }, []);

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
                                    "selected") ||
                                ""
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
