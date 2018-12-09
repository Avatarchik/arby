import moment from "moment";
import jsonschema from "jsonschema";
import { merge, forEach, map, reduce } from "lodash";

import Betfair from "../../config";
import Config from "./config";
import TypeDefinitions from "./typeDefs";
import { MarketProjection, MarketSort } from "./enums";

export default class BettingAPI {
	constructor() {
		const Validator = jsonschema.Validator;

		this.betfair = (this.betfair || new Betfair());
		this.validator = new Validator({
			throwError: true
		});

		forEach(TypeDefinitions, (TypeDef, key) => this.validator.addSchema(TypeDef, TypeDef.id));
	}

	async initAxios() {
		try {
			this.api = await this.betfair.initAxios();
		} catch(err) {
			console.error(err);
		}
	}

	async listEventTypes(params) {
		let opFilter;
		let opLocale;
		let filter;
		let locale;

		if (params) {
			({ opFilter, opLocale } = params);
		}
		filter = ((opFilter && opFilter.params) || {});
		locale = (opLocale || process.env.DEFAULT_LOCALE);

		try {
			await this.validateParams(Config.LIST_EVENT_TYPES, params);

			return this.buildRequestBody(Config.LIST_EVENT_TYPES, {
				filter,
				locale
			});
		} catch(err) {
			console.error(err);
		}
	}

	async listCompetitions(params) {
		const { opFilter, opLocale } = params;

		let filter = (opFilter || {});
		let locale = (opLocale || process.env.DEFAULT_LOCALE);

		try {
			await this.validateParams(Config.LIST_COMPETITIONS, params);

			return this.buildRequestBody(Config.LIST_COMPETITIONS, {
				filter,
				locale
			});
		} catch(err) {
			console.error(err);
		}
	}

	async listEvents(params) {
		const { opFilter, opLocale } = params;
		const marketStartTime = {
			marketStartTime: {
				from: moment().startOf("day").format(),
				to: moment().endOf("day").format()
			}
		};

		let filter = (opFilter) ? merge(opFilter.params, marketStartTime) : marketStartTime;
		let locale = (opLocale || process.env.DEFAULT_LOCALE);

		try {
			await this.validateParams(Config.LIST_EVENTS, params);

			return this.buildRequestBody(Config.LIST_EVENTS, {
				filter,
				locale
			});
		} catch(err) {
			console.log(err);
		}
	}

	async listMarketCatalogue(params) {
		const { opFilter, opProjection, opSort, opMaxResults, opLocale } = params;

		let filter = (opFilter && opFilter.params || {});
		let marketProjection = (opProjection || MarketProjection);
		let sort = (opSort || MarketSort);
		let maxResults = (opMaxResults || 10);
		let locale = (opLocale || process.env.DEFAULT_LOCALE);

		try {
			await this.validateParams(Config.LIST_MARKET_CATALOGUE, params);

			return this.buildRequestBody(Config.LIST_MARKET_CATALOGUE, {
				filter,
				marketProjection,
				maxResults,
				locale
			});
		} catch(err) {
			console.error(err);
		}
	}

	async listMarketTypes(params) {
		const { opFilter, opLocale } = params;

		let filter = (opFilter || {});
		let locale = (opLocale || process.env.DEFAULT_LOCALE);

		try {
			await this.validateParams(Config.LIST_MARKET_TYPES, params);

			return this.buildRequestBody(Config.LIST_MARKET_TYPES, {
				filter,
				locale
			});
		} catch(err) {
			console.error(err);
		}
	}

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

	getApiParams(paramsPassed, paramsPoss) {

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
	
	formatValidationErrors(errors) {
		return reduce(errors, (err, acc) => {
			return (`${acc}, ${err.stack}`)
		}, "");
	}

	validateParams(reqName, params) {
		let validation;

		forEach(params, (value, key) => {
			if (value.typeDef) {
				validation = this.validator.validate(value.params, TypeDefinitions[value.typeDef]);

				if (validation.errors && validation.errors.length) {
					throw `${reqName} errors; ${this.formatValidationErrors(validation.errors)}`;
				}
			}
		}, this);
	}
}
