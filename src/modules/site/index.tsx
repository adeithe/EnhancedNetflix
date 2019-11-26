import * as React from "react";
import * as ReactDOM from "react-dom";

import Logger from "../../util/logger";
import Module from "../../util/module";
import Observer from "../../util/observer";
import PageModule from "../../util/page";

import * as Pages from "./modules";

import NavLink from "./components/nav-link";
import Menu from "./components/menu";
import Launcher from "./components/button";

import "../../sass/dialog.scss";
import "../../sass/components.scss";

export interface INavItem {
	isDefault: boolean;
	path: string;
	nav: React.ReactElement<NavLink>;
	page: PageModule;
}

export interface LocationData {
	href: string;
	path: string;
	args: { [key: string]: string | boolean };
}

export class Website extends Module {
	public static Instance: Website;
	private static Location: LocationData;

	private __logger: Logger;
	private __observer: Observer;
	private __initialized: boolean;
	private __container: HTMLDivElement;
	private __menu: Menu;
	private __components: INavItem[] = [];

	async onLoad() {
		Website.Instance = this;
		this.__logger = this.getCore().getLogger().get('site');
		this.__observer = new Observer(this.onMutation.bind(this));
		this.__container = document.createElement('div');
		this.__container.id = 'enhanced-netflix';
		document.body.appendChild(this.__container);
	}

	async onEnable() {
		for(const k in Pages.default) {
			const Page = new Pages.default[k]();
			this.addPage(Page.path || k, Page);
		}
		this.getLogger().info(`Loaded renderers for ${this.components.length} enhancement pages.`);
		ReactDOM.render(<Menu ref={ref => this.__menu = ref} />, this.__container);
	}

	get components() { return this.__components; }

	getLogger() { return this.__logger; }

	show() { try { if(!this.__menu.state.visible) this.__menu.toggle(); } catch(ex) { this.getLogger().error(ex); } }
	hide() { try { if(this.__menu.state.visible) this.__menu.toggle(); } catch(ex) { this.getLogger().error(ex); } }
	toggle() { try { this.__menu.toggle(); } catch(ex) { this.getLogger().error(ex); } }

	addPage(path: string, page: PageModule) {
		const isDefault = this.components.length === 0;
		page.to = (`/enhanced-netflix/${path.startsWith('/')? path.substr(1) : path}`);
		page.name = page.name? page.name.replace(/([A-Z])/g, ' $1').trim() : NavLink.getName(page.to);
		this.__components.push({
			isDefault,
			path: page.to.toLowerCase(),
			nav: <NavLink to={page.to.toLowerCase()} name={page.name} isActive={isDefault} />,
			page: page
		});
		try { this.__menu.forceUpdate(); } catch(ex) {}
	}

	getComponent(path: string, props) {
		if(path !== null) {
			if(!path.startsWith('/'))
				path = `/${path}`;
			const components = this.components;
			for(const k in components) {
				const component = components[k];
				if(component.path === path)
					return component.page.render();
			}
		}
		return(<span>404 Not Found</span>);
	}

	private getElement(...className: string[]) {
		const launcher = document.createElement('div');
		for(const k in className)
			launcher.classList.add(className[k]);
		return launcher;
	}

	private onMutation(mutations: MutationRecord[]) {
		let container = null;
		const identifier = 'enhancement-controller';
		let selector = '.nfp .nf-player-container .PlayerControlsNeo__core-controls .PlayerControlsNeo__button-control-row';
		if(container = document.querySelector(selector)) {
			if(!document.querySelector(`${selector} .${identifier}`)) {
				container.append(this.getElement(identifier));
				ReactDOM.render(<Launcher.PlayerMenuButton onClick={this.show.bind(this)} />, document.querySelector(`${selector} .${identifier}`));
			}
		}
		selector = '.pinning-header .pinning-header-container .secondary-navigation';
		if(container = document.querySelector(selector)) {
			if(!document.querySelector(`${selector} .${identifier}`)) {
				container.append(this.getElement('nav-element', identifier));
				ReactDOM.render(<Launcher.HomeMenuButton onClick={this.show.bind(this)} />, document.querySelector(`${selector} .${identifier}`));
			}
		}
		if(!Website.Location || Website.Location.href !== document.location.href)
			this.onPathChanged(document.location);
		if(!this.__initialized) {
			this.getLogger().info('Successfully added enhancement modal to DOM!');
			this.__initialized = true;
		}
	}

	private onPathChanged(location: Location) {
		Website.Instance.hide();
		const data: LocationData = {
			href: location.href,
			path: location.pathname,
			args: {}
		};
		let query: string[] = location.search.slice(1).split('#')[0].split('&');
		for(let i = 0; i < query.length; i++) {
			const a = query[i].split('=');
			let value = a[1] || true;
			data.args[a[0]] = value;
		}
		this.emit(':path-changed', data, Website.Location || null);
		Website.Location = data;
	}
}