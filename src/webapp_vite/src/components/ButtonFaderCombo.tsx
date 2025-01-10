import React, { useEffect, useRef, useState } from "react";

import { classnames } from "../util/classNames";
import st from "./ButtonFaderCombo.module.css";

const MIN_FADE_PCT = 0;
const MAX_FADE_PCT = 1;

interface ButtonFaderComboProps {
    className?: string;
    children: React.ReactNode;
    isSelected: boolean;
    fadePercent: number;
    fadeMessage?: string;
    onClick: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
    onFade: (fadePercent: number) => void;
}

export function ButtonFaderCombo({
    className,
    children,
    isSelected,
    fadePercent,
    fadeMessage,
    onClick,
    onFade,
}: ButtonFaderComboProps) {
    const [mouseDownX, setMouseDownX] = useState<number | null>(null);
    const [isFading, setIsFading] = useState(false);
    const buttonRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        if (isSelected) {
            setMouseDownX(e.clientX);
        } else {
            onClick(e);
        }
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        if (isSelected && e.touches && e.touches.length > 0) {
            setMouseDownX(e.touches[0].clientX);
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (mouseDownX === null) {
            // unrelated mousemove
            return;
        }
        setIsFading(true);
        onFade(computeFadePercent(e.clientX));
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        if (isSelected && e.touches && e.touches.length > 0) {
            handleMouseMove({ clientX: e.touches[0].clientX } as MouseEvent);
        }
    };

    const handleMouseUp = (e: MouseEvent) => {
        if (mouseDownX === null) {
            // unrelated mouseup
            return;
        }

        if (!isFading && isSelected && Math.abs(e.clientX - mouseDownX) < 10) {
            onClick(
                e as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>
            );
        }
        setMouseDownX(null);
        setIsFading(false);
    };

    const handleMouseLeave = (
        e: React.MouseEvent<HTMLDivElement, MouseEvent>
    ) => {
        handleMouseUp(e as unknown as MouseEvent);
    };

    const faderCls = classnames(
        className,
        st.fader,
        isSelected && st.faderSelected
    );

    const faderStyle = {
        width: `${Math.min(Math.max(fadePercent, 0), 1) * 100}%`,
    };

    useEffect(() => {
        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [mouseDownX, isFading]);

    return (
        <div className={st.wrapper} ref={buttonRef}>
            {isFading && fadeMessage && (
                <div className={st.fadeMessage}>{fadeMessage}</div>
            )}

            <div
                className={st.button}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onMouseLeave={handleMouseLeave}
            >
                <div className={faderCls} style={faderStyle} />
                <div className={st.content}>{children}</div>
            </div>
        </div>
    );

    function computeFadePercent(clientX: number) {
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
