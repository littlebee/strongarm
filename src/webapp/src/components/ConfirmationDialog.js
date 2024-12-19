import { Dialog } from "./Dialog";

import st from "./ConfirmationDialog.module.css";

export function ConfirmationDialog({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
}) {
    const buttons = (
        <>
            <button onClick={onConfirm}>Yes</button>
            <button onClick={onCancel}>Cancel</button>
        </>
    );
    return (
        <Dialog
            isOpen={isOpen}
            onClose={onCancel}
            title={title}
            buttons={buttons}
        >
            <div className={st.message}>{message}</div>
        </Dialog>
    );
}
