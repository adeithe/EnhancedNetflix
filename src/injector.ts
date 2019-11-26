'use strict';

(() => {
	const style = document.createElement('link');
	style.type = 'text/css';
	style.rel = 'stylesheet';
	style.href = chrome.runtime.getURL('enhancement.css');
	document.head.appendChild(style);

	const script = document.createElement('script');
	script.type = 'application/javascript';
	script.src = chrome.runtime.getURL('enhancement.js');
	document.head.appendChild(script);
})();