import * as React from "react";
import PageModule from "../../../../util/page";

import PageBuilder from "../../components/page";
import Page from "../../components/pages";

class Home extends PageModule {
	render(): JSX.Element {
		return(
			<PageBuilder>
				<Page.Breadcrumb crumbs={this.resolve()} />
				<Page.GridContainer className={'enhancement-border-b'}>
					<Page.Grid.MD_12>
						<Page.Text.Center>
							<h2>EnhancedNetflix</h2>
						</Page.Text.Center>
					</Page.Grid.MD_12>
					<Page.Grid.MD_12>
						<Page.Text.Center>
							<span  className={'alt-text'}>A better way to watch.</span>
						</Page.Text.Center>
					</Page.Grid.MD_12>
				</Page.GridContainer>
				<Page.GridContainer>
					<Page.Grid.MD_12>
						<p>Thank you for using EnhancedNetflix.</p>
					</Page.Grid.MD_12>
					<Page.Grid.MD_12>
						<p>
							EnhancedNetflix is a browser extension allowing you to modify the Netflix website in various ways.
							This extension comes with many features, such as <b>Watch Together</b>, making it possible to watch Netflix with your friends online.
						</p>
					</Page.Grid.MD_12>
					<Page.Grid.MD_12>
						<p>
							<b>NOTE:</b> This extension is still in the very early days of development.
							Expect bugs or for features to be broken or missing.
						</p>
					</Page.Grid.MD_12>
				</Page.GridContainer>
			</PageBuilder>
		);
	}
}

export default Home;