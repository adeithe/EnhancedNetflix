const MutationObserver = (<any>window).MutationObserver || (<any>window).WebKitMutationObserver;

export interface Options {
	subtree: boolean;
	attributes: boolean;
}

class Observer {
	private __element: Element;
	private __options: Options;
	private __observer: MutationObserver;

	constructor(handler: (mutations: MutationRecord[]) => void, elem: Element = document.body, opts?: Options) {
		this.__element = elem;
		this.__options = opts || { subtree: true, attributes: true };
		this.__observer = new MutationObserver(handler);
		this.start();
	}

	start() { this.__observer.observe(this.__element, this.__options); }
	stop() { this.__observer.disconnect(); }

	getObserver() { return this.__observer; }
}

export default Observer;