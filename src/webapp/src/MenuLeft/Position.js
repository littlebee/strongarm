// Menu left react component to add and show the saved positions in hubstate
import React, { useState, useCallback } from "react";

import st from "./Position.module.css";
import { SavePositionDialog } from "./SavePositionDialog";

export function Position({ hubState }) {
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

    const handleAddPosition = useCallback(() => {
        setIsSaveDialogOpen(true);
    });

    const handleSaveDialogClose = useCallback(() => {
        setIsSaveDialogOpen(false);
    });

    return (
        <>
            <div className={st.container}>
                <a onClick={handleAddPosition}>Add Current Position</a>
                <div className={st.title}>Saved Positions</div>
                <div className={st.positionList}>
                    {hubState.saved_positions.map((position, index) => (
                        <div key={index} className={st.positionItem}>
                            <div>{position.name}</div>
                            <div>{position.description}</div>
                            <div>{position.angles.join(", ")}</div>
                        </div>
                    ))}
                </div>
            </div>
            <SavePositionDialog
                isOpen={isSaveDialogOpen}
                onClose={handleSaveDialogClose}
                hubState={hubState}
            />
        </>
    );
}
