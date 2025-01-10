import { LabeledText } from "./components/LabeledText";

import { classnames } from "./util/classNames";
import { IHubState } from "./util/hubState";
import st from "./Header.module.css";

interface HeaderProps {
    hubState: IHubState;
    isHubStateDialogOpen: boolean;
    onHubStateDialogOpen: () => void;
}

export function Header({
    hubState,
    isHubStateDialogOpen,
    onHubStateDialogOpen,
}: HeaderProps) {
    const dialogCls = classnames("wrap", st.header);
    const topLeftCls = classnames(
        "left-frame-top",
        "sidebar-buttons",
        st.leftFrameTop,
        {
            predicate: isHubStateDialogOpen,
            value: st.activeDialogTrigger,
        }
    );

    return (
        <div className={dialogCls}>
            <div className={topLeftCls} onClick={onHubStateDialogOpen}>
                Hub State
            </div>

            <div className="right-frame-top">
                <div className={`padded-1 flex-row`}>
                    <div className={st.rightFrameContent}>
                        <div className={`flex-row ${st.stats}`}>
                            <div className={st.statsColumn}>
                                <LabeledText label="hub status">
                                    {hubState.hubConnStatus}
                                </LabeledText>
                            </div>
                            {hubState.hubConnStatus === "online" && (
                                <>
                                    <div className={st.statsColumn}></div>
                                    <div className={st.statsColumn}></div>
                                </>
                            )}
                        </div>
                    </div>
                    <div className={st.title}>
                        <h1>Strongarm</h1>
                    </div>
                </div>
                <div className="top-corner-bg">
                    <div className="top-corner"></div>
                </div>
                <div className="bar-panel">
                    <div className="bar-1"></div>
                    <div className="bar-2"></div>
                    <div className="bar-3"></div>
                    <div className="bar-4">
                        <div className="bar-4-inside"></div>
                    </div>
                    <div className="bar-5"></div>
                </div>
            </div>
        </div>
    );
}
