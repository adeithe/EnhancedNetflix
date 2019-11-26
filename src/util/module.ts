import {EventEmitter} from "events";
import {EnhancedNetflix} from "../";

import * as toSnakeCase from "to-snake-case";

export enum ModuleState {
	DISABLED,
	ENABLING,
	ENABLED,
	DISABLING
}

export enum LoadState {
	UNLOADED,
	LOADING,
	LOADED,
	UNLOADING
}

export class Module extends EventEmitter {
	private __name: string;
	private __parent: Module;
	private __children: { [key: string]: Module };
	private __root: Module;
	private __path: string;
	private __state: ModuleState;
	private __load_state: LoadState;
	private __state_promise: Promise<void>;
	private __load_promise: Promise<void>;
	private __modules: { [key: string]: Module };

	onLoad?(...args): Promise<void>;
	onUnload?(...args): Promise<void>;
	onEnable?(...args): Promise<void>;
	onDisable?(...args): Promise<void>;

	constructor(name: string | Module = null, parent?: Module) {
		if(!parent && name instanceof Module) {
			parent = name;
			name = null;
		}
		super();
		this.__name = (<string>name);
		this.__parent = parent || null;
		this.__children = {};
		this.__root = this.__parent? (this.__parent.__root || this.__parent) : this;
		this.__path = (this.__parent && this.__parent.__path)? `${this.__parent.__path}.${this.__name}` : this.__name;
		this.__state = (this.onLoad || this.onEnable)? ModuleState.DISABLED : ModuleState.ENABLED;
		this.__load_state = this.onLoad? LoadState.UNLOADED : LoadState.LOADED;
		this.__modules = this.__parent? this.__parent.__modules : {};
		if(this.__parent && !this.__parent.__children[this.__name])
			this.__parent.__children[this.__name || ''] = this;
		if(this.__root === this)
			this.__modules[this.__path || ''] = this;
		this.emit(':registered');
	}

	get name() { return this.__name; }
	get root() { return this.__root; }
	get parent() { return this.__parent; }
	get modules() { return this.__modules; }

	get state() { return this.__state; }
	get load_state() { return this.__load_state; }

	get loaded() { return this.__load_state === LoadState.LOADED; }
	get loading() { return this.__load_state === LoadState.LOADING; }

	get enabled() { return this.__state === ModuleState.ENABLED; }
	get enabling() { return this.__state === ModuleState.ENABLING; }

	getCore(): EnhancedNetflix { return this.root as EnhancedNetflix; }

	load(...args): Promise<void> { return this.__load(args, this.__path, []); }

	unload(...args): Promise<void> { return this.__unload(args, this.__path, []); }

	enable(...args): Promise<void> { return this.__enable(args, this.__path, []); }

	disable(...args): Promise<void> { return this.__disable(args, this.__path, []); }

	private __load(args: any[], initial: string, chain: Module[]): Promise<void> {
		const path = this.__path || this.name;
		const state = this.__load_state;
		if(state === LoadState.LOADING)
			return this.__load_promise;
		else if(state === LoadState.LOADED)
			return Promise.resolve();
		else if(state === LoadState.UNLOADING)
			return Promise.reject(new ModuleError(`attempted to load module ${path} while module is being unloaded`));
		else if(chain.includes(this))
			return Promise.reject(new CyclicDependencyError(`cyclic load requirements when loading ${initial}`, chain));
		chain.push(this);
		this.__load_state = LoadState.LOADING;
		return this.__load_promise = (async () => {
			// TODO: Check requirements
			if(this.onLoad)
				return this.onLoad(...args);
		})().then(r => {
			this.__load_state = LoadState.LOADED;
			this.__load_promise = null;
			this.emit(':loaded', this);
			return r;
		}).catch(err => {
			this.__load_state = LoadState.UNLOADED;
			this.__load_promise = null;
			throw err;
		});
	}

	private __unload(args: any[], initial: string, chain: Module[]): Promise<void> {
		const path = this.__path || this.name;
		const state = this.__load_state;
		if(state === LoadState.UNLOADING)
			return this.__load_promise;
		else if(state === LoadState.UNLOADED)
			return Promise.resolve();
		else if(!this.onUnload)
			return Promise.reject(new ModuleError(`attempted to unload module ${path} but module cannot be unloaded`));
		else if(state === LoadState.LOADING)
			return Promise.reject(new ModuleError(`attempted to unload module ${path} while module is being loaded`));
		else if(chain.includes(this))
			return Promise.reject(new CyclicDependencyError(`cyclic load requirements when unloading ${initial}`, chain));
		chain.push(this);
		this.__load_state = LoadState.UNLOADING;
		return this.__load_promise = (async () => {
			if(this.__state !== ModuleState.DISABLED)
				return this.disable();
			// TODO: Check for dependencies
			return this.onUnload(...args);
		})().then(r => {
			this.__load_state = LoadState.UNLOADED;
			this.__load_promise = null;
			this.emit(':unloaded', this);
			return r;
		}).catch(err => {
			this.__load_state = LoadState.LOADED;
			this.__load_promise = null;
			throw err;
		});
	}

	private __enable(args: any[], initial: string, chain: Module[]): Promise<void> {
		const path = this.__path || this.name;
		const state = this.__state;
		if(state === ModuleState.ENABLING)
			return this.__state_promise;
		else if(state === ModuleState.ENABLED)
			return Promise.resolve();
		else if(state === ModuleState.DISABLING)
			return Promise.reject(new ModuleError(`attemted to enable module while it is being disabled`));
		else if(chain.includes(this))
			return Promise.reject(new CyclicDependencyError(`cyclic requirements while enabling ${initial}`, chain));
		chain.push(this);
		this.__state = ModuleState.ENABLING;
		return this.__state_promise = (async () => {
			const promises = [];
			const load_state = this.__load_state;
			if(load_state === LoadState.UNLOADING)
				throw new ModuleError(`attempted to load module ${path} while module is being unloaded`);
			else if(load_state === LoadState.LOADING || load_state === LoadState.UNLOADED)
				promises.push(this.load());
			// TODO: Check for requirements
			await Promise.all(promises);
			if(this.onEnable)
				return this.onEnable(...args);
		})().then(r => {
			this.__state = ModuleState.ENABLED;
			this.__state_promise = null;
			this.emit(':enabled', this);
			return r;
		}).catch(err => {
			this.__state = ModuleState.DISABLED;
			this.__state_promise = null;
			throw err;
		});
	}

	private __disable(args: any[], initial: string, chain: Module[]): Promise<void> {
		const path = this.__path || this.name;
		const state = this.__state;
		if(state === ModuleState.DISABLING)
			return this.__state_promise;
		else if(state === ModuleState.DISABLED)
			return Promise.resolve();
		else if(!this.onDisable)
			return Promise.reject(new ModuleError(`attempted to disable module ${path} but module cannot be disabled`));
		else if(state === ModuleState.ENABLING)
			return Promise.reject(new ModuleError(`attempted to disable module ${path} while module is being enabled`));
		else if(chain.includes(this))
			return Promise.reject(new CyclicDependencyError(`cyclic requirements when disabling ${initial}`, chain));
		chain.push(this);
		this.__state = ModuleState.DISABLING;
		return this.__state_promise = (async () => {
			if(this.__load_state !== LoadState.LOADED)
				throw new ModuleError(`attempted to disable module ${path} but module is unloaded - you should contact a developer about this`);
			// TODO: Check for dependencies
			return this.onDisable(...args);
		})().then(r => {
			this.__state = ModuleState.DISABLED;
			this.__state_promise = null;
			this.emit(':disabled', this);
			return r;
		}).catch(err => {
			this.__state = ModuleState.ENABLED;
			this.__state_promise = null;
			throw err;
		});
	}

	resolve(module: string | Module): Module {
		if(module instanceof Module)
			return module;
		if(typeof(module) !== 'string') {
			for(const k in this.__modules)
				if(this.__modules[k] instanceof Module)
					return this.__modules[k];
		} else
			if(this.__modules[(<string>module)] instanceof Module)
				return this.__modules[(<string>module)];
		return null;
	}

	register(name: string, module: any) {
		name = toSnakeCase(name);
		const path: string = this.__path? this.__path : name;
		const old = this.__modules[path];
		if(!(module.prototype instanceof Module))
			throw new ModuleError(`module ${name} is not a subclass of Module.`);
		if(old instanceof Module)
			throw new ModuleError(`name collision for module ${path}`);
		const inst = this.__modules[path] = new module(name, this);
		// TODO: Handle module requirements and dependencies
		return inst;
	}
}

export class ModuleError extends Error {
	public modules: Module[];
}

export class CyclicDependencyError extends ModuleError {
	constructor(message: string, modules: Module[]) {
		super(message);
		this.modules = modules;
	}
}

export default Module;