import { webSocket, logMessage } from "./hubState";

export function sendHubStateUpdate(data) {
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

export function sendSetAngles(angles) {
    sendHubStateUpdate({ set_angles: angles });
}

export function sendArmConfigSelected(file) {
    sendHubStateUpdate({ arm_config_selected: file });
}
