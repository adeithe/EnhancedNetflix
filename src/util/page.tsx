import * as React from "react";

export interface ILink {
	name: string;
	to?: string;
}

export class PageModule {
	name: string;
	to: string;

	resolve(): ILink[] {
		return [{ name: this.name }];
	}

	render(): JSX.Element {
		return(<div>501 Not Implemented</div>);
	}
}

export default PageModule;