import React from "react";
import { classnames as cx } from "../util/classNames";

import st from "./PositionMenu.module.css";

export function PositionMenu({ position, onClose }) {
    return (
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
            <a>Move to position</a>
            <a>Edit</a>
            <a>Delete</a>
        </div>
    );
}
