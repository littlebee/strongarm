import { webSocket, logMessage } from "./hubState";
import { IHubState } from "./hubState";

export function sendHubStateUpdate(data: Partial<IHubState>) {
    logMessage("sending state update", { data, webSocket });
    if (webSocket) {
        webSocket.send(
            JSON.stringify({
                type: "updateState",
                data,
            })
        );
    }
}

export function sendSetAngles(angles: number[]) {
    sendHubStateUpdate({ set_angles: angles });
}

export function sendArmConfigSelected(file: string) {
    sendHubStateUpdate({ arm_config_selected: file });
}
