import { useState, useCallback, useMemo } from "react";

import { classnames as cx } from "../../util/classNames";
import st from "./index.module.css";
import { SavePositionDialog } from "./SavePositionDialog";
import { PositionMenu } from "./PositionMenu";
import { anglesCloseEnough } from "../../util/angle_utils";
import { IHubState, ISavedPosition } from "../../util/hubState";

interface SavedPositionsProps {
    hubState: IHubState;
}

export function SavedPositions({ hubState }: SavedPositionsProps) {
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [selectedPosition, setSelectedPosition] =
        useState<ISavedPosition | null>(null);

    const handleAddPosition = useCallback(() => {
        setIsSaveDialogOpen(true);
    }, []);

    const handleSaveDialogClose = useCallback(() => {
        setIsSaveDialogOpen(false);
    }, []);

    const handlePositionClick = useCallback((position: ISavedPosition) => {
        setSelectedPosition(position);
    }, []);

    const handleUnselectPosition = useCallback(() => {
        setSelectedPosition(null);
    }, []);

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

interface PositionItemProps {
    hubState: IHubState;
    position: ISavedPosition;
    onClick: (position: ISavedPosition) => void;
}

function PositionItem({ hubState, position, onClick }: PositionItemProps) {
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
