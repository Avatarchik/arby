import axios from "axios"
import { Login } from "betfair-js-login"

export default class BetfairConfig {
	constructor() {
		if (!BetfairConfig.instance) {
			BetfairConfig.instance = this
		}

		return BetfairConfig.instance
	}

	initAxios() {
		this._api = axios.create({
			baseURL: `https://${process.env.BETFAIR_ENDPOINT}`,
			headers: {
				Accept: "application/json",
				"X-Application": process.env.BETFAIR_APP_KEY_DELAY,
				"Content-Type": "application/json"
			},
			transformRequest: [
				function(data, headers) {
					// Axios encapsulates the request body in a 'data' object
					// This needs to be removed
					// On 'GET' requests, there is no data so only do the mutation is data exists
					return data ? JSON.stringify(data.data) : data
				}
			]
		})
	}

	async login() {
		try {
			const loginClient = new Login(process.env.BETFAIR_USERNAME, process.env.BETFAIR_PASSWORD, process.env.BETFAIR_APP_KEY_DELAY)

			process.env.BETFAIR_SESSIONTOKEN = await loginClient.login()

			this._api.defaults.headers.common["X-Authentication"] = process.env.BETFAIR_SESSIONTOKEN
		} catch (err) {
			console.error(err)
		}
	}

	get api() {
		return this._api
	}
}
