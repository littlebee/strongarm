import { useCallback, useMemo, useState } from "react";

import { classnames as cx } from "../../util/classNames";
import { sendHubStateUpdate, sendSetAngles } from "../../util/hubMessages";

import st from "./PositionMenu.module.css";
import { SavePositionDialog } from "./SavePositionDialog";
import { ConfirmationDialog } from "../../components/ConfirmationDialog";
import { anglesCloseEnough } from "../../util/angle_utils";
import { IHubState } from "../../util/hubState";

interface PositionMenuProps {
    hubState: IHubState;
    positionId: string;
    onClose: () => void;
}

export function PositionMenu({
    hubState,
    positionId,
    onClose,
}: PositionMenuProps) {
    const position = useMemo(
        () => hubState.saved_positions.find((p) => p.uuid === positionId),
        [hubState.saved_positions, positionId]
    );

    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] =
        useState(false);

    const closeEnough = useMemo(
        () => anglesCloseEnough(hubState.set_angles, position?.angles || []),
        [hubState.set_angles, position?.angles]
    );

    const handleMoveToPosition = useCallback(() => {
        if (position) {
            sendSetAngles(position.angles);
            onClose();
        }
    }, [position, onClose]);

    const handleEditPosition = useCallback(() => {
        setIsSaveDialogOpen(true);
    }, []);

    const handleSaveDialogClose = useCallback(() => {
        setIsSaveDialogOpen(false);
    }, []);

    const handleDeleteClick = useCallback(() => {
        setIsDeleteConfirmationOpen(true);
    }, []);

    const handleDeleteConfirm = useCallback(() => {
        if (position) {
            const saved_positions = hubState.saved_positions.filter(
                (p) => p.uuid !== position.uuid
            );
            sendHubStateUpdate({ saved_positions });
            onClose();
        }
    }, [hubState.saved_positions, position, onClose]);

    const handleConfirmCancel = useCallback(() => {
        setIsDeleteConfirmationOpen(false);
    }, []);

    return !position ? null : (
        <>
            <div className={st.container}>
                <div className={st.header}>
                    <div className={st.title}>
                        <div className={st.close} onClick={onClose}>
                            X
                        </div>
                        <div className={st.name}>{position.name}</div>
                    </div>
                    <div className={cx(st.name, st.description)}>
                        {position.description}
                    </div>
                </div>
                <a
                    className={closeEnough ? "selected disabled" : ""}
                    onClick={handleMoveToPosition}
                >
                    Move to position
                </a>
                <a onClick={handleEditPosition}>Edit</a>
                <a onClick={handleDeleteClick}>Delete</a>
            </div>
            <SavePositionDialog
                hubState={hubState}
                existingPosition={position}
                isOpen={isSaveDialogOpen}
                onClose={handleSaveDialogClose}
            />
            <ConfirmationDialog
                isOpen={isDeleteConfirmationOpen}
                title="Delete Saved Position"
                message={`Are you sure you want to delete '${position.name}'?`}
                onConfirm={handleDeleteConfirm}
                onCancel={handleConfirmCancel}
            />
        </>
    );
}
