// Menu left react component to add and show the saved positions in hubstate
import React, { useState, useCallback } from "react";

import { classnames as cx } from "../util/classNames";
import st from "./Position.module.css";
import { SavePositionDialog } from "./SavePositionDialog";
import { PositionMenu } from "./PositionMenu";

export function Position({ hubState }) {
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] = useState(null);

    const handleAddPosition = useCallback(() => {
        setIsSaveDialogOpen(true);
    });

    const handleSaveDialogClose = useCallback(() => {
        setIsSaveDialogOpen(false);
    });

    const handlePositionClick = useCallback((position) => {
        setSelectedPosition(position);
    });

    const handleUnselectPosition = useCallback((position) => {
        setSelectedPosition(null);
    });

    return (
        <>
            <div
                className={cx(st.container, selectedPosition && st.hasSelected)}
            >
                <a onClick={handleAddPosition}>Save Current Position</a>
                <div className={st.title}>Saved Positions</div>

                <div className={st.positionList}>
                    {hubState.saved_positions.map((position, index) => (
                        <PositionItem
                            key={index}
                            position={position}
                            isSelected={selectedPosition === position}
                            onClick={handlePositionClick}
                        />
                    ))}
                </div>
            </div>
            {selectedPosition && (
                <PositionMenu
                    position={selectedPosition}
                    onClose={handleUnselectPosition}
                />
            )}

            <SavePositionDialog
                isOpen={isSaveDialogOpen}
                onClose={handleSaveDialogClose}
                hubState={hubState}
            />
        </>
    );
}

function PositionItem({ position, isSelected, onClick }) {
    return (
        <div
            className={cx(st.positionItem, isSelected && st.selectedItem)}
            onClick={() => onClick(position)}
        >
            {position.name}
        </div>
    );
}
