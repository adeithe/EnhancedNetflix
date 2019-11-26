import Logger from "../../util/logger";
import Module from "../../util/module";

import {EnhancedNetflix} from "../../";

export interface NetflixProfile {
	guid: string;
	profileName: string;
	language: string;
	isAccountOwner: boolean;
	isKids: boolean;
	isActive: boolean;
}

export class Manager extends Module {
	private logger: Logger;

	async onLoad() {
		this.logger = EnhancedNetflix.Instance.getLogger().get('manager');
		if(this.profile)
			this.logger.info(`Currently active profile: '${this.profile.guid}' (${this.profile.profileName})`, [this.profile]);
	}

	get profile(): NetflixProfile {
		try {
			if(!(<any>window).netflix.falcorCache)
				return null;
			const profiles = (<any>window).netflix.falcorCache.profiles;
			for(const k in profiles) {
				const profile: NetflixProfile = profiles[k].summary.value;
				if(profile.isActive)
					return profile;
			}
		} catch(ex) {
			this.logger.error(`An error occurred while fetching profile!`, ex);
		}
		return null;
	}
}