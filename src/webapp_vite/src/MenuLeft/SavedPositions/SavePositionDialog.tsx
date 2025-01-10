import { useCallback, useState, useRef, useEffect, useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

import { sendHubStateUpdate } from "../../util/hubMessages";
import { IHubState, ISavedPosition } from "../../util/hubState";

import st from "./SavePositionDialog.module.css";
import { Dialog } from "../../components/Dialog";

interface SavePositionDialogProps {
    hubState: IHubState;
    existingPosition?: ISavedPosition;
    isOpen: boolean;
    onClose: () => void;
}

export function SavePositionDialog({
    hubState,
    existingPosition,
    isOpen,
    onClose,
}: SavePositionDialogProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const focusRef = useRef<HTMLInputElement>(null);

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
    const handleSave = useCallback(
        (withAngles: boolean) => {
            savePosition(withAngles);
            onClose();
        },
        [name, description, existingPosition, hubState, onClose]
    );

    const buttons = useMemo(
        () => (
            <>
                <button onClick={() => handleSave(false)}>Save</button>
                <button onClick={() => handleSave(true)}>
                    Save w/ current angles
                </button>
                <button onClick={onClose}>Cancel</button>
            </>
        ),
        [handleSave, onClose]
    );

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
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </div>
        </Dialog>
    );
}
