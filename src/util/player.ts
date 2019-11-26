import {EventEmitter} from "events";

import Observer from "./observer";

export enum PlayerState {
	IDLE,
	LOADING,
	PLAYING,
	PAUSED
}

export class NetflixPlayer extends EventEmitter {
	private __state: PlayerState;
	private __observer: Observer;

	constructor() {
		super();
		this.__state = PlayerState.IDLE;
		this.__observer = new Observer(this.onMutation.bind(this));
	}

	get isPaused() { return this.getState() !== PlayerState.PLAYING; }

	getState(): PlayerState {
		if(document.querySelector('.PlayerControlsNeo__layout--dimmed'))
			return PlayerState.IDLE;
		if(document.querySelector('.AkiraPlayerSpinner--container'))
			return PlayerState.LOADING;
		if(document.querySelector('button.button-nfplayerPause'))
			return PlayerState.PLAYING;
		return PlayerState.PAUSED;
	}

	getPlayer() { try { return (<any>window).netflix.appContext.state.playerApp.getAPI().videoPlayer; } catch(e) {} return null; }
	getVideo(sessionId?: string) {
		try {
			if(!sessionId)
				sessionId = this.getPlayer().getAllPlayerSessionIds()[0];
			return this.getPlayer().getVideoPlayerBySessionId(sessionId) || null;
		} catch(e) {}
		return null;
	}

	seek(miliseconds: number, isTimeRemaining?: boolean) {
		try {
			if(isTimeRemaining)
				miliseconds = (this.getDuration() - miliseconds);
			this.getVideo().seek(Math.floor(miliseconds));
		} catch(e) {}
	}

	skipCredits(): boolean { try { (<any>document.querySelector('.skip-credits a')).click(); return true; } catch(e) {} return false; }

	play(): boolean { try { if(this.__state !== PlayerState.PLAYING) { this.getVideo().play(); return true; } } catch(e) {} return false; }
	pause(): boolean { try { if(this.__state !== PlayerState.PAUSED) { this.getVideo().pause(); return true; } } catch(e) {} return false; }
	toggle(): boolean { return this.play() || this.pause(); }

	getTitle(): string {
		if(this.getVideo() !== null)
			return `${this.getVideo().getMovieId()}`;
		return '70206978';
	}

	getDuration(): number {
		if(this.getVideo() !== null)
			return Math.floor(this.getVideo().getDuration());
		return -1;
	}

	getPlaybackPosition(): number {
		if(this.getVideo() !== null)
			return Math.floor(this.getVideo().getCurrentTime());
		return -1;
	}

	getTimeRemaining(): number {
		if(this.getVideo() !== null)
			return Math.floor(this.getVideo().getDuration() - this.getVideo().getCurrentTime());
		return -1;
	}

	private onMutation(mutations: MutationRecord[]) {
		const state = this.getState();
		if(this.__state !== state) {
			this.emit(':state-changed', state, this.__state);
			this.__state = state;
		}
	}
}

export default new NetflixPlayer();