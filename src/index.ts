import Logger from "./util/logger";
import Module from "./util/module";

import * as Modules from "./modules";

import "./sass/main.scss";
import "./sass/animation.scss";

export interface Manifest {
	name: string;
	short_name: string;
	description: string;
	version: string;
	author: string;
	homepage_url: string;
}

export class EnhancedNetflix extends Module {
	public static Instance: EnhancedNetflix;

	private manifest: Manifest;
	private logger: Logger;

	constructor() {
		super();
		const start_time = performance.now();

		EnhancedNetflix.Instance = this;

		this.logger = new Logger();
		
		this.manifest = require('./manifest.json');
		this.getLogger().info(`Initializing EnhancedNetflix v${this.manifest.version}...`);

		for(const k in Modules.default)
			this.register(k, Modules.default[k]);
		this.getCoreLogger().info(`Found data for ${Object.keys(Modules.default).length} modules.`);

		this.enable().then(() => this.enableInitialModules()).then(() => {
			setInterval(() => this.emit(':loop'), 750);
			this.getCoreLogger().info(`Initialization complete! (Took: ${Math.ceil(performance.now() - start_time)}ms)`);
		}).catch(err => {
			this.getCoreLogger().error('An error occurred while initializing.', err);
		});
	}

	static get() { return EnhancedNetflix.Instance; }

	getManifest(): Manifest { return this.manifest; }
	getLogger(): Logger { return this.logger; }
	getCoreLogger(): Logger { return this.logger.get('core'); }

	private async enableInitialModules() {
		const promises = [];
		for(const k in this.modules) {
			const module = this.modules[k];
			if(module instanceof Module)
				promises.push(module.enable());
		}
		await Promise.all(promises);
	}
}

(<any>window).EnhancedNetflix = EnhancedNetflix;
(<any>window).enhancement = new EnhancedNetflix();