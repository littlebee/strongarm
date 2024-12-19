// Dialog to save the current_angles to the saved_positions hubstate
//
import React, { useCallback, useState, useRef, useEffect, use } from "react";
import { v4 as uuidv4 } from "uuid";

import { classnames as cx } from "../util/classNames";
import st from "./Dialog.module.css";

export function Dialog({ title, isOpen, onClose, buttons, children }) {
    const dialogRef = useRef();

    useEffect(() => {
        if (isOpen) {
            console.log("focusRef.current.focus()");
            dialogRef.current
                .querySelector(":first-child input,button,textarea")
                ?.focus();
        }
    }, [isOpen, dialogRef]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (e.key === "Escape") {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
        } else {
            document.removeEventListener("keydown", handleKeyDown);
        }
    }, [isOpen, onClose]);

    const handleBackdropClick = useCallback((e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    });

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
