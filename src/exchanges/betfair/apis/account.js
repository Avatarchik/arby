const jsonschema = require("jsonschema")
const { forEach, reduce } = require("lodash")

const BetfairConfig = require("../config")

const EnumSchemas = require("../../../../models/exchanges/betfair/account/enums")
const OperationSchemas = require("../../../../models/exchanges/betfair/account/operations")

const { AccountOperations } = require("../../../../lib/enums/exchanges/betfair/account")

/**
 * Class represening the Accounts API
 */
module.exports = class AccountsAPI {
	constructor() {
		const Validator = jsonschema.Validator

		this._config = new BetfairConfig()
		this._api = this._config.api
		this._validator = new Validator({
			throwError: true
		})

		forEach(EnumSchemas, (Enum, id) => this._validator.addSchema(Enum, Enum.id))
		forEach(OperationSchemas, (Operation, id) => this._validator.addSchema(Operation, Operation.id))
	}

	async getAccountFunds(params) {
		try {
			await this.validateParams(AccountOperations.GET_ACCOUNT_FUNDS, params)

			return this.executeRequest(AccountOperations.GET_ACCOUNT_FUNDS, params)
		} catch (err) {
			console.error(err)
		}
	}

	async getAccountDetails(params) {
		try {
			// await this.validateParams(Operations.GET)
		} catch (err) {
			console.error(err)
		}
	}

	executeRequest(operation, filters) {
		return this._api.post(`/${process.env.BETFAIR_ACCOUNT_JSONRPC_ENDPOINT}`, {
			data: {
				jsonrpc: "2.0",
				method: `AccountAPING/v1.0/${operation}`,
				params: filters || {},
				id: 1
			}
		})
	}

	formatValidationErrors(error) {
		return reduce(
			errors,
			(err, acc) => {
				return `${acc}, ${err.stack}`
			},
			""
		)
	}

	validateParams(reqName, params) {
		let validation = this._validator.validate(params, OperationSchemas[reqName])

		if (validation.error && validation.errors.length) {
			throw `${reqName} errors; ${this.formatValidationErrors(validation.errors)}`
		}
	}
}
