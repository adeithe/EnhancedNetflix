import * as React from "react";

interface ITextProps {
	style?: React.CSSProperties;
	children: React.ReactNode;
}

const Right: React.FunctionComponent<ITextProps> = ({ style, children }) => (<div style={Object.assign({ textAlign: 'right' }, style)}>{children}</div>);
const Center: React.FunctionComponent<ITextProps> = ({ style, children }) => (<div style={Object.assign({ textAlign: 'center' }, style)}>{children}</div>);
const Left: React.FunctionComponent<ITextProps> = ({ style, children }) => (<div style={Object.assign({ textAlign: 'left' }, style)}>{children}</div>);

export default {Right, Center, Left};