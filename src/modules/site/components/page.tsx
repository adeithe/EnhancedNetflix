import * as React from "react";

export interface IPageProps {
	className?: string;
	style?: React.CSSProperties;
	children?: React.ReactNode;
}

const Page: React.FunctionComponent<IPageProps> = ({ className = '', style = {},children }) => (
	<div className={`enhancement-dialog-content-wrapper ${className}`} style={style}>{children}</div>
);

export default Page;