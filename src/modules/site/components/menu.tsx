import * as React from "react";
import {MemoryRouter, Switch, Route, Redirect} from "react-router-dom";
import Draggable, {DraggableEvent} from "react-draggable";
import Header, {HeaderClass} from "./header";
import Navigation from "./navigation";
import Scrollable from "./scrollable";
import {Website} from "../";

class Menu extends React.Component {
	state = { visible: false, maximized: false };

	toggle() {
		this.setState({ visible: !this.state.visible });
	}

	onDragStart(e: DraggableEvent): boolean {
		if(this.state.maximized)
			return false;
		const elem = (e.target as HTMLElement);
		if(!elem.classList.contains(HeaderClass) && !elem.parentElement.classList.contains(HeaderClass))
			return false;
		return true;
	}

	render() {
		let home = null;
		const components = Website.Instance.components;
		const routes: JSX.Element[] = [];
		for(const k in components) {
			const component = components[k];
			home = component.isDefault? component.path : home;
			routes.push(
				<Route path={component.path} exact={true} render={(props) => (
					Website.Instance.getComponent((props.match.path || home).substr(1), props)
				)} />
			);
		}
		if(routes !== null)
			routes.push(<Route path={'/'} exact={true}><Redirect to={home} /></Route>);
		return(
			<>
				<div className={'dialog-bounds'} />
				<Draggable handle={`.${HeaderClass}`} onStart={this.onDragStart.bind(this)} bounds={'#enhanced-netflix>div.dialog-bounds'}>
					<div className={`enhancement-dialog enhancement-main-menu ${this.state.visible? 'is_visible' : ''} ${this.state.maximized? 'maximized' : ''}`}>
						<Header className={'enhancement-border-b'} toggle={this.toggle.bind(this)} />
						<section className={'enhancement-dialog-body'}>
							<MemoryRouter>
								<Navigation className={'enhancement-border-r'} links={Array.from(Website.Instance.components, k => k.nav)} />
								<Scrollable className={'enhancement-dialog-block'}>
									<div className={'enhancement-dialog-content'}>
										<Switch>{routes}</Switch>
									</div>
								</Scrollable>
							</MemoryRouter>
						</section>
					</div>
				</Draggable>
			</>
		);
	}
}

export default Menu;