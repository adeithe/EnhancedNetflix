import * as React from "react";
import {Link} from "react-router-dom";
import {Website} from "../../";

import {ILink} from "../../../../util/page";

function toCrumbs(crumbs: ILink[]) {
	const __crumbs: any[] = [];
	for(let i = 0; i < crumbs.length; i++) {
		const crumb = crumbs[i];
		if(i === crumbs.length - 1) {
			if(__crumbs.length > 0) __crumbs.push(<>{'\u00A0'} {crumb.name}</>);
			else __crumbs.push(crumb.name);
			break;
		}
		if(crumb.to)
			__crumbs.push(<Link to={crumb.to} onClick={() => Website.Instance.emit(':tab-changed', crumb.to)}>{crumb.name}</Link>);
		else
			__crumbs.push(crumb.name);
		__crumbs.push(' › ');
	}
	return __crumbs;
}

interface IProps {
	crumbs: ILink[]
}

const Breadcrumb: React.FunctionComponent<IProps> = ({ crumbs }) => {
	return(
		<div className={'breadcrumb-wrapper'}>
			<div className={'elevated'}>
				<section className={'breadcrumb-container'}>
					<p><span>{toCrumbs(crumbs)}</span></p>
				</section>
			</div>
		</div>
	);
};

export default Breadcrumb;