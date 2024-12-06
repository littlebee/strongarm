import React, { useEffect, useRef, useState } from "react";

import { classnames } from "../util/classNames";
import st from "./ButtonFaderCombo.module.css";

const MIN_FADE_PCT = 0;
const MAX_FADE_PCT = 1;

export function ButtonFaderCombo({
  className,
  children,
  isSelected,
  fadePercent,
  fadeMessage,
  onClick,
  onFade,
}) {
  const [mouseDownX, setMouseDownX] = useState(null);
  const [isFading, setIsFading] = useState(false);
  const buttonRef = useRef();

  const handleMouseDown = (e) => {
    if (isSelected) {
      setMouseDownX(e.clientX);
    } else {
      onClick(e);
    }
  };

  const handleTouchStart = (e) => {
    if (isSelected && e.touches && e.touches.length > 0) {
      setMouseDownX(e.touches[0].clientX);
    }
  };

  const handleMouseMove = (e) => {
    if (mouseDownX === null) {
      // unrelated mousemove
      return;
    }
    setIsFading(true);
    onFade(computeFadePercent(e.clientX));
  };

  const handleTouchMove = (e) => {
    if (isSelected && e.touches && e.touches.length > 0) {
      handleMouseMove({ clientX: e.touches[0].clientX });
    }
  };

  const handleMouseUp = (e) => {
    if (mouseDownX === null) {
      // unrelated mouseup
      return;
    }

    if (!isFading && isSelected && Math.abs(e.clientX - mouseDownX) < 10) {
      onClick(e);
    }
    setMouseDownX(null);
    setIsFading(false);
  };

  const faderCls = classnames(className, st.fader, {
    predicate: isSelected,
    value: st.faderSelected,
  });

  const faderStyle = {
    width: `${Math.min(Math.max(fadePercent, 0), 1) * 100}%`,
  };

  return (
    <div className={st.wrapper} ref={buttonRef}>
      {isFading && fadeMessage && (
        <div className={st.fadeMessage}>{fadeMessage}</div>
      )}

      <div
        className={st.button}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div className={faderCls} style={faderStyle} />
        <div className={st.content}>{children}</div>
      </div>
    </div>
  );

  function computeFadePercent(clientX) {
    if (!buttonRef.current) {
      return fadePercent;
    }
    const buttonLeft = buttonRef.current.offsetLeft;
    const buttonWidth = buttonRef.current.offsetWidth;
    const buttonRight = buttonLeft + buttonWidth;

    if (clientX < buttonLeft) {
      return MIN_FADE_PCT;
    }
    if (clientX > buttonRight) {
      return MAX_FADE_PCT;
    }

    const relativeX = clientX - buttonLeft;

    return relativeX / buttonWidth;
  }
}
