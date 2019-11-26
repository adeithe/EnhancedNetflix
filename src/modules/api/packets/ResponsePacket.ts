import {PacketType, IPacketHandler, IMessage} from ".";

export class ResponsePacket extends IPacketHandler {
	public type: PacketType = PacketType.RESPONSE;

	async handle(packet: IMessage<any>): Promise<void> {
		if(packet.error && packet.nonce)
			this.api.getPubSub().unlisten(this.api.getPubSub().getTopicsByNonce(packet.nonce));
	}
}

export default new ResponsePacket();