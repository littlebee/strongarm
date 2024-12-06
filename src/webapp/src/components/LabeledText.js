import React from "react";

import { classnames } from "../util/classNames";
import st from "./LabeledText.module.css";

export function LabeledText({ label, children, isSelected, onClick }) {
  return (
    <div className={st.labeledText}>
      <div className={st.label}>{label}:</div>
      <div>{children}</div>
    </div>
  );
}
