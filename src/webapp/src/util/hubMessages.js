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
