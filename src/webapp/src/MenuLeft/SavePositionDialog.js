// Dialog to save the current_angles to the saved_positions hubstate
//
import React, { useCallback, useState } from "react";

import { classnames as cx } from "../util/classNames";
import { sendHubStateUpdate } from "../util/hubMessages";
import st from "./SavePositionDialog.module.css";

export function SavePositionDialog({ hubState, isOpen, onClose }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    });

    const handleSave = useCallback((e) => {
        if (name === "") {
            alert("Please enter a name for the position");
            return;
        }
        const saved_positions = [
            ...hubState.saved_positions,
            {
                name,
                description,
                angles: hubState.current_angles,
            },
        ];

        sendHubStateUpdate({ saved_positions });
        onClose();
    });

    return (
        <div
            className={cx(st.backdrop, !isOpen && st.closed)}
            onClick={handleBackdropClick}
        >
            <div className={st.dialog}>
                <div className={st.close} onClick={onClose}>
                    X
                </div>
                <h3>Save Current Position</h3>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
                <div>
                    <button onClick={handleSave}>Save</button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
