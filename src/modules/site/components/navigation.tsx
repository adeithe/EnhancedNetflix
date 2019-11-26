import * as React from "react";
import Scrollable from "./scrollable";
import {EnhancedNetflix} from "../../../";

interface INavigationProps {
	links: JSX.Element[];
	className?: string;
}

const Navigation: React.FunctionComponent<INavigationProps> = ({ links, className = '' }) => (
	<nav className={`enhancement-dialog-nav ${className}`}>
		<Scrollable className={'enhancement-dialog-nav-body enhancement-dialog-nav-scrollable'}>
			<div className={'enhancement-dialog-nav-links-wrapper'}>
				<ul className={'enhancement-dialog-nav-links'}>{links}</ul>
			</div>
		</Scrollable>
		<footer className={'enhancement-border-t'}>
			<div>Version {EnhancedNetflix.Instance.getManifest().version}</div>
			<div className={'alt-text'}>
				<a target={'_blank'} href={'https://patreon.com/Adeithe'} rel={'noopener noreferrer'}>Support on Patreon</a>
			</div>
		</footer>
	</nav>
);

export default Navigation;