import React, { useCallback, useState, useMemo } from "react";

import { classnames } from "../util/classNames";
import st from "./index.module.css";
import { BackButton } from "../components/icons/BackButton";

import { ArmConfig } from "./ArmConfig";
import { SavedPositions } from "./SavedPositions";
import { sendSetAngles } from "../util/hubMessages";

const BASE_NODE_NAME = "Menu Root";

const MenuLeft = ({ hubState }) => {
    const [itemIndexSelected, setItemIndexSelected] = useState<number | null>(null);
    const isAtRootMenu = itemIndexSelected === null;

    /*
        // the name of the menu item that will be displayed
        name: string

        // the action to take when the item is clicked
        action: string?

        // the component to render in place of the menu items when when
        // the item is clicked
        component: React.Component?
    */
    const items = useMemo(
        () => [
            {
                name: "Arm Config",
                component: <ArmConfig hubState={hubState} />,
            },
            {
                name: "Saved Positions",
                component: <SavedPositions hubState={hubState} />,
            },
            { name: "Sequence", component: <div>Sequence component here</div> },
        ],
        [hubState]
    );

    const movablePartCount = useMemo(
        () =>
            hubState.arm_config.arm_parts.reduce(
                (acc: number, part: { movable: boolean }) => (part.movable ? acc + 1 : acc),
                0
            ),
        [hubState.arm_config.arm_parts]
    );

    const menuName = isAtRootMenu
        ? BASE_NODE_NAME
        : items[itemIndexSelected].name;

    const handleMenuClick = useCallback((itemIndex: number) => {
        setItemIndexSelected(itemIndex);
    }, []);

    const handleBackClick = useCallback(() => {
        setItemIndexSelected(null);
    }, []);

    const handleResetClick = useCallback(() => {
        sendSetAngles(Array(movablePartCount).fill(90));
    }, [movablePartCount]);

    const buttonsStyle = isAtRootMenu ? { left: 0 } : { left: "-100%" };
    const componentStyle = isAtRootMenu ? { left: "100%" } : { left: 0 };

    return (
        <div className={st.menuLeft}>
            <h3 className={st.topControls}>
                <div>
                    {!isAtRootMenu && <BackButton onClick={handleBackClick} />}
                </div>
                <div className={st.menuName}>{menuName}</div>
            </h3>
            <div className={st.menuButtons} style={buttonsStyle}>
                {items.map((item, index) => (
                    <a key={index} onClick={() => handleMenuClick(index)}>
                        {item.name}
                    </a>
                ))}
                <div className={st.vspacer} />
                <a onClick={handleResetClick}>Reset All Angles</a>
            </div>
            <div className={st.componentContainer} style={componentStyle}>
                {itemIndexSelected != null &&
                    items[itemIndexSelected].component}
            </div>
        </div>
    );
};

export default MenuLeft;
