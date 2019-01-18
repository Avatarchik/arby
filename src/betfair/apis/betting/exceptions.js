const APINGExceptions = {
    TOO_MUCH_DATA: "The operation requested too much data, exceeding the Market Data Request Limits",
    INVALID_INPUT_DATA: "The data input is invalid. A specific description is returned via errorDetails as shown below",
    INVALID_SESSION_INFORMATION: "The session token hasn't been provided, is invalid or has expired",
    NO_APP_KEY: "An application key header ('X-Application') has not been provided in the request",
    NO_SESSION: "A session token header ('X-Authentication') has not been provided in the request",
    UNEXPECTED_ERROR: "An unexpected internal error occurred that prevented successful request processing",
    INVALID_APP_KEY: "The application key passed is invalid or is not present",
    TOO_MANY_REQUESTS: "There are too many pending requests (e.g. a listMarketBook) with Order/Match projections to 3 concurrent requests."
        + "The error also applies to; listCurrentOrders, listMarketProfitAndLoss and listClearedOrders if you have 3 or more requests currently in execution",
    SERVICE_BUSY: "The service is currently too busy to service this request",
    TIMEOUT_ERROR: "The internal call to downstream service timed out. Please note: If a TIMEOUT_ERROR error occurs on a placeOrders/replaceOrders request "
        + "you should check listCurrentOrders to verify the status of your bets before placing further orders. Please allow up to 2 minutes for times out order to appear",
    REQUEST_SIZE_EXCEEDS_LIMIT: "The request exceeds the request size limit. Requests are limited to a total of 250 betId's/marketId's (or a combination of both)",
    ACCESS_DENIED: "The calling client is not permitted to perform the specific action (e.g. they have an App Key restriction in place or attempting to place a bet from a restricted jurisdiction)"
};

const InstructionReportErrorCode = {
    INVALID_BET_SIZE: "Bet size is invalid for your currency or your regulator",
    INVALID_RUNNER: "Runner does not exist, includes vacant traps in greyhound racing",
    BET_TAKEN_OR_LAPSED: "Bet cannot be cancelled or modified as it has already been taken or has been cancelled/lapsed Includes attempts to cancel/modify market on close BSP bets and cancelling limit on close BSP bets. The error may be returned on placeOrders request if for example a bet is placed at the point when a market admin event takes place (i.e. market is turned in-play)",
    BET_IN_PROGRESS: "No result was received from the matcher in a timeout configured for the system",
    RUNNER_REMOVED: "Runner has been removed from the event",
    MARKET_NOT_OPEN_FOR_BETTING: "Attempt to edit a bet on a market that has closed.",
    LOSS_LIMIT_EXCEEDED: "The action has caused the account to exceed the self imposed loss limit",
    MARKET_NOT_OPEN_FOR_BSP_BETTING: "Market now closed to bsp betting. Turned in-play or has been reconciled",
    INVALID_PRICE_EDIT: "Attempt to edit down the price of a bsp limit on close lay bet, or edit up the price of a limit on close back bet",
    INVALID_ODDS: "Odds not on price ladder - either edit or placement",
    INSUFFICIENT_FUNDS: "Insufficient funds available to cover the bet action. Either the exposure limit or available to bet limit would be exceeded",
    INVALID_PERSISTENCE_TYPE: "Invalid persistence type for this market, e.g. KEEP for a non in-play market.",
    ERROR_IN_MATCHER: "A problem with the matcher prevented this action completing successfully",
    INVALID_BACK_LAY_COMBINATION: "The order contains a back and a lay for the same runner at overlapping prices. This would guarantee a self match. This also applies to BSP limit on close bets",
    ERROR_IN_ORDER: "The action failed because the parent order failed",
    INVALID_BID_TYPE: "Bid type is mandatory",
    INVALID_BET_ID: "Bet for id supplied has not been found",
    CANCELLED_NOT_PLACED: "Bet cancelled but replacement bet was not placed",
    RELATED_ACTION_FAILED: "Action failed due to the failure of a action on which this action is dependent",
    NO_ACTION_REQUIRED: "The action does not result in any state change. eg changing a persistence to it's current value",
    TIME_IN_FORCE_CONFLICT: "You may only specify a time in force on either the place request OR on individual limit order instructions (not both), since the implied behaviors are incompatible.",
    UNEXPECTED_PERSISTENCE_TYPE: "You have specified a persistence type for a FILL_OR_KILL order, which is nonsensical because no umatched portion can remain after the order has been placed.",
    INVALID_ORDER_TYPE: "You have specified a time in force of FILL_OR_KILL, but have included a non-LIMIT order type.",
    UNEXPECTED_MIN_FILL_SIZE: "You have specified a minFillSize on a limit order, where the limit order's time in force is not FILL_OR_KILL. Using minFillSize is not supported where the time in force of the request (as opposed to an order) is FILL_OR_KILL.",
    INVALID_CUSTOMER_ORDER_REF: "The supplied customer order reference is too long.",
    INVALID_MIN_FILL_SIZE: "The minFillSize must be greater than zero and less than or equal to the order's size. The minFillSize cannot be less than the minimum bet size for your currency",
    BET_LAPSED_PRICE_IMPROVEMENT_TOO_LARGE: "Your bet is lapsed. There is better odds than requested available in the market, but your preferences don't allow the system to match your bet against better odds. Change your betting preferences to accept better odds if you don't want to receive this error."
};

const ExecutionReportErrorCodes = {
    ERROR_IN_MATCHER: "The matcher is not healthy",
    PROCESSED_WITH_ERRORS: "The order itself has been accepted, but at least one (possibly all) actions have generated errors",
    BET_ACTION_ERROR: "There is an error with an action that has caused the entire order to be rejected. Check the instructionReports errorCode for the reason for the rejection of the order.",
    INVALID_ACCOUNT_STATE: "Order rejected due to the account's status (suspended, inactive, dup cards)",
    INVALID_WALLET_STATUS: "Order rejected due to the account's wallet's status",
    INSUFFICIENT_FUNDS: "Account has exceeded its exposure limit or available to bet limit",
    LOSS_LIMIT_EXCEEDED: "The account has exceed the self imposed loss limit",
    MARKET_SUSPENDED: "Market is suspended",
    MARKET_NOT_OPEN_FOR_BETTING: "Market is not open for betting. It is either not yet active, suspended or closed awaiting settlement.",
    DUPLICATE_TRANSACTION: "Duplicate customer reference data submitted - Please note: There is a time window associated with the de-duplication of duplicate submissions which is 60 second",
    INVALID_ORDER: "Order cannot be accepted by the matcher due to the combination of actions. For example, bets being edited are not on the same market, or order includes both edits and placement",
    INVALID_MARKET_ID: "Market doesn't exist",
    PERMISSION_DENIED: "Business rules do not allow order to be placed. You are either attempting to place the order using a Delayed Application Key or from a restricted jurisdiction (i.e. USA)",
    DUPLICATE_BETIDS: "Duplicate Bet IDs found",
    NO_ACTION_REQUIRED: "Order hasn't been passed to matcher as system detected there will be no state change",
    SERVICE_UNAVAILABLE: "The requested service is unavailable",
    REJECTED_BY_REGULATOR: "The regulator rejected the order. On the Italian Exchange this error will occur if more than 50 bets are sent in a single placeOrders request.",
    NO_CHASING: "A specific error code that relates to Spanish Exchange markets only which indicates that the bet placed contravenes the Spanish regulatory rules relating to loss chasing.",
    REGULATOR_IS_NOT_AVAILABLE: "The underlying regulator service is not available.",
    TOO_MANY_INSTRUCTIONS: "The amount of orders exceeded the maximum amount allowed to be executed",
    INVALID_MARKET_VERSION: "The supplied market version is invalid. Max length allowed for market version is 12."
};

const JSON_RPCExceptions = {
    "-32700": "Invalid JSON was received by the server. An error occurred on the server while parsing the JSoN text",
    "-32601": "Method not found",
    "-32602": "Problem parsing the parameters, or a mandatory parameter was not found",
    "-32603": "Internal JSON-RPC error"
};

export function APINGException(error, operation) {
    const { errorCode } = error.data.APINGException;
    const errorDescription = APINGExceptions[errorCode];
    const jsonRpcException = JSON_RPCExceptions[String(error.code)];

    this.code = errorCode;
    this.operation = operation;
    this.message = `The operation ${operation} failed because: ${errorDescription}${(jsonRpcException) ? ` and ${jsonRpcException}` : ""}`;
    this.stack = new Error().stack;
};

export function PlaceExecutionReport(error, operation) {
    const { errorCode } = error;
    const errorDescription = ExecutionReportErrorCodes[errorCode];

    let instructionReportErrors = [];

    if (error.instructionReports) {
        error.instructionReports.forEach(report => instructionReportErrors.push(InstructionReportErrorCode[report.errorCode]));
    }

    this.code = errorCode;
    this.operation = operation;
    this.message = `The operation ${operation} failed because: ${errorDescription}${(instructionReportErrors.length) ? ` with the instruction error(s): ${JSON.stringify(instructionReportErrors)}` : ""}`;
    this.stack = new Error().stack;
};