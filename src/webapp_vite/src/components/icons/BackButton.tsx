import React from "react";
import st from "./BackButton.module.css";

interface BackButtonProps {
    onClick: () => void;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick }) => {
    return (
        <button
            className={st.backButton}
            onClick={onClick}
            title="Back to root menu"
        >
            <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M10 19L3 12L10 5"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <circle
                    cx="15"
                    cy="12"
                    r="3"
                    stroke="currentColor"
                    strokeWidth="2"
                    fill="none"
                />
            </svg>
        </button>
    );
};
