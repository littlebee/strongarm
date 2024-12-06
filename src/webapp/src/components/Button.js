import React from "react";

import { classnames } from "../util/classNames";
import st from "./Button.module.css";

export function Button({ className, children, isSelected, onClick }) {
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    onClick(e);
  };

  const buttonCls = classnames(className, "button", st.button, {
    predicate: isSelected,
    value: st.buttonSelected,
  });
  return (
    <div className={buttonCls} onClick={handleClick}>
      <a onClick={handleClick}>{children}</a>
    </div>
  );
}
