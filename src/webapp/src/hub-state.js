import "react";

const urlParams = new URLSearchParams(window.location.search);
const debugThings = urlParams.get("debug")?.split(",") || [];
const logMessages = debugThings.indexOf("messages") >= 0;

// How often to check if hub is really still alive
const HUB_PING_INTERVAL = 1000;
// with us pinging every 1000ms, there should
// never be a lapse of more than 1500 between
// messages from hub.  Otherwise, we show "offline"
const MIN_HUB_UPDATE_INTERVAL = 1500;

export const HUB_PORT = process.env.HUB_PORT || 5800;

export const HUB_HOST =
    !process.env.NODE_ENV || process.env.NODE_ENV === "development"
        ? `localhost:${HUB_PORT}`
        : `${window.location.hostname}:${HUB_PORT}`;

export const HUB_URL = `ws://${HUB_HOST}/ws`;

export const DEFAULT_HUB_STATE = {
    // this is for the UI only
    hubConnStatus: "offline",

    // the keys below are shared from central hub.  See shared_state.py

    // provided by central_hub/
    hub_stats: { state_updates_recv: 0 },
    //last requested angles
    set_angles: [],
    // actual angles last reported by servos
    current_angles: [],
    // centralized config
    config: { min_servo_angle: 0, max_servo_angle: 180 },

    subsystem_stats: {},
};

let __hub_state = { ...DEFAULT_HUB_STATE };

let hubStatePromises = [];
let onUpdateCallbacks = [];
let lastHubUpdate = Date.now();
let hubMonitor = null;

export let webSocket = null;

export function connectToHub(state = DEFAULT_HUB_STATE) {
    try {
        setHubConnStatus("connecting");
        console.log(`connecting to central-hub at ${HUB_URL}`);

        webSocket = new WebSocket(HUB_URL);

        webSocket.addEventListener("open", function (event) {
            lastHubUpdate = Date.now();

            try {
                webSocket.send(JSON.stringify({ type: "getState" }));
                webSocket.send(
                    JSON.stringify({ type: "identity", data: "webapp" })
                );
                webSocket.send(
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
            log("got message from central-hub", event.data);
            lastHubUpdate = Date.now();
            const message = JSON.parse(event.data);
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
        webSocket.send(JSON.stringify({ type: "ping" }));

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
export function addHubStateUpdatedListener(handler) {
    onUpdateCallbacks.push(handler);
}

export function removeHubStateUpdatedListener(handler) {
    const index = onUpdateCallbacks.indexOf(item);
    if (index !== -1) {
        onUpdateCallbacks.splice(index, 1);
    }
}

export function getLocalState() {
    return __hub_state;
}

export function getStateFromCentralHub() {
    const statePromise = new Promise((resolve) =>
        hubStatePromises.push(resolve)
    );
    webSocket.send(JSON.stringify({ type: "getState" }));
    return statePromise;
}

export function updateSharedState(newState) {
    webSocket.send(JSON.stringify({ type: "updateState", data: newState }));
}

export function sendThrottles(leftThrottle, rightThrottle) {
    console.log("sending throttles", {
        leftThrottle,
        rightThrottle,
    });

    webSocket.send(
        JSON.stringify({
            type: "updateState",
            data: {
                throttles: {
                    left: leftThrottle,
                    right: rightThrottle,
                },
            },
        })
    );
}

export function giveTreat() {
    webSocket.send(
        JSON.stringify({
            type: "updateState",
            data: {
                feeder: {
                    requested_at: Date.now(),
                },
            },
        })
    );
}

function delayedConnectToHub(state) {
    setTimeout(() => {
        if (state.hubConnStatus === "offline") {
            connectToHub(state);
        }
    }, 5000);
}

function onConnError(state, e) {
    console.error(
        "got close message from central-hub socket. will attempt to reconnnect in 5 seconds",
        e
    );
    stopHubMonitor();
    setHubConnStatus("offline");
    delayedConnectToHub(state);
}

// not exported, should only be called from connectToHub
function setHubConnStatus(newStatus) {
    log("setting conn status", newStatus);
    __hub_state.hubConnStatus = newStatus;
    emitUpdated();
}

function updateStateFromCentralHub(hubData) {
    for (const [key, value] of Object.entries(hubData)) {
        log("got hub state update", key, value);
        // TODO : unless we merge the state with incoming
        // state for any top level key must be whole
        __hub_state[key] = value;
    }
    emitUpdated();
}

function emitUpdated() {
    for (const callback of onUpdateCallbacks) {
        callback(__hub_state);
    }
}

function log(...args) {
    if (logMessages) {
        console.log(...args);
    }
}
