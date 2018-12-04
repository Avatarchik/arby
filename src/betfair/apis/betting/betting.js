import moment from "moment";
import jsonschema from "jsonschema";
import { merge, forEach } from "lodash";

import Betfair from "../../config";
import Config from "./config";
import TypeDefinitions from "./typeDefs";
import { MarketProjection, MarketSort } from "./enums";

export default class BettingAPI {
	constructor() {
		const Validator = jsonschema.Validator;

		this.betfair = (this.betfair || new Betfair());
		this.validator = new Validator();
	}

	async initAxios() {
		try {
			this.api = await this.betfair.initAxios();
		} catch(err) {
			console.error(err);
		}
	}

	listEventTypes(params) {
		const { opFilter, opLocale } = params;

		let filter = ((opFilter && opFilter.params) || {});
		let locale = (opLocale || process.env.DEFAULT_LOCALE);

		this.validateParams(params);

		return this.buildRequestBody(Config.LIST_EVENT_TYPES, {
			filter,
			locale
		});
	}

	listCompetitions(params) {
		const { opFilter, opLocale } = params;

		let filter = (opFilter || {});
		let locale = (opLocale || process.env.DEFAULT_LOCALE);

		this.validateParams(params);

		return this.buildRequestBody(Config.LIST_COMPETITIONS, {
			filter,
			locale
		});
	}

	listEvents(params) {
		const { opFilter, opLocale } = params;
		const marketStartTime = {
			marketStartTime: {
				from: moment().startOf("day").format(),
				to: moment().endOf("day").format()
			}
		};

		let filter = (opFilter) ? merge(opFilter, marketStartTime) : marketStartTime;
		let locale = (opLocale || process.env.DEFAULT_LOCALE);

		this.validateParams(params);
		
		return this.buildRequestBody(Config.LIST_EVENTS, {
			filter,
			locale
		});
	}

	listMarketCatalogue(params) {
		const { opFilter, opProjection, opSort, opMaxResults, opLocale } = params;

		let filter = (opFilter || {});
		let marketProjection = (opProjection || MarketProjection);
		let sort = (opSort || MarketSort);
		let maxResults = (opMaxResults || 10);
		let locale = (opLocale || process.env.DEFAULT_LOCALE);

		this.validateParams(params);

		return this.buildRequestBody(Config.LIST_MARKET_CATALOGUE, {
			filter,
			maxResults,
			locale
		});
	}

	listMarketTypes(params) {
		const { opFilter, opLocale } = params;

		let filter = (opFilter || {});
		let locale = (opLocale || process.env.DEFAULT_LOCALE);

		this.validateParams(params);

		return this.buildRequestBody(Config.LIST_MARKET_TYPES, {
			filter,
			locale
		});
	}

	listCurrentOrders(params) {
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
		// console.log("filters: ", filters);
		return this.api.post(process.env.BF_API_JSONRPC_ENDPOINT, {
			data: {
				jsonrpc: "2.0",
				method: `SportsAPING/v1.0/${operation}`,
				params: (filters || {}),
				id: 1
			}
		});
	}

	validateParams(params) {
		const that = this;

		forEach(params, (value, key) => {
			if (value.typeDef) {
				that.validator.validate(value.params, TypeDefinitions[value.typeDef]);				
			}
		});
	}
}
