import * as Packets from "./packets";
import {PacketType, IPacketHandler, IMessage} from "./packets";

import Logger from "../../util/logger";

import {API} from "./";

export interface Topic {
	nonce: string;
	topic: string;
}

export class PubSub {
	public static IP: string = 'pubsub.adeithe.dev';

	private __api: API;
	private __logger: Logger;
	private __socket: WebSocket;
	private __topics: Topic[];
	private __last_ping: number;

	private isPingSet: boolean;

	constructor(api: API) {
		this.__api = api;
		this.__logger = this.__api.getLogger().get('socket');
		this.__topics = [];

		this.__logger.info('Client is ready to connect to PubSub!');
	}

	get topics(): string[] { return Array.from(this.__topics, o => o.topic); }
	get isConnected(): boolean { return !!this.__socket; }
	get latency(): number { return Packets.default.PongPacket.ping; }

	getTopicsByNonce(nonce?: string) {
		const topics: Topic[] = this.__topics;
		for(let i = 0; i < topics.length; i++)
			if(topics[i].nonce === nonce)
				return topics[i].topic;
		return null;
	}

	async listen(topic: string) {
		if(!this.topics.includes(topic))
			this.__topics.push({
				nonce: await this.getNewNonce(),
				topic
			});
		if(!this.isConnected)
			return this.connect();
		for(const k in this.__topics) {
			const t = this.__topics[k];
			if(t.topic === topic) {
				this.__socket.send(JSON.stringify({
					type: "LISTEN",
					nonce: t.nonce,
					data: { topics: [t.topic] }
				}));
				break;
			}
		}
	}

	unlisten(topic: string) {
		if(!topic || !this.topics.includes(topic)) return;
		let i = 0;
		for(; i < this.__topics.length; i++)
			if(this.__topics[i].topic === topic)
				break;
		this.__topics.splice(i, 1);
		if(this.isConnected)
			this.__socket.send(JSON.stringify({ type: "UNLISTEN", data: { topics: [topic] } }));
	}

	async ping(): Promise<void> {
		if(this.__socket) {
			const nonce = await this.getNewNonce();
			Packets.default.PongPacket.nonce = nonce;
			this.__socket.send(JSON.stringify({ type: "PING", nonce }));
			if(!this.isPingSet) {
				this.isPingSet = true;
				setTimeout(() => {
					this.isPingSet = false;
					this.ping();
				}, (300000 - (Math.floor(Math.random() * 7500) + 1000)));
			}
		}
	}

	close() { this.__socket.close(); }

	connect() {
		this.__socket = new WebSocket(`wss://${PubSub.IP}`);
		this.__socket.onopen = (e) => this.onOpen(e);
		this.__socket.onmessage = (e) => this.onMessage(e);
		this.__socket.onclose = (e) => this.onClose(e);
	}

	private onOpen(event: Event) {
		this.__logger.info(`Connection with socket service established!`);
		for(const k in this.__topics)
			this.listen(this.__topics[k].topic);
		this.__api.emit(':connect');
		this.ping();
	}

	private onMessage(event: MessageEvent) {
		try {
			const packet = JSON.parse(event.data) as IMessage<any>;
			for(const k in Packets.default) {
				const handler = Packets.default[k] as IPacketHandler;
				if(PacketType[handler.type].toUpperCase() === packet.type.toUpperCase()) {
					handler.api = this.__api;
					handler.handle(packet);
				}
			}
			this.__api.emit(':message', packet);
		} catch(e) {}
	}

	private onClose(event: Event) {
		this.__logger.warn(`Disconnected from PubSub service!`);
		this.__socket = null;
		this.__api.emit(':disconnect');
	}

	private async getNewNonce() {
		let nonce = "";
		const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for(let i = 0; i < 16; i++)
			nonce += possible.charAt(Math.floor(Math.random() * possible.length));
		if(Array.from(this.__topics, o => o.topic).includes(nonce))
			return await this.getNewNonce();
		return nonce;
	}
}

export default PubSub;