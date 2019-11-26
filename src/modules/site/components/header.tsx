import * as React from "react";

interface IHeaderProps {
	className?: string;
	toggle?(): void;
}

const HeaderClass = 'enhancement-dialog-header';
const Header: React.FunctionComponent<IHeaderProps> = ({ className = '', toggle }) => (
	<header className={`${HeaderClass} ${className}`}>
		<h3>EnhancedNetflix</h3>
		<div className={'spacer'} />
		<div className={'controls'}>
			<button className={'icon-close'} onClick={toggle} />
		</div>
	</header>
);

export {HeaderClass};
export default Header;