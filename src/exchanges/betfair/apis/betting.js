import jsonschema from "jsonschema";
import {
	merge,
	forEach,
	map,
	reduce
} from "lodash";

import BetfairConfig from "../config";

import TypeDefinitionSchemas from "../../../../models/exchanges/betfair/betting/typeDefs";
import EnumSchemas from "../../../../models/exchanges/betfair/betting/enums";
import OperationSchemas from "../../../../models/exchanges/betfair/betting/operations";

import {
	Operations
} from "../../../../lib/enums/exchanges/betfair/betting";

/**
 * Class representing the Betting API
 */
export default class BettingAPI {
	constructor() {
		const Validator = jsonschema.Validator;

		this._config = new BetfairConfig();
		this._api = this._config.api;
		this._validator = new Validator({
			throwError: true
		});

		forEach(TypeDefinitionSchemas, (TypeDef, key) => this._validator.addSchema(TypeDef, TypeDef.id));
		forEach(EnumSchemas, (Enum, id) => this._validator.addSchema(Enum, Enum.id));
		forEach(OperationSchemas, (Operation, id) => this._validator.addSchema(Operation, Operation.id));
	}

	/**
	 * NOTE: This is only useful if you do not already know the event types. At the time of write this, these are stored in 'config.js'
	 * 
	 * @async
	 * @public
	 * @param {object} params - Parameters passed to this operation ('filter' is required) 
	 * @returns {Array} List of Event Types (i.e. sports) associated with the markets selected by the MarketFilter
	 */
	async listEventTypes(params) {
		try {
			await this.validateParams(Operations.LIST_EVENT_TYPES, params);

			return this.executeRequest(Operations.LIST_EVENT_TYPES, params);
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * @async
	 * @public
	 * @param {object} params - Parameters passed to this operation ('filter' is required)
	 * @returns {Array} List of Competitions (i.e. World Cup 2018) associated with the markets selected by the MarketFilter
	 */
	async listCompetitions(params) {
		try {
			await this.validateParams(Operations.LIST_COMPETITIONS, params);

			return this.executeRequest(Operations.LIST_COMPETITIONS, params);
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * @async
	 * @public
	 * @param {object} params - Parameters for operation ('filter' is required) 
	 * @returns {Array} List of Events (i.e. Reading vs. Man Utd) associated with the markets selected by the MarketFilter
	 */
	async listEvents(params) {
		try {
			await this.validateParams(Operations.LIST_EVENTS, params);

			return this.executeRequest(Operations.LIST_EVENTS, params);
		} catch (err) {
			console.log(err);
		}
	}

	/**
	 * @async
	 * @public
	 * @param {object} params - Parameters for operation ('filter' and 'maxResults' are required)
	 * @returns {Array} List of information about published (ACTIVE/SUSPENDED) markets that does not change (or changes very rarely). Use listMarketCatalogue to retreive the name of the market, the names of the selections and other information about markets
	 */
	async listMarketCatalogue(params) {
		try {
			await this.validateParams(Operations.LIST_MARKET_CATALOGUE, params);

			return this.executeRequest(Operations.LIST_MARKET_CATALOGUE, params);
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * @async
	 * @public
	 * @param {object} params - Parameters for operation ('marketIds' is required)
	 * @returns {Array} List of dynamic data about markets. Dynamic data includes; prices, status of market, status of elections, traded volume, and status of any orders you have places in market
	 */
	async listMarketBook(params) {
		try {
			await this.validateParams(Operations.LIST_MARKET_BOOK, params);

			return this.executeRequest(Operations.LIST_MARKET_BOOK, params);
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * @async
	 * @public
	 * @param {object} params 
	 * @returns {Array} List of dynamic data about market AND specified runner. As listMarketBook but with ONLY specific runner
	 */
	async listRunnerBook(params) {
		try {
			await this.validateParams(Operations.LIST_RUNNER_BOOK, params);

			return this.executeRequest(Operations.LIST_RUNNER_BOOK, params);
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * @async
	 * @public
	 * @param {object} params 
	 * @returns {Array} List of your current orders. Optionally you can filter & sort your current orders using the various parameters...more to go here but want to figure out multi line tags first
	 */
	async listCurrentOrders(params) {
		const {
			betIds,
			marketIds,
			orderProjection,
			customerOrderRefs,
			customerStrategyRefs,
			dateRange,
			orderBy,
			sortDir,
			fromRecord,
			recordCount
		} = params;

		return this.api.post(process.env.BETFAIR_API_JSONRPC_ENDPOINT, {
			data: BettingAPI.buildRequestBody(Config.LIST_CURRENT_ORDERS, {
				...(betIds && {
					betIds
				}),
				...(marketIds && {
					marketIds
				}),
				...(orderProjection && {
					orderProjection
				}),
				...(customerOrderRefs && {
					customerOrderRefs
				}),
				...(customerStrategyRefs && {
					customerStrategyRefs
				}),
				...(dateRange && {
					dateRange
				}),
				...(orderBy && {
					orderBy
				}),
				...(sortDir && {
					sortDir
				}),
				...(fromRecord && {
					fromRecord
				}),
				...(recordCount && {
					recordCount
				})
			})
		})
	}

	/**
	 * @async
	 * @public
	 * @param {object} params 
	 * @returns {object} PlaceExecutionReport
	 */
	async placeOrders(params) {
		try {
			await this.validateParams(Operations.PLACE_ORDERS, params);

			return this.executeRequest(Operations.PLACE_ORDERS, params);
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * @async
	 * @public
	 * @param {object} params 
	 * @returns {object} CancelExecutionOrder
	 */
	async cancelOrders(params) {
		try {
			await this.validateParams(Operations.CANCEL_ORDERS, params);

			return this.executeRequest(Operations.CANCEL_ORDERS, params);
		} catch (err) {
			console.error(err);
		}
	}

	/**
	 * @async
	 * @public
	 * @param {object} params - Parameters for operation ('filter' is required)
	 * @returns List of market types (i.e. MATCH_ODDS, NEXT_GOAL) associated with markets selected by MarketFilter. Market types are always the same regardless of locale
	 */
	async listMarketTypes(params) {
		// I will want to call this endpoint every so often as market types might change
		try {
			await this.validateParams(Operations.LIST_MARKET_TYPES, params);

			return this.executeRequest(Operations.LIST_MARKET_TYPES, params);
		} catch (err) {
			console.error(err);
		}
	}

	executeRequest(operation, filters) {
		return this._api.post(`/${process.env.BETFAIR_BETTING_JSONRPC_ENDPOINT}`, {
			data: {
				jsonrpc: "2.0",
				method: `SportsAPING/v1.0/${operation}`,
				params: (filters || {}),
				id: 1
			}
		});
	}

	formatValidationErrors(errors) {
		return reduce(errors, (err, acc) => {
			return (`${acc}, ${err.stack}`)
		}, "");
	}

	/**
	 * @private
	 * @param {String} reqName 
	 * @param {object} params 
	 */
	validateParams(reqName, params) {
		let validation = this._validator.validate(params, OperationSchemas[reqName]);

		if (validation.errors && validation.errors.length) {
			throw `${reqName} errors; ${this.formatValidationErrors(validation.errors)}`;
		}
	}
}