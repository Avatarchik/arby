export const APINGException = {
    TOO_MUCH_DATA: {
        val: "TOO_MUCH_DATA",
        desc: "The operation requested too much data, exceeding the Market Data Request Limits",
    },
    INVALID_INPUT_DATA: {
        val: "INVALID_INPUT_DATA",
        desc: "The data input is invalid. A specific description is returned via errorDetails as shown below",
    },
    INVALID_SESSION_INFORMATION: {
        val: "INVALID_SESSION_INFORMATION",
        desc: "The session token hasn't been provided, is invalid or has expired",
    },
    NO_APP_KEY: {
        val: "NO_APP_KEY",
        desc: "An application key header ('X-Application') has not been provided in the request",
    },
    NO_SESSION: {
        val: "NO_SESSION",
        desc: "A session token header ('X-Authentication') has not been provided in the request",
    },
    UNEXPECTED_ERROR: {
        val: "UNEXPECTED_ERROR",
        desc: "An unexpected internal error occurred that prevented successful request processing",
    },
    INVALID_APP_KEY: {
        val: "INVALID_APP_KEY",
        desc: "The application key passed is invalid or is not present",
    },
    TOO_MANY_REQUESTS: {
        val: "TOO_MANY_REQUESTS",
        desc: "There are too many pending requests (e.g. a listMarketBook) with Order/Match projections to 3 concurrent requests."
        + "The error also applies to; listCurrentOrders, listMarketProfitAndLoss and listClearedOrders if you have 3 or more requests currently in execution",
    },
    SERVICE_BUSY: {
        val: "SERVICE_BUSY",
        desc: "The service is currently too busy to service this request",
    },
    TIMEOUT_ERROR: {
        val: "TIMEOUT_ERROR",
        desc: "The internal call to downstream service timed out. Please note: If a TIMEOUT_ERROR error occurs on a placeOrders/replaceOrders request "
        + "you should check listCurrentOrders to verify the status of your bets before placing further orders. Please allow up to 2 minutes for times out order to appear",
    },
    REQUEST_SIZE_EXCEEDS_LIMIT: {
        val: "REQUEST_SIZE_EXCEEDS_LIMIT",
        desc: "The request exceeds the request size limit. Requests are limited to a total of 250 betId's/marketId's (or a combination of both)",
    },
    ACCESS_DENIED: {
        val: "ACCESS_DENIED",
        desc: "The calling client is not permitted to perform the specific action (e.g. they have an App Key restriction in place or attempting to place a bet from a restricted jurisdiction)"
    }
};