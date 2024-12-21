// Menu left react component to add and show the saved positions in hubstate
import React, { useState, useCallback, useMemo } from "react";

import { classnames as cx } from "../../util/classNames";
import st from "./index.module.css";
import { SavePositionDialog } from "./SavePositionDialog";
import { PositionMenu } from "./PositionMenu";
import { anglesCloseEnough } from "../../util/angle_utils";

export function SavedPositions({ hubState }) {
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
                            hubState={hubState}
                            position={position}
                            onClick={handlePositionClick}
                        />
                    ))}
                </div>
            </div>
            {selectedPosition && (
                <PositionMenu
                    hubState={hubState}
                    positionId={selectedPosition.uuid}
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

function PositionItem({ hubState, position, onClick }) {
    const closeEnough = useMemo(
        () => anglesCloseEnough(hubState.set_angles, position.angles),
        [hubState.set_angles, position.angles]
    );

    return (
        <a
            className={cx("secondary", closeEnough && "selected")}
            onClick={() => onClick(position)}
        >
            {position.name}
        </a>
    );
}
