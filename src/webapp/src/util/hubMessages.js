import { webSocket } from "./hubState";

export function sendSetAngles(angles) {
    console.log("sending angles", { angles, webSocket });
    if (webSocket) {
        webSocket.send(
            JSON.stringify({
                type: "updateState",
                data: {
                    set_angles: angles,
                },
            })
        );
    }
}

export function sendArmConfigSelected(file) {
    console.log("sending arm config", { file, webSocket });
    if (webSocket) {
        webSocket.send(
            JSON.stringify({
                type: "updateState",
                data: {
                    arm_config_selected: file,
                },
            })
        );
    }
}
