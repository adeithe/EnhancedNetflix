import * as React from "react";

interface IGridProps {
	className?: string;
	children: React.ReactNode;
}

const MD_12: React.FunctionComponent<IGridProps> = ({ className = '', children }) => (<div className={`grid-item grid-md-12 ${className}`}>{children}</div>);
const MD_9: React.FunctionComponent<IGridProps> = ({ className = '', children }) => (<div className={`grid-item grid-md-9 ${className}`}>{children}</div>);
const MD_6: React.FunctionComponent<IGridProps> = ({ className = '', children }) => (<div className={`grid-item grid-md-6 ${className}`}>{children}</div>);
const MD_3: React.FunctionComponent<IGridProps> = ({ className = '', children }) => (<div className={`grid-item grid-md-3 ${className}`}>{children}</div>);

const GridContainer: React.FunctionComponent<IGridProps> = ({ className = '', children }) => (<div className={`grid-container ${className}`}>{children}</div>);

export {GridContainer};
export default {MD_12, MD_9, MD_6, MD_3};