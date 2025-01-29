"use client";

import { CSSProperties } from "react";
import BounceLoader from "react-spinners/BounceLoader";

const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
};

type BlockUiProps = {
    isActive: boolean;
};

const BlockUi = (props: BlockUiProps) => {
    if (!props.isActive) return null; // Render nothing if not active

    return (
        <div style={overlayStyle}>
            <BounceLoader
                color="#2fa593"
                loading={props.isActive}
                cssOverride={override}
                size={150}
                aria-label="Loading Spinner"
                data-testid="loader"
            />
        </div>
    );
};

export default BlockUi;

const overlayStyle: CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
};
