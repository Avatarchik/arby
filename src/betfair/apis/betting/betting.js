import jsonschema from "jsonschema";
import { merge, forEach, map, reduce } from "lodash";

import Betfair from "../../config";
import { Operations } from "./config";
import TypeDefinitions from "./typeDefs";
import Enums from "./enums";

/**
 * Class representing the Betting API
 */
export default class BettingAPI {
	constructor() {
		const Validator = jsonschema.Validator;

		this.betfair = (this.betfair || new Betfair());
		this.validator = new Validator({
			throwError: true
		});

		forEach(TypeDefinitions, (TypeDef, key) => this.validator.addSchema(TypeDef, TypeDef.id));
		forEach(Enums, (Enum, id) => this.validator.addSchema(Enum, Enum.id));
	}

	async initAxios() {
		try {
			this.api = await this.betfair.initAxios();
		} catch(err) {
			console.error(err);
		}
	}

	/**
	 * @async
	 * @public
	 * @param {object} params - Parameters passed to this operation ('filter' is required) 
	 * @returns {Array} List of Event Types (i.e. sports) associated with the markets selected by the MarketFilter
	 */
	async listEventTypes(params) {
		try {
			await this.validateParams(Operations.LIST_EVENT_TYPES, params, "LIST_EVENT_TYPES");

			return this.buildRequestBody(Operations.LIST_EVENT_TYPES, params);
		} catch(err) {
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

			return this.buildRequestBody(Operations.LIST_COMPETITIONS, params);
		} catch(err) {
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
			await this.validateParams(Operations.LIST_EVENTS, params, "LIST_EVENTS");

			return this.buildRequestBody(Operations.LIST_EVENTS, params);
		} catch(err) {
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
			await this.validateParams(Operations.LIST_MARKET_CATALOGUE, params, "LIST_MARKET_CATALOGUE");

			return this.buildRequestBody(Operations.LIST_MARKET_CATALOGUE, params);
		} catch(err) {
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
		const {
			marketIds,
			priceProjection,
			orderProjection,
			matchProjection,
			includeOverallPosition,
			partitionMatchedByStrategyRef,
			customerStrategyRefs,
			currencyCode,
			locale,
			matchedSince,
			betIds
		} = params;

		try {
			await this.validateParams(Operations.LIST_MARKET_BOOK, params, "LIST_MARKET_BOOK");

			return this.buildRequestBody(Operations.LIST_MARKET_BOOK, params);
		} catch(err) {
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
			await this.validateParams(Operations.LIST_RUNNER_BOOK, params, "LIST_RUNNER_BOOK");

			return this.buildRequestBody(Operations.LIST_RUNNER_BOOK, params);
		} catch(err) {
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
		try {
			await this.validateParams(Operations.LIST_MARKET_TYPES, params);

			return this.buildRequestBody(Operations.LIST_MARKET_TYPES, params);
		} catch(err) {
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
		const { betIds, marketIds, orderProjection, customerOrderRefs, customerStrategyRefs, dateRange, orderBy, sortDir, fromRecord, recordCount } = params;

		return this.api.post(process.env.BF_API_JSONRPC_ENDPOINT, {
			data: BettingAPI.buildRequestBody(Config.LIST_CURRENT_ORDERS, {
				...(betIds && { betIds }),
				...(marketIds && { marketIds }),
				...(orderProjection && { orderProjection }),
				...(customerOrderRefs && { customerOrderRefs }),
				...(customerStrategyRefs && { customerStrategyRefs }),
				...(dateRange && { dateRange }),
				...(orderBy && { orderBy }),
				...(sortDir && { sortDir }),
				...(fromRecord && { fromRecord }),
				...(recordCount && { recordCount })
			})
		})
	}

	placeOrders(params) {
		const { marketId, instructions, customerRef, marketVersion, customerStrategyRef, async } = params;

	}

	buildRequestBody(operation, filters) {
		return this.api.post(process.env.BF_API_JSONRPC_ENDPOINT, {
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
	 * @param {String} topTypeDef
	 */
	validateParams(reqName, params, topTypeDef) {
		let validation = this.validator.validate(params, TypeDefinitions[topTypeDef]);

		if (validation.errors && validation.errors.length) {
			throw `${reqName} errors; ${this.formatValidationErrors(validation.errors)}`;
		}
	}
}
