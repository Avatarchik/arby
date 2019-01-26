import jsonschema from "jsonschema";
import { forEach, reduce } from "lodash"; 

import BetfairConfig from "../config";

import EnumSchemas from "../../../models/account/enums";
import OperationSchemas from "../../../models/account/operations";

import { Operations } from "../../../lib/enums/account";

export default class AccountsAPI {
	constructor() {
		const Validator = jsonschema.Validator;

		this._config = new BetfairConfig();;
		this._validator = new Validator({
			throwError: true
		});

		forEach(EnumSchemas, (Enum, id) => this._validator.addSchema(Enum, Enum.id));
		forEach(OperationSchemas, (Operation, id) => this._validator.addSchema(Operation, Operation.id));
	}

	async getAccountFunds(params) {
		try {
			await this.validateParams(Operations.GET_ACCOUNT_FUNDS, params);

			return this.buildRequestBody(Operations.GET_ACCOUNT_FUNDS, params);
		} catch(err) {
			console.error(err);
		}
	}

	async getAccountDetails(params) {
		try {
			// await this.validateParams(Operations.GET)
		} catch(err) {
			console.error(err);
		}
	}

	buildRequestBody(operation, filters) {
		return this._config._betfairApi.api.post(process.env.BF_API_ACCOUNT_JSONRPC_ENDPOINT, {
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
