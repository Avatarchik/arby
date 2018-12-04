import bfApi from "../../config";

export default class AccountsAPI {
	constructor() {}

	getEventTypes() {
		return bfApi().post(process.env.BF_API_JSONRPC_ENDPOINT, {
			data: this.buildRequestBody("listEventTypes", {
				filter: {}
			})
				.then((response) => {
					return response.data.result;
				})
				.catch((err) => {
					return err;
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
