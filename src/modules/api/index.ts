import Logger from "../../util/logger";
import {Module} from "../../util/module";

import {PubSub} from "./pubsub";

export interface IAPIResponseNoData { success: boolean; }
export interface IAPIResponse<T> {
	success: boolean;
	data: T;
}

export interface IRoomControllable {
	title: string;
	trackId: string;
	timeRemaining: number;
	isPaused: boolean;
}

export interface IRoom extends IRoomControllable {
	roomId: string;
	token: string;
	updatedAt: number;
	createdAt: number;
}

export class API extends Module {
	public static BASE_URL: string = 'api.adeithe.dev/v1/netflix';

	private __logger: Logger;
	private __pubsub: PubSub;
	private __room: IRoom;

	async onLoad() {
		this.__logger = this.getCore().getLogger().get('api');
		this.__pubsub = new PubSub(this);
		this.__room = null;
	}

	get room() { return this.__room; }
	setRoom(room: IRoom) { this.__room = room; }

	getLogger() { return this.__logger; }
	getPubSub() { return this.__pubsub; }

	getRoomURL() {
		if(!this.room) return null;
		return `https://netflix.com/watch/${this.room.title}?trackId=${this.room.trackId}&roomId=${this.room.roomId}`;
	}

	async createRoom(title: string, trackId: string): Promise<IRoom> {
		const req = await this.call('rooms', Method.POST, {
			title,
			trackId,
			timeRemaining: 0,
			isPaused: true
		});
		const room = await req.json() as IAPIResponse<IRoom>;
		if(req.status === 200 && room.success) {
			this.__room = room.data || null;
			if(this.__room !== null)
				this.getPubSub().listen(`netflix-rooms.${this.__room.roomId}`);
		}
		return this.__room;
	}

	async joinRoom(roomId: string): Promise<boolean> {
		const req = await this.call(`rooms/${roomId}`, Method.GET);
		if(req.status !== 200 && req.status !== 202 && req.status !== 204)
			return false;
		const __data = await req.json() as IAPIResponse<IRoom>;
		if(!__data.success) return false;
		this.__room = __data.data || null;
		if(this.__room !== null) {
			await this.getPubSub().listen(`netflix-rooms.${this.__room.roomId}`);
			return true;
		}
		return false;
	}

	async updateRoom(data?: IRoomControllable): Promise<IRoom> {
		if(!this.__room) return null;
		const req = await this.call(`rooms/${this.__room.roomId}`, Method.PATCH, data);
		if(req.status !== 200 && req.status !== 202 && req.status !== 204)
			return null;
		const __data = await req.json() as IAPIResponse<IRoom>;
		if(!__data.success) return null;
		return __data.data;
	}

	async pingRoom(): Promise<boolean> {
		if(!this.__room) return false;
		const req = await this.call(`rooms/${this.__room.roomId}`, Method.GET);
		if(req.status !== 200 && req.status !== 202 && req.status !== 204)
			return false;
		return true;
	}

	async leaveRoom(): Promise<boolean> {
		if(!this.__room) return false;
		if(this.__room.token) {
			const req = await this.call(`rooms/${this.__room.roomId}`, Method.DELETE);
			if(req.status !== 200 && req.status !== 202 && req.status !== 204)
				return false;
		}
		this.getPubSub().unlisten(`netflix-rooms.${this.__room.roomId}`);
		this.__room = null;
		return true;
	}

	private async call(path: string, method: Method = Method.GET, data: object = {}): Promise<Response> {
		const opts: RequestInit = {
			method: Method[method],
			cache: 'no-cache',
			headers: {
				'Content-Type': 'application/json'
			},
			redirect: 'follow',
			body: (method === Method.GET || method === Method.HEAD)? undefined : JSON.stringify(data)
		};
		if(this.__room && this.__room.token)
			opts.headers['X-API-Key'] = this.__room.token;
		return await fetch(`//${API.BASE_URL}/${path.startsWith('/')? path.substr(1) : path}`, opts);
	}
}

export enum Method {
	GET,
	HEAD,
	POST,
	PATCH,
	PUT,
	DELETE
}

export default API;