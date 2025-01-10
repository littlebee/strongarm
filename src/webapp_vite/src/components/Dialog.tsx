import React, { useCallback, useRef, useEffect } from "react";

import { classnames as cx } from "../util/classNames";
import st from "./Dialog.module.css";

interface DialogProps {
    title: string;
    isOpen: boolean;
    onClose: () => void;
    buttons: React.ReactNode;
    children: React.ReactNode;
}

export function Dialog({
    title,
    isOpen,
    onClose,
    buttons,
    children,
}: DialogProps) {
    const dialogRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            console.log("focusRef.current.focus()");
            dialogRef.current
                ?.querySelector(":first-child input,button,textarea")
                // @ts-expect-error html input, button, textarea most certainly have a focus method
                ?.focus();
        }
    }, [isOpen, dialogRef]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                e.stopPropagation();
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
        } else {
            document.removeEventListener("keydown", handleKeyDown);
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === e.currentTarget) {
                onClose();
            }
        },
        [onClose]
    );

    return (
        <div
            className={cx(st.backdrop, !isOpen && st.closed)}
            onClick={handleBackdropClick}
            ref={dialogRef}
        >
            <div className={st.dialog}>
                <div className={st.header}>
                    <h4 className={st.dialogTitle}>{title}</h4>
                    <div className={st.close} onClick={onClose}>
                        X
                    </div>
                </div>
                {children}
                <div className={st.buttons}>{buttons}</div>
            </div>
        </div>
    );
}
