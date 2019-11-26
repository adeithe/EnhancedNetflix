import {PacketType, IPacketHandler, IMessage} from ".";

export class ReconnectPacket extends IPacketHandler {
	public type: PacketType = PacketType.RECONNECT;

	private isReconnecting: boolean;

	async handle(packet: IMessage<any>): Promise<void> {
		if(this.api.getPubSub().isConnected)
			this.api.getPubSub().close();
		if(!this.isReconnecting) {
			this.isReconnecting = true;
			setTimeout(() => {
				this.isReconnecting = false;
				this.api.getPubSub().connect();
			}, (300000 - (Math.floor(Math.random() * 7500) + 1000)));
		}
	}
}

export default new ReconnectPacket();