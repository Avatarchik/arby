import {
	BettingAPINGException as BettingEx,
	AccountAPINGException as AccountEx,
	JSON_RPCExceptions
} from "../../../lib/enums/exchanges/betfair/exceptions";
import {
	ExecutionReportErrorCode,
	InstructionReportErrorCode
} from "../../../lib/enums/exchanges/betfair/betting";
import BetfairConfig from "./config";

function BettingException(error, operation) {
	const {
		errorCode
	} = error.data.APINGException;
	const errorDescription = BettingAPINGException[errorCode].desc;
	const jsonRpcException = JSON_RPCExceptions[String(error.code)].desc;

	this.code = errorCode;
	this.operation = operation;
	this.message = `The operation ${operation} failed because: ${errorDescription}${(jsonRpcException) ? ` and ${jsonRpcException}` : ""}`;
	this.stack = new Error().stack;
}

function AccountException(error, operation) {
	const {
		errorCode
	} = error.data.AccountAPINGException;
	const errorDescription = AccountAPINGException[errorCode].desc;

	this.code = errorCode;
	this.operation = operation;
	this.message = `The operation ${operation} failed because: ${errorDescription}`;
	this.stack = new Error().stack;
}

function PlaceExecutionReport(error, operation) {
	const {
		errorCode
	} = error;
	const errorDescription = ExecutionReportErrorCode[errorCode].desc;

	let instructionReportErrors = [];

	if (error.instructionReports) {
		error.instructionReports.forEach(report => instructionReportErrors.push(InstructionReportErrorCode[report.errorCode].desc));
	}

	this.code = errorCode;
	this.operation = operation;
	this.message = `The operation ${operation} failed because: ${errorDescription}${(instructionReportErrors.length) ? ` with the instruction error(s): ${JSON.stringify(instructionReportErrors)}` : ""}`;
	this.stack = new Error().stack;
};

export function getException(details) {
	// For some reason the spread operator does not work with 'err'
	// Most likely because this is sometimes an instance of Error and not a 'true' object
	return {
		code: (details.err) ? (details.err.code || "-") : "-",
		message: (details.err) ? (details.err.message || "-") : "-",
		stack: (details.err) ? (details.err.stack || "-") : "-",
		operation: (details.err) ? (details.err.operation || "-") : "-",
		params: (details.params || "-"),
		type: (details.type || "-"),
		funcName: (details.funcName || "-"),
		args: (details.args || "-")
	};

}

export function checkForException(resp, operation, type) {
	if (resp.data.error) {
		if (type === "Account") {
			throw new AccountException(resp.data.error, operation);
		} else if (type === "Betting") {
			throw new BettingException(resp.data.error, operation);
		}
	}

	if ((resp.data.result instanceof Array && !resp.data.result.length) ||
		(resp.data.result instanceof Object && !Object.keys(resp.data.result).length)) {
		throw {
			code: "NO_DATA",
			operation,
			message: "There were no results retrieved from this operation",
			stack: new Error().stack
		}
	}

	if (resp.data.result.status === "FAILURE") {
		throw new PlaceExecutionReport(resp.data.result, operation)
	}
}

function retryOperation() {

}

function handleAccountException(err) {
	const betfairConfig = new BetfairConfig();
	const {
		code,
		message,
		params,
		operation,
		funcName,
		args
	} = err;

	switch (code) {
		case AccountEx.INVALID_SESSION_INFORMATION.val:
			betfairConfig.login();
			break;
	}
	retryOperation();
}

function handleBettingException(err) {
	const {
		code,
		message,
		params,
		operation
	} = err;

	switch (code) {

	}
}

export function handleApiException(err) {
	const {
		code,
		message,
		stack,
		type
	} = err;

	try {
		if (code) {
			if (type === "Account") {
				handleAccountException(err);
			} else if (type === "Betting") {
				handleBettingException(err);
			}
			switch (code) {
				// MarketFilter has too little restrictions
				case "TOO_MUCH_DATA":
					// console.log(error);
					// marketFilter.addFilter(bettingApi);
					// await placeBets()
					break;
				case "INSUFFICIENT_FUNDS":
					// Inform user...AWS SES?
					break;
				default:
					break;
			}
		}
		// Standard API error not one built by me
		console.error(message);
		console.error(stack);
	} catch (err) {
		fixApiCall(err);
	}
}