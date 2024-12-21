// Dialog to save the current_angles to the saved_positions hubstate
//
import React, {
    useCallback,
    useState,
    useRef,
    useEffect,
    use,
    useMemo,
} from "react";
import { v4 as uuidv4 } from "uuid";

import { classnames as cx } from "../../util/classNames";
import { sendHubStateUpdate } from "../../util/hubMessages";

import st from "./SavePositionDialog.module.css";
import { Dialog } from "../../components/Dialog";

export function SavePositionDialog({
    hubState,
    existingPosition,
    isOpen,
    onClose,
}) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const focusRef = useRef();

    useEffect(() => {
        if (existingPosition) {
            setName(existingPosition.name);
            setDescription(existingPosition.description);
        }
    }, [existingPosition]);

    function savePosition(withAngles = false) {
        if (name === "") {
            alert("Please enter a name for the position");
            return;
        }
        const saved_positions = [...hubState.saved_positions];
        if (existingPosition) {
            const existingIndex = saved_positions.findIndex(
                (p) => p.uuid === existingPosition.uuid
            );
            saved_positions[existingIndex] = {
                ...existingPosition,
                name,
                description,
                angles: withAngles
                    ? hubState.current_angles
                    : existingPosition.angles,
            };
        } else {
            saved_positions.push({
                uuid: uuidv4(),
                name,
                description,
                angles: hubState.current_angles,
            });
        }
        sendHubStateUpdate({ saved_positions });
    }
    const handleSave = useCallback((withAngles) => {
        savePosition(withAngles);
        onClose();
    });

    const buttons = useMemo(() => (
        <>
            <button onClick={() => handleSave(false)}>Save</button>
            <button onClick={() => handleSave(true)}>
                Save w/ current angles
            </button>
            <button onClick={onClose}>Cancel</button>
        </>
    ));

    return (
        <Dialog
            title="Save Current Position"
            isOpen={isOpen}
            onClose={onClose}
            buttons={buttons}
        >
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
        </Dialog>
    );
}
