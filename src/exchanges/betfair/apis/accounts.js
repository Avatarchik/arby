import jsonschema from "jsonschema";
import {
	forEach,
	reduce
} from "lodash";

import BetfairConfig from "../config";

import EnumSchemas from "../../../../models/exchanges/betfair/account/enums";
import OperationSchemas from "../../../../models/exchanges/betfair/account/enums";

import {
	Operations
} from "../../../../lib/enums/exchanges/betfair/account";

/**
 * Class represening the Accounts API
 */
export default class AccountsAPI {
	constructor() {
		const Validator = jsonschema.Validator;

		this._config = new BetfairConfig();;
		this._api = this._config.api;
		this._validator = new Validator({
			throwError: true
		});

		forEach(EnumSchemas, (Enum, id) => this._validator.addSchema(Enum, Enum.id));
		forEach(OperationSchemas, (Operation, id) => this._validator.addSchema(Operation, Operation.id));
	}

	async getAccountFunds(params) {
		try {
			await this.validateParams(Operations.GET_ACCOUNT_FUNDS, params);

			return this.executeRequest(Operations.GET_ACCOUNT_FUNDS, params);
		} catch (err) {
			console.error(err);
		}
	}

	async getAccountDetails(params) {
		try {
			// await this.validateParams(Operations.GET)
		} catch (err) {
			console.error(err);
		}
	}

	executeRequest(operation, filters) {
		return this._api.post(process.env.BETFAIR_ACCOUNT_JSONRPC_ENDPOINT, {
			data: {
				jsonrpc: "2.0",
				method: `AccountAPING/v1.0/${operation}`,
				params: (filters || {}),
				id: 1
			}
		})
	}

	formatValidationErrors(error) {
		return reduce(errors, (err, acc) => {
			return (`${acc}, ${err.stack}`)
		}, "")
	}

	validateParams(reqName, params) {
		let validation = this._validator.validate(params, OperationSchemas[reqName]);

		if (validation.error && validation.errors.length) {
			throw `${reqName} errors; ${this.formatValidationErrors(validation.errors)}`;
		}
	}
}