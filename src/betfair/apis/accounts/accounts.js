import jsonschema from "jsonschema";
import { forEach, reduce } from "lodash"; 

import BetfairApi from "../../api";
import { Operations } from "./config";

import EnumSchemas from "./schemas/enums";
import OperationSchemas from "./schemas/operations";

export default class AccountsAPI {
	constructor() {
		const Validator = jsonschema.Validator;

		this.api = new BetfairApi();;
		this.validator = new Validator({
			throwError: true
		});

		forEach(EnumSchemas, (Enum, id) => this.validator.addSchema(Enum, Enum.id));
		forEach(OperationSchemas, (Operation, id) => this.validator.addSchema(Operation, Operation.id));
	}

	async getAccountFunds(params) {
		try {
			await this.validateParams(Operations.GET_ACCOUNT_FUNDS, params);

			return this.buildRequestBody(Operations.GET_ACCOUNT_FUNDS, params);
		} catch(err) {
			console.error(err);
		}
	}

	buildRequestBody(operation, filters) {
		return this.api.api.post(process.env.BF_API_ACCOUNT_JSONRPC_ENDPOINT, {
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
		let validation = this.validator.validate(params, OperationSchemas[reqName]);

		if (validation.error && validation.errors.length) {
			throw `${reqName} errors; ${this.formatValidationErrors(validation.errors)}`;
		}
	}
}
