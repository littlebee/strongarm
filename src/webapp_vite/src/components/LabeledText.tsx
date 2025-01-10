import React from "react";

import st from "./LabeledText.module.css";

interface LabeledTextProps {
    label: string;
    children: React.ReactNode;
}

export function LabeledText({ label, children }: LabeledTextProps) {
    return (
        <div className={st.labeledText}>
            <div className={st.label}>{label}:</div>
            <div>{children}</div>
        </div>
    );
}
