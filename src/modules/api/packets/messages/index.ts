import API from "../../";

export class MessageHandler {
	topic: Topic;
	api: API;

	constructor(api: API = null) {
		this.api = api;
	}

	async handle(data: any, args: string[]): Promise<void> {}
}

export enum Topic {
	NETFLIX_ROOMS = "netflix-rooms"
}

import NetflixRoom from "./NetflixRoom";

export default {NetflixRoom};