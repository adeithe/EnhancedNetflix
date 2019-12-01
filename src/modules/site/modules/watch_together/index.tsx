import * as React from "react";
import {Website, LocationData} from "../..";
import API from "../../../api";

import Logger from "../../../../util/logger";
import PageModule from "../../../../util/page";
import PlayerManager, {PlayerState, NetflixPlayer} from "../../../../util/player";

import PageBuilder from "../../components/page";
import Page from "../../components/pages";
import {EnhancedNetflix} from "../../../../";

import {NetflixRoom} from "../../../api/packets/messages/NetflixRoom";

class WatchTogether extends PageModule {
	private __logger: Logger;
	private __api : API;
	private __manager: NetflixPlayer;
	private __location: LocationData;
	
	private isInitialized: boolean;
	private isWatching: boolean;
	private isUpdating: boolean;

	constructor() {
		super();
		this.__logger = Website.Instance.getLogger().get('watch_together');
		this.__api = EnhancedNetflix.Instance.resolve('api') as API;
		this.__manager = PlayerManager;
		this.__manager.on(':state-changed', this.onPlayerStateChanged.bind(this));
		Website.Instance.on(':path-changed', (location: LocationData) => {
			this.__logger.info('The client path has changed!', [location]);
			this.__location = location;
			this.isWatching = this.__location.path.startsWith('/watch');
			this.handle(location);
		});
		window.onbeforeunload = (e: BeforeUnloadEvent) => {
			this.__api.leaveRoom();
			return undefined;
		};
	}

	async onPlayerStateChanged(state: PlayerState, oldState: PlayerState) {
		this.__logger.debug('New player state!', PlayerState[oldState], '->', PlayerState[state]);
		if(this.__manager.getVideo() == null) return;
		if(this.__api.room !== null) await this.update();
	}

	async handle(location: LocationData) {
		if(!this.isWatching && this.__api.room)
			return await this.__api.leaveRoom();
		if(this.isWatching && !this.__api.room) {
			if(!location.args.hasOwnProperty('trackId'))
				location.args['trackId'] = '123456789';
			if(location.args.hasOwnProperty('roomId')) {
				if(await this.__api.joinRoom(location.args['roomId'] as string)) {
					this.__logger.info('Successfully connected to a room!', [this.__api.room]);
					this.update();
				} else
					window.location.href = `${document.location.origin}${location.path}?trackId=${location.args['trackId']}`;
				return;
			}
			const room = await this.__api.createRoom(location.path.replace(/\/watch\//g, ''), location.args['trackId'] as string);
			if(room !== null) {
				this.__logger.info('A room was created and is ready for use!', [room]);
				this.__logger.info('Invite URL:', this.__api.getRoomURL());
			}
		}
	}

	async update() {
		if(!this.__api.room !== null) {
			if(this.__manager.getVideo() !== null) {
				if(await this.__api.pingRoom()) {
					if(this.__api.room.token) {
						await this.__api.updateRoom({
							title: this.__location.path.replace(/\/watch\//g, ''),
							trackId: this.__location.args['trackId'] as string,
							timeRemaining: this.__manager.getTimeRemaining(),
							isPaused: (this.__manager.getState() !== PlayerState.PLAYING)
						});
					} else {
						if(this.__manager.getTitle() !== this.__api.room.title) {
							window.location.href = this.__api.getRoomURL();
							return;
						} //else if(!this.isInitialized)
							//new NetflixRoom(this.__api).handle(this.__api.room, [this.__api.room.roomId]);
					}
					if(!this.isUpdating) {
						this.isUpdating = true;
						setTimeout(() => {
							this.isUpdating = false;
							this.update();
						}, (30000 - (Math.floor(Math.random() * 7500) + 1000)));
					}
					this.isInitialized = true;
					return;
				} else {
					this.__logger.warn('The connected room has been closed!');
					this.__api.leaveRoom();
				}
			}
		}
		this.isInitialized = false;
	}

	render(): JSX.Element {
		return(
			<PageBuilder>
				<Page.Breadcrumb crumbs={this.resolve()} />
				<Page.GridContainer>
					<Page.Grid.MD_12>
						<p style={{ margin: 0 }}>
							Using <b>Watch Together</b> you can sync your Netflix player with someone else over the internet allowing you to seemlessly watch shows and movies together.
						</p>
						{this.isWatching?null: <p>To get started, simply start watching a show then check back here to get your personal invite link.</p>}
					</Page.Grid.MD_12>
				</Page.GridContainer>
				{!this.isWatching?null: (
					<Page.GridContainer>
						<Page.Grid.MD_12>
							<Page.Forms.Input placeholder={'Unable to get invite link.'} value={this.__api.getRoomURL()} readOnly style={{width:'100%'}} />
						</Page.Grid.MD_12>
					</Page.GridContainer>
				)}
			</PageBuilder>
		);
	}
}

export default WatchTogether;