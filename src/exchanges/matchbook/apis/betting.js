const jsonschema = require("jsonschema")
const { forEach, reduce } = require("lodash")

const MatchbookConfig = require("../config")

const EnumSchemas = require("../../../../models/exchanges/matchbook/betting/enums")
const OperationSchemas = require("../../../../models/exchanges/matchbook/betting/operations")
const { Operations } = require("../../../../lib/enums/exchanges/matchbook/betting")

/**
 * Class representing the Betting API
 */
module.exports = class BettingAPI {
	constructor() {
		const Validator = jsonschema.Validator

		this._config = new MatchbookConfig()
		this._api = this._config.api
		this._validator = new Validator()

		forEach(EnumSchemas, (Enum, id) => this._validator.addSchema(Enum, Enum.id))
		forEach(OperationSchemas, (Operation, id) => this._validator.addSchema(Operation, Operation.id))
	}

	/**
	 * @async
	 * @public
	 * @param {Object} params - Parameters passed to this operation
	 * @returns {Array} - List of sports supported by Matchbook.
	 */
	async getSports(params) {
		try {
			await this.validateParams(Operations.GET_SPORTS, params)

			return this.executeRequest("/lookups/sports", params)
		} catch (err) {
			console.error(err)
		}
	}

	/**
	 * @async
	 * @public
	 * @returns {Object} - Tree structure used for the navigation of events.
	 */
	async getNavigation() {
		try {
			await this.validateParams(Operations.GET_NAVIGATION, params)
			return this._api.get("/edge/rest/navigation", {
				params: {
					offset: 0,
					"per-page": 20
				}
			})
		} catch (err) {
			console.error(err)
		}
	}

	/**
	 * @async
	 * @public
	 * @param {Object} params - Parameters passed to this operation
	 * @returns {Array} - List of events available on Matchbook ordered by start time.
	 */
	async getEvents(params) {
		try {
			await this.validateParams(Operations.GET_EVENTS, params)

			return this.executeRequest("/events", params)
		} catch (err) {
			console.error(err)
		}
	}

	/**
	 * @async
	 * @public
	 * @param {String} eventId - The ID of the event to get
	 * @param {Object} params - Parameters passed to this operation
	 * @returns {Object} - Event
	 */
	async getEvent(eventId, params) {
		try {
			await this.validateParams(Operations.GET_EVENT, params)

			return this.executeRequest(`/events/${eventId}`, params)
		} catch (err) {
			console.error(err)
		}
	}

	/**
	 * @async
	 * @public
	 * @param {String} eventId - The ID of the event
	 * @param {Object} params - Parameters passed to this operation
	 * @returns {Array} - List of markets available on Matchbook in this event
	 */
	async getMarkets(eventId, params) {
		try {
			await this.validateParams(Operations.GET_MARKETS, params)

			return this.executeRequest(`/events/${eventId}/markets`, params)
		} catch (err) {
			console.error(err)
		}
	}

	/**
	 * @async
	 * @public
	 * @param {String} eventId - The ID of the event
	 * @param {String} marketId - The ID of the market to get
	 * @param {Object} params - Parameters passed to this operation
	 * @returns {Object} - Market
	 */
	async getMarket(eventId, marketId, params) {
		try {
			await this.validateParams(Operations.GET_MARKET, params)

			return this.executeRequest(`/events/${eventId}/markets/${marketId}`, params)
		} catch (err) {
			console.error(err)
		}
	}

	/**
	 * @async
	 * @public
	 * @param {String} eventId - The ID of the event
	 * @param {String} marketId - The ID of the market
	 * @param {Object} params - Parameters passed to this operation
	 * @returns {Array} - List of runners available on Matchbook in this event in this market
	 */
	async getRunners(eventId, marketId, params) {
		try {
			await this.validateParams(Operations.GET_RUNNERS, params)

			return this.executeRequest(`/events/${eventId}/markets/${marketId}/runners`, params)
		} catch (err) {
			console.error(err)
		}
	}

	/**
	 * @async
	 * @public
	 * @param {String} eventId - The ID of the event
	 * @param {String} marketId - The ID of the market
	 * @param {String} runnerId - The ID of the runner to get
	 * @param {Object} params - Parameters passed to this operation
	 * @returns {Object} - Runner
	 */
	async getRunner(eventId, marketId, runnerId, params) {
		try {
			await this.validateParams(Operations.GET_RUNNER, params)

			return this.executeRequest(`/events/${eventId}/markets/${marketId}/runners/${runnerId}`, params)
		} catch (err) {
			console.error(err)
		}
	}

	executeRequest(endpoint, params) {
		return this._api.get(`/edge/rest${endpoint}`, {
			params
		})
	}

	formatValidationErrors(errors) {
		return reduce(
			errors,
			(err, acc) => {
				return `${acc}, ${err.stack}`
			},
			""
		)
	}

	/**
	 * @private
	 * @param {String} reqName
	 * @param {object} params
	 */
	validateParams(reqName, params) {
		let validation = this._validator.validate(params, OperationSchemas[reqName])

		if (validation.errors && validation.errors.length) {
			throw `${reqName} errors; ${this.formatValidationErrors(validation.errors)}`
		}
	}
}
