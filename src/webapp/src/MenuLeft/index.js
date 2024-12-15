import React, { useCallback, useState } from "react";

import { classnames } from "../util/classNames";
import st from "./index.module.css";
import { BackButton } from "../components/icons/BackButton";

import { ArmConfig } from "./ArmConfig";

const BASE_NODE_NAME = "Menu Root";

const MenuLeft = ({ hubState }) => {
    const [itemIndexSelected, setItemIndexSelected] = useState(null);
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
    const items = [
        { name: "Arm Config", component: <ArmConfig hubState={hubState} /> },
        { name: "Position", component: <div>Position component here</div> },
        { name: "Sequence", component: <div>Sequence component here</div> },
    ];

    const menuName = isAtRootMenu
        ? BASE_NODE_NAME
        : items[itemIndexSelected].name;

    const handleMenuClick = useCallback((itemIndex) => {
        setItemIndexSelected(itemIndex);
    });

    const handleBackClick = useCallback(() => {
        setItemIndexSelected(null);
    });

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
            </div>
            <div className={st.componentContainer} style={componentStyle}>
                {itemIndexSelected != null &&
                    items[itemIndexSelected].component}
            </div>
        </div>
    );
};

export default MenuLeft;
