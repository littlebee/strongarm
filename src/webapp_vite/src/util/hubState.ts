import "react";
import { au } from "vitest/dist/chunks/reporters.D7Jzd9GS.js";

const urlParams = new URLSearchParams(window.location.search);
const debugThings = urlParams.get("debug")?.split(",") || [];

export const logMessages = debugThings.indexOf("messages") >= 0;

// How often to check if hub is really still alive
const HUB_PING_INTERVAL = 1000;
// with us pinging every 1000ms, there should
// never be a lapse of more than 1500 between
// messages from hub.  Otherwise, we show "offline"
const MIN_HUB_UPDATE_INTERVAL = 1500;

export const DEFAULT_HUB_PORT = 5800;

export interface IVec3 {
    x: number;
    y: number;
    z: number;
}

export interface IArmPart {
    name: string;
    file: string;
    position: IVec3;
    fixed?: boolean;

    // rotation
    initialRotation?: IVec3;
    rotationOffset?: IVec3;
    invertRotation?: boolean;
    rotationAxis?: "x" | "y" | "z";

    // range of motion
    motorRange?: number;
    minAngle?: number;
    maxAngle?: number;
}

export interface ISavedPosition {
    uuid: string;
    name: string;
    description: string;
    angles: number[];
}

export interface IHubState {
    // this is for the UI only
    hubConnStatus?: string;
    // the keys below are shared from central hub.  See hub_state.py
    hub_stats: {
        state_updates_recv: number;
    };
    // currently selected arm config provided by
    // arms_config_provider
    arm_config: {
        filename: string;
        description: string;
        arm_parts: IArmPart[];
    };
    // array of json file names provided to central hub
    // by arms_config_provider
    arm_config_files: string[];
    // initially by arms_config_provider to last selected, can be changed
    // to any of the arm_configs
    arm_config_selected: string;

    // actual angles last reported by servos
    current_angles: number[];
    //last requested angles
    set_angles: number[];

    // saved positions provided initially by central hub via serialized keys
    // and updated by the UI.
    saved_positions: ISavedPosition[];
}

export const DEFAULT_HUB_STATE: IHubState = {
    hubConnStatus: "offline",

    // provided by central_hub/
    hub_stats: { state_updates_recv: 0 },
    arm_config: {
        filename: "",
        description: "",
        arm_parts: [],
    },
    arm_config_files: [],
    arm_config_selected: "",

    set_angles: [],
    current_angles: [],
    saved_positions: [],
};

const __hub_state: IHubState = { ...DEFAULT_HUB_STATE };
const __hub_port: number = DEFAULT_HUB_PORT;

const onUpdateCallbacks: Array<(state: IHubState) => void> = [];
let hubStatePromises: Array<(state: IHubState) => void> = [];
let lastHubUpdate = Date.now();
let hubMonitor: number | null = null;

export let webSocket: WebSocket | null = null;

export interface ConnectToHubOptions {
    port?: number;
    state?: IHubState;
    autoReconnect?: boolean;
}

export function connectToHub({
    port = DEFAULT_HUB_PORT,
    state = DEFAULT_HUB_STATE,
    autoReconnect = true,
}: ConnectToHubOptions) {
    try {
        setHubConnStatus("connecting");
        const hubUrl = `ws://${window.location.hostname}:${port}/ws`;
        console.log(`connecting to central-hub at ${hubUrl}`);
        webSocket = new WebSocket(hubUrl);

        webSocket.addEventListener("open", function () {
            lastHubUpdate = Date.now();

            try {
                webSocket!.send(JSON.stringify({ type: "getState" }));
                webSocket!.send(
                    JSON.stringify({ type: "identity", data: "webapp" })
                );
                webSocket!.send(
                    JSON.stringify({ type: "subscribeState", data: "*" })
                );
                setHubConnStatus("online");
            } catch (e) {
                onConnError(state, e as Error);
            }
            startHubMonitor();
        });

        webSocket.addEventListener("error", function (event) {
            console.error("got error from central-hub socket", event);
        });

        webSocket.addEventListener("close", function (event) {
            if (autoReconnect) {
                onConnError(
                    state,
                    new Error(`websocket close code: ${event.code}`)
                );
            }
        });

        webSocket.addEventListener("message", function (event) {
            lastHubUpdate = Date.now();
            let message = null;
            try {
                message = JSON.parse(event.data);
            } catch (e) {
                console.error("error parsing message from central-hub", e);
                return;
            }
            if (message.type === "pong") {
                return;
            }
            logMessage("got message from central-hub", {
                raw: event.data,
                parsed: message,
            });
            if (message.type === "state" && hubStatePromises.length > 0) {
                hubStatePromises.forEach((p) => p(message.data));
                hubStatePromises = [];
            } else if (
                message.type === "state" ||
                message.type === "stateUpdate"
            ) {
                updateStateFromCentralHub(message.data);
            }
        });
    } catch (e) {
        onConnError(state, e as Error);
    }
}

function startHubMonitor() {
    stopHubMonitor();
    hubMonitor = setInterval(() => {
        try {
            // if the socket is hung or there is no network,
            // the websocket will not error out until we send something
            webSocket!.send(JSON.stringify({ type: "ping" }));

            if (
                __hub_state.hubConnStatus === "online" &&
                Date.now() - lastHubUpdate > MIN_HUB_UPDATE_INTERVAL
            ) {
                setHubConnStatus("offline");
            }
        } catch (e) {
            // will get caught by the close if there is a problem
            // but if we send above before while the socket is connecting
            // it will throw a spurious error
            console.error("error pinging central-hub", e);
        }
    }, HUB_PING_INTERVAL);
}

function stopHubMonitor() {
    if (hubMonitor) {
        clearInterval(hubMonitor);
        hubMonitor = null;
    }
}

// handler gets called with __hub_state
export function addHubStateUpdatedListener(
    handler: (state: IHubState) => void
) {
    onUpdateCallbacks.push(handler);
}

export function removeHubStateUpdatedListener(
    handler: (state: IHubState) => void
) {
    const index = onUpdateCallbacks.indexOf(handler);
    if (index !== -1) {
        onUpdateCallbacks.splice(index, 1);
    }
}

export function getLocalState() {
    return __hub_state;
}

export function getStateFromCentralHub() {
    const statePromise = new Promise<IHubState>((resolve) =>
        hubStatePromises.push(resolve)
    );
    webSocket!.send(JSON.stringify({ type: "getState" }));
    return statePromise;
}

export function updateSharedState(newState: IHubState) {
    webSocket!.send(JSON.stringify({ type: "updateState", data: newState }));
}

function delayedConnectToHub(state: IHubState) {
    setTimeout(() => {
        if (state.hubConnStatus === "offline") {
            connectToHub(__hub_port, state);
        }
    }, 5000);
}

function onConnError(state: IHubState, e: Error) {
    console.error(
        "got close message from central-hub socket. will attempt to reconnnect in 5 seconds",
        e
    );
    stopHubMonitor();
    setHubConnStatus("offline");
    delayedConnectToHub(state);
}

// not exported, should only be called from connectToHub
function setHubConnStatus(newStatus: string) {
    logMessage("setting conn status", newStatus);
    __hub_state.hubConnStatus = newStatus;
    emitUpdated();
}

function updateStateFromCentralHub(hubData: IHubState) {
    for (const [key, value] of Object.entries(hubData)) {
        // @ts-expect-error hub state from central hub is not strongly typed
        __hub_state[key] = value;
    }
    emitUpdated();
}

function emitUpdated() {
    for (const callback of onUpdateCallbacks) {
        callback(__hub_state);
    }
}

// args can be any args that are valid for console.log which by definition any
// eslint-disable-next-line
export function logMessage(...args: any[]) {
    if (logMessages) {
        console.log(...args);
    }
}
