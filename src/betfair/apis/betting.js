import moment from "moment";

import Betfair from "../config";

export default class BettingAPI {
	constructor() {
		this.betfair = (this.betfair || new Betfair());
	}

	async initAxios() {
		try {
			this.api = await this.betfair.initAxios();
		} catch(err) {
			console.error(err);
		}
	}

	getEventTypes() {
		return this.api.post(process.env.BF_API_JSONRPC_ENDPOINT, {
			data: BettingAPI.buildRequestBody("listEventTypes", {
				filter: {}
			})
		});
	}

	getCompetitions() {
		return this.api.post(process.env.BF_API_JSONRPC_ENDPOINT, {
			data: BettingAPI.buildRequestBody("listCompetitions", {

			})
		});
	}

	getEvents(eventTypeIds) {
		return this.api.post(process.env.BF_API_JSONRPC_ENDPOINT, {
			data: BettingAPI.buildRequestBody("listEvents", {
				filter: {
					eventTypeIds: eventTypeIds,
					marketStartTime: {
						from: moment().startOf("day").format(),
						to: moment().endOf("day").format()
					}
				}
			})
		})
	}

	getMarketCatalogue(eventIds) {
		return this.api.post(process.env.BF_API_JSONRPC_ENDPOINT, {
			data: BettingAPI.buildRequestBody("listMarketCatalogue", {
				filter: {
					eventIds: eventIds
				},
				marketProjection: [
					"COMPETITION",
					"EVENT",
					"EVENT_TYPE",
					"RUNNER_DESCRIPTION",
					"RUNNER_METADATA",
					"MARKET_START_TIME"
				]
			})
		});
	}

	static buildRequestBody(operation, filters) {
		return {
			jsonrpc: "2.0",
			method: `SportsAPING/v1.0/${operation}`,
			params: (filters || {}),
			id: 1
		}
	}
}
