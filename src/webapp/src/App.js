import React, { useState, useEffect } from "react";

import * as c from "./constants";
import {
    DEFAULT_HUB_STATE,
    connectToHub,
    addHubStateUpdatedListener,
    removeHubStateUpdatedListener,
    giveTreat,
} from "./hub-state";

import { Header } from "./Header";
import { HubStateDialog } from "./HubStateDialog";

import "./lcars.css";
import "./App.css";
import { ArmView } from "./ArmView";

function App() {
    const [hubState, setHubState] = useState(DEFAULT_HUB_STATE);
    const [isHubStateDialogOpen, setIsHubStateDialogOpen] = useState(false);

    useEffect(() => {
        addHubStateUpdatedListener(handleHubStateUpdated);
        connectToHub();

        return () => removeHubStateUpdatedListener(handleHubStateUpdated);
    }, []);

    const handleHubStateUpdated = (newState) => {
        setHubState({ ...newState });
    };

    const handleResetAllAnglesClick = () => {};

    return (
        <div>
            <Header
                hubState={hubState}
                isHubStateDialogOpen={isHubStateDialogOpen}
                onHubStateDialogOpen={() => setIsHubStateDialogOpen(true)}
            />
            <div className="wrap">
                <div className="left-frame" id="gap">
                    <div className="sidebar-buttons">
                        <a onClick={handleResetAllAnglesClick}>
                            Reset All Angles
                        </a>
                    </div>
                    <div className="panel-3"></div>
                </div>
                <div className="right-frame">
                    <div className="bar-panel">
                        <div className="bar-6"></div>
                        <div className="bar-7"></div>
                        <div className="bar-8"></div>
                        <div className="bar-9">
                            <div className="bar-9-inside"></div>
                        </div>
                        <div className="bar-10"></div>
                    </div>
                    <div className="corner-bg">
                        <div className="corner"></div>
                    </div>
                    <div className="content">
                        <ArmView hubState={hubState} />
                    </div>
                </div>
            </div>
            <HubStateDialog
                hubState={hubState}
                isOpen={isHubStateDialogOpen}
                onClose={() => setIsHubStateDialogOpen(false)}
            />
        </div>
    );
}

export default App;
