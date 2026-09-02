import React from "react";

export type BtnProps = {
    label: string;
    onPress?: () => void;
    disabled?: boolean;
    loading?: boolean;
    style?: React.CSSProperties;
}