export enum LoggerLevel {
	DEBUG,
	INFO,
	WARNING,
	ERROR
}

export default class Logger {
	private root: Logger;
	private parent: Logger;
	private name: string;
	private level: LoggerLevel;
	private enabled: boolean = true;
	private children: { [key: string]: Logger } = {};

	constructor(parent?: Logger, name?: string, level?: LoggerLevel) {
		this.root = parent ? parent.root : this;
		this.parent = parent;
		this.name = name;
		this.level = level || (this.parent && this.parent.level) || LoggerLevel.INFO;
	}

	getRoot(): Logger { return this.root; }
	getParent(): Logger { return this.parent; }
	getName(): string { return this.name; }
	getLevel(): LoggerLevel { return this.level; }
	setLevel(level: LoggerLevel): void { this.level = level; }
	isEnabled(): boolean { return this.enabled; }
	setEnabled(enabled: boolean): void { this.enabled = enabled; }

	get(name: string, level?: LoggerLevel): Logger {
		name = name.toLowerCase();
		if(!level) level = this.level;
		if(!this.children[name])
			this.children[name] = new Logger(this, (this.name ? `${this.name}.${name}` : name), level);
		return this.children[name];
	}

	debug(...args) {
		return this.invoke(LoggerLevel.DEBUG, args);
	}

	info(...args) {
		return this.invoke(LoggerLevel.INFO, args);
	}

	warn(...args) {
		return this.invoke(LoggerLevel.WARNING, args);
	}

	warning(...args) {
		return this.invoke(LoggerLevel.WARNING, args);
	}

	error(...args) {
		return this.invoke(LoggerLevel.ERROR, args);
	}

	invoke(level: LoggerLevel, args: any[]) {
		if(!this.enabled || level < this.level)
			return;
		const message = Array.prototype.slice.call(args);

		if(this.name) message.unshift(`%cEnhancedNetflix [%c${this.name}%c]:%c`, 'color:#6441A5; font-weight:bold', '', 'color:#6441A5; font-weight:bold', '');
		else message.unshift('%cEnhancedNetflix:%c', 'color:#6441A5; font-weight:bold', '');

		switch(level) {
			case LoggerLevel.DEBUG:
				console.info(...message);
			break;

			case LoggerLevel.INFO:
				console.info(...message);
			break;

			case LoggerLevel.WARNING:
				console.warn(...message);
			break;

			case LoggerLevel.ERROR:
				console.error(...message);
			break;

			default:
				console.log(...message);
		}
	}
}