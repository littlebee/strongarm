import React from "react";

import { classnames } from "../util/classNames";
import st from "./LabeledText.module.css";

interface LabeledTextProps {
  label: string;
  children: React.ReactNode;
  isSelected?: boolean;
  onClick?: () => void;
}

export function LabeledText({ label, children, isSelected, onClick }: LabeledTextProps) {
  return (
    <div className={st.labeledText}>
      <div className={st.label}>{label}:</div>
      <div>{children}</div>
    </div>
  );
}
