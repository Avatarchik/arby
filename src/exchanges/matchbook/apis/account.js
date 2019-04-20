import MatchbookConfig from "../config"

/**
 * Class representing the Accounts API
 */
export default class AccountsAPI {
	constructor() {
		this._config = new MatchbookConfig()
		this._api = this._config.api
	}

	/**
	 * @async
	 * @public
	 * @returns {Object} - Account information for the user currently logged in. This API requires authentication and will return a 401 in case the session expired or no session token is provided.
	 */
	async getAccount() {
		try {
			return this.executeRequest("/account")
		} catch (err) {
			console.error(err)
		}
	}

	/**
	 * @async
	 * @public
	 * @returns {Object} - Balance for the user currently logged in. This API requires authentication and will return a 401 in case the session expired or no session token is provided.
	 */
	async getBalance() {
		try {
			return this.executeRequest("/account/balance")
		} catch (err) {
			console.error(err)
		}
	}

	executeRequest(endpoint) {
		return this._api.get(`/edge/rest${endpoint}`)
	}
}
