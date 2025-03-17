import "react";

const urlParams = new URLSearchParams(window.location.search);
const debugThings = urlParams.get("debug")?.split(",") || [];

export const logMessages = debugThings.indexOf("messages") >= 0;

// How often to check if hub is really still alive
const HUB_PING_INTERVAL = 1000;
// with us pinging every 1000ms, there should
// never be a lapse of more than 1500 between
// messages from hub.  Otherwise, we show "offline"
const MIN_HUB_UPDATE_INTERVAL = 1500;

export const HUB_PORT = process.env.HUB_PORT || 5800;

export const HUB_HOST = `${window.location.hostname}:${HUB_PORT}`;

export const HUB_URL = `ws://${HUB_HOST}/ws`;

export const DEFAULT_HUB_STATE = {
    // this is for the UI only
    hubConnStatus: "offline",

    // the keys below are shared from central hub.  See hub_state.py

    // provided by central_hub/
    hub_stats: { state_updates_recv: 0 },
    //last requested angles
    set_angles: [],
    // actual angles last reported by servos
    current_angles: [],

    // array of json file names provided to central hub
    // by arms_config_provider
    arm_config_files: [],

    // initially by arms_config_provider to last selected, can be changed
    // to any of the arm_configs
    arm_config_selected: "",

    // currently selected arm config provided by
    // arms_config_provider
    arm_config: {
        filename: "",
        description: "",
        arm_parts: [],
    },

    // saved positions provided initially by saved_positions_provider
    // and updated by the UI.   This should be an array of objects like:
    // {
    //   "name": "some name",
    //   "description": "some description",
    //   "angles": [0, 90, 90, 90, 90, 90]
    // }
    saved_positions: [],

    subsystem_stats: {},
};

let __hub_state = { ...DEFAULT_HUB_STATE };

let hubStatePromises: ((value: any) => void)[] = [];
let onUpdateCallbacks: ((state: typeof DEFAULT_HUB_STATE) => void)[] = [];
let lastHubUpdate = Date.now();
let hubMonitor: NodeJS.Timeout | null = null;

export let webSocket: WebSocket | null = null;

export function connectToHub(state = DEFAULT_HUB_STATE) {
    try {
        setHubConnStatus("connecting");
        console.log(`connecting to central-hub at ${HUB_URL}`);

        webSocket = new WebSocket(HUB_URL);

        webSocket.addEventListener("open", function (event) {
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
                onConnError(state, e);
            }
            startHubMonitor();
        });

        webSocket.addEventListener("error", function (event) {
            console.error("got error from central-hub socket", event);
        });

        webSocket.addEventListener("close", function (event) {
            onConnError(state, event);
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
        onConnError(state, e);
    }
}

function startHubMonitor() {
    stopHubMonitor();
    hubMonitor = setInterval(() => {
        // if the socket is hung or there is no network,
        // the websocket will not error out until we send something
        webSocket!.send(JSON.stringify({ type: "ping" }));

        if (
            __hub_state.hubConnStatus === "online" &&
            Date.now() - lastHubUpdate > MIN_HUB_UPDATE_INTERVAL
        ) {
            setHubConnStatus("offline");
        }
    }, HUB_PING_INTERVAL);
}

function stopHubMonitor() {
    if (hubMonitor) {
        clearInterval(hubMonitor);
    }
}

// handler gets called with __hub_state
export function addHubStateUpdatedListener(handler: (state: typeof DEFAULT_HUB_STATE) => void) {
    onUpdateCallbacks.push(handler);
}

export function removeHubStateUpdatedListener(handler: (state: typeof DEFAULT_HUB_STATE) => void) {
    const index = onUpdateCallbacks.indexOf(handler);
    if (index !== -1) {
        onUpdateCallbacks.splice(index, 1);
    }
}

export function getLocalState() {
    return __hub_state;
}

export function getStateFromCentralHub() {
    const statePromise = new Promise<typeof DEFAULT_HUB_STATE>((resolve) =>
        hubStatePromises.push(resolve)
    );
    webSocket!.send(JSON.stringify({ type: "getState" }));
    return statePromise;
}

export function updateSharedState(newState: Partial<typeof DEFAULT_HUB_STATE>) {
    webSocket!.send(JSON.stringify({ type: "updateState", data: newState }));
}

function delayedConnectToHub(state: typeof DEFAULT_HUB_STATE) {
    setTimeout(() => {
        if (state.hubConnStatus === "offline") {
            connectToHub(state);
        }
    }, 5000);
}

function onConnError(state: typeof DEFAULT_HUB_STATE, e: Event | Error) {
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

function updateStateFromCentralHub(hubData: Partial<typeof DEFAULT_HUB_STATE>) {
    for (const [key, value] of Object.entries(hubData)) {
        // TODO : maybe merge the state with incoming.
        // State for any top level key must be whole
        (__hub_state as any)[key] = value;
    }
    emitUpdated();
}

function emitUpdated() {
    for (const callback of onUpdateCallbacks) {
        callback(__hub_state);
    }
}

export function logMessage(...args: any[]) {
    if (logMessages) {
        console.log(...args);
    }
}
