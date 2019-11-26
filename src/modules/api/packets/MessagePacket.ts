import {PacketType, IPacketHandler, IMessage} from ".";
import * as Messages from "./messages";
import {MessageHandler} from "./messages";

export interface IMessageData<T> {
	topic: string;
	message: T;
}

export class MessagePacket extends IPacketHandler {
	public type: PacketType = PacketType.MESSAGE;

	async handle(packet: IMessage<IMessageData<any>>): Promise<void> {
		try {
			const args = packet.data.topic.split('.');
			if(args.length > 0) {
				for(const k in Messages.default) {
					const handler = Messages.default[k] as MessageHandler;
					if(handler.topic.toUpperCase() === args[0].toUpperCase()) {
						handler.api = this.api;
						handler.handle(packet.data.message, args.slice(1));
					}
				}
			}
		} catch(e) {}
	}
}

export default new MessagePacket();