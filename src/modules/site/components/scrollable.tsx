import * as React from "react";

interface IProps {
	className?: string;
	style?: React.CSSProperties;
	children: React.ReactNode;
}

const Scrollable: React.FunctionComponent<IProps> = ({ className = '', style={}, children }) => (
	<div className={`${className} scrollable`} style={style}>{children}</div>
);

export default Scrollable;