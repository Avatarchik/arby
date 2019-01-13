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

    this.message = `The operation ${operation} failed because: ${errorDescription}
        ${(jsonRpcException) ? ` and ${jsonRpcException}` : ""}`;
}