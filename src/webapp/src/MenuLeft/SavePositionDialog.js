// Dialog to save the current_angles to the saved_positions hubstate
//
import React, { useCallback, useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

import { classnames as cx } from "../util/classNames";
import { sendHubStateUpdate } from "../util/hubMessages";
import st from "./SavePositionDialog.module.css";

export function SavePositionDialog({ hubState, isOpen, onClose }) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const focusRef = useRef();

    useEffect(() => {
        if (isOpen) {
            console.log("focusRef.current.focus()");
            focusRef.current.focus();
        }
    }, [isOpen, focusRef]);

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
                uuid: uuidv4(),
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
                <div className={st.header}>
                    <h4 className={st.dialogTitle}>Save Current Position</h4>
                    <div className={st.close} onClick={onClose}>
                        X
                    </div>
                </div>
                <div className={st.form}>
                    <div className={st.inputRow}>
                        <label>Name:</label>
                        <input
                            type="text"
                            value={name}
                            ref={focusRef}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
                    <div className={st.inputRow}>
                        <label>Description:</label>
                        <textarea
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>
                <div className={st.buttons}>
                    <button name="submit" onClick={handleSave}>
                        Save
                    </button>
                    <button onClick={onClose}>Cancel</button>
                </div>
            </div>
        </div>
    );
}
