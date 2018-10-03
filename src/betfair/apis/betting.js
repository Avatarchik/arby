import Betfair from "../config";

export default class BettingAPI {
	constructor() {
		const that = this;

		this.betfair = (this.betfair || new Betfair());
		this.betfair.initAxios()
			.then((api) => {
				that.api = api;
			})
			.catch((err) => {
				console.error(err);
			});
	}

	getEventTypes() {
		return this.api.post(process.env.BF_API_JSONRPC_ENDPOINT, {
			data: BettingAPI.buildRequestBody("listEventTypes", {
				filter: {}
			})})
				.then((resp) => {
					return resp.data.result;
				})
				.catch((err) => {
					return err;
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
