import {API} from "../";

export class IPacketHandler {
	type: PacketType;
	api: API;

	async handle(packet: IMessage<any>): Promise<void> {}
}

export interface IMessage<T> {
	type: string;
	nonce?: string;
	error?: string;
	data?: T;
}

export enum PacketType {
	PONG,
	RECONNECT,
	RESPONSE,
	MESSAGE
}

import PongPacket from "./PongPacket";
import ReconnectPacket from "./ReconnectPacket";
import ResponsePacket from "./ResponsePacket";
import MessagePacket from "./MessagePacket";

export default {PongPacket, ReconnectPacket, ResponsePacket, MessagePacket};