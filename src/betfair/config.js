import axios from "axios";

import { Login } from "betfair-js-login";

export default class Betfair {
	constructor() {
		this.loginClient = new Login(
			process.env.BF_USERNAME,
			process.env.BF_PASSWORD,
			process.env.BF_APP_KEY
		);
	}

	async getSessionToken() {
		process.env.BF_SESSIONTOKEN = await this.loginClient.login();
	}

	async initAxios() {
		await this.getSessionToken();

		return axios.create({
			baseURL: `https://${process.env.BF_API_HOSTNAME}`,
			headers: {
				"Accept": "application/json",
				"X-Application": process.env.BF_APP_KEY,
				"Content-Type": "application/json",
				"X-Authentication": process.env.BF_SESSIONTOKEN
			},
			transformRequest: [function(data, headers) {
				// Axios encapsulates the request body in a 'data' object
				// This needs to be removed
				return JSON.stringify(data.data);
			}]
		});
	}
}
