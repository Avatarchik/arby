import {
	BettingAPINGException as BettingEx,
	AccountAPINGException as AccountEx,
	JSON_RPCExceptions
} from "../../lib/enums/exceptions";
import { ExecutionReportErrorCode, InstructionReportErrorCode } from "../../lib/enums/betting";

function BettingException(error, operation) {
	const { errorCode } = error.data.APINGException;
    const errorDescription = BettingAPINGException[errorCode].desc;
    const jsonRpcException = JSON_RPCExceptions[String(error.code)].desc;

    this.code = errorCode;
    this.operation = operation;
    this.message = `The operation ${operation} failed because: ${errorDescription}${(jsonRpcException) ? ` and ${jsonRpcException}` : ""}`;
    this.stack = new Error().stack;
}

function AccountException(error, operation) {
	const { errorCode } = error.data.AccountAPINGException;
	const errorDescription = AccountAPINGException[errorCode].desc;

	this.code = errorCode;
	this.operation = operation;
	this.message = `The operation ${operation} failed because: ${errorDescription}`;
	this.stack = new Error().stack;
}

function PlaceExecutionReport(error, operation) {
    const { errorCode } = error;
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

export function getException(err, params, type) {
	// For some reason the spread operator does not work with 'err'
	// Most likely because this is sometimes an instance of Error and not a 'true' object
	return {
		code: err.code,
		message: err.message,
		stack: err.stack,
		operation: err.operation,
		params,
		type
	};

}

export function checkForException(resp, operation, type) {
	if (resp.data.error) {
		if (type === "account") {
			throw new AccountException(resp.data.error, operation);
		} else if (type === "betting") {
			throw new BettingException(resp.data.error, operation);
		}
	}

	if ((resp.data.result instanceof Array && !resp.data.result.length)
		|| (resp.data.result instanceof Object && !Object.keys(resp.data.result).length)) {
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

function handleAccountException(err) {
	const { code, message, params, operation } = err;

	switch (code) {
		case AccountEx.INVALID_SESSION_INFORMATION.val:
			break;
	}

}

function handleBettingException(err) {
	const { code, message, params, operation } = err;

	switch (code) {

	}
}

export function handleApiException(err) {
	const { code, message, stack, type } = err;

    try {
		if (code) {
			if (type === "account") {
				handleAccountException(err);
			} else if (type === "betting") {
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
	} catch(err) {
		fixApiCall(err);
	}
}