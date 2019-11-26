import * as Moment from "moment";
import {MessageHandler, Topic} from ".";
import {IRoom} from "../../";
import NetflixPlayer from "../../../../util/player";

export class NetflixRoom extends MessageHandler {
	public topic: Topic = Topic.NETFLIX_ROOMS;

	async handle(data: IRoom, args: string[]): Promise<void> {
		if(!this.api.room) return;
		if(args[0] !== this.api.room.roomId) return;
		data.token = this.api.room.token;
		this.api.setRoom(data);
		if(this.api.room.token) return;
		if(NetflixPlayer.isPaused !== this.api.room.isPaused)
			NetflixPlayer.toggle();
		let timeRemaining = this.api.room.timeRemaining;
		if(!this.api.room.isPaused)
			timeRemaining -= (Moment.utc().valueOf() - this.api.room.updatedAt);
		NetflixPlayer.seek(timeRemaining, true);
	}
}

export default new NetflixRoom();