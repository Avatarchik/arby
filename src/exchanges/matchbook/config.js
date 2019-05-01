const axios = require("axios")

module.exports = class MatchbookConfig {
	constructor() {
		if (!MatchbookConfig.instance) {
			MatchbookConfig.instance = this
		}

		return MatchbookConfig.instance
	}

	initAxios() {
		this._api = axios.create({
			baseURL: `https://${process.env.MATCHBOOK_ENDPOINT}`,
			headers: {
				Accept: "application/json",
				"Content-Type": "application/json",
				...(process.env.MATCHBOOK_SESSIONTOKEN && { "session-token": process.env.MATCHBOOK_SESSIONTOKEN })
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
		let response

		try {
			response = await this._api.post("/bpapi/rest/security/session", {
				data: {
					username: process.env.MATCHBOOK_USERNAME,
					password: process.env.MATCHBOOK_PASSWORD
				}
			})

			process.env.MATCHBOOK_SESSIONTOKEN = response.data["session-token"]
			this._api.defaults.headers.common["session-token"] = process.env.MATCHBOOK_SESSIONTOKEN
		} catch (err) {
			throw err
		}
	}

	get api() {
		return this._api
	}
}
