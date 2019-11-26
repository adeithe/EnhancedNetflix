import * as Moment from "moment";

import {PacketType, IPacketHandler, IMessage} from ".";

export class PongPacket extends IPacketHandler {
	public type: PacketType = PacketType.PONG;

	private __ping: number;
	private __nonce: string;
	private __last: number;

	get ping() { return this.__ping; }

	get nonce() { return this.__nonce; }
	set nonce(nonce: string) {
		this.__nonce = nonce;
		this.__last = Moment.utc().valueOf();
	}

	async handle(packet: IMessage<any>): Promise<void> {
		this.__ping = Moment.utc().valueOf() - this.__last;
	}
}

export default new PongPacket();