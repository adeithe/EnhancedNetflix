import * as React from "react";
import {Link} from "react-router-dom";
import {Website} from "../";

interface ILinkProps {
	to: string;
	name: string;
	isActive?: boolean;
}

class NavLink extends React.PureComponent<ILinkProps> {
	private name: string;

	state = { active: false };

	constructor(props: ILinkProps) {
		super(props);
		this.name = NavLink.getName(props.to, props.name);
	}

	static getName(path: string, name?: string): string {
		let __name;
		if(!name) {
			__name = path.replace('/enhanced-netflix/', '').replace(/[^A-Za-z0-9\-]/g, '');
			__name = __name.substr(0, 1).toUpperCase() + __name.substr(1).replace(/([A-Z])/g, ' $1').trim();
		} else
			__name = name;
		return __name;
	}

	componentDidMount() {
		if(this.props.isActive)
			this.setActive();
		Website.Instance.addListener(':tab-changed', this.onTabChanged.bind(this));
	}

	componentWillUnmount() { Website.Instance.removeListener(':tab-changed', this.onTabChanged.bind(this)); }

	onTabChanged(path: string) {
		if(path === this.props.to) {
			if(!this.state.active)
				this.setActive(true, false);
			return;
		}
		this.setActive(false, false);
	}

	setActive(active: boolean = true, emit: boolean = true) {
		if(typeof(active) !== typeof(true))
			active = true;
		this.setState({ active });
		if(active && emit)
			Website.Instance.emit(':tab-changed', this.props.to);
	}

	render() {
		return(
			<li className={`enhancement-nav-link ${this.state.active? 'active' : ''}`}>
				<Link to={this.props.to.toLowerCase()} onClick={(e: MouseEvent) => {
					if(e.button === 0)
						this.setActive();
				}}>
					<span>{this.name}</span>
				</Link>
			</li>
		);
	}
}

export default NavLink;