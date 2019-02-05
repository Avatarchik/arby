export const BettingAPINGException = {
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

export const AccountAPINGException = {
    INVALID_INPUT_DATA: {
        val: "INVALID_INPUT_DATA",
        desc: "Invalid input data",
    },
    INVALID_SESSION_INFORMATION: {
        val: "INVALID_SESSION_INFORMATION",
        desc: "The session token hasn't been provided, is invalid or has expired",
    },
    UNEXPECTED_ERROR: {
        val: "UNEXPECTED_ERROR",
        desc: "An unexpected internal error occurred that prevented successful request processing",
    },
    INVALID_APP_KEY: {
        val: "INVALID_APP_KEY",
        desc: "The application key passed is invalid or is not present",
    },
    SERVICE_BUSY: {
        val: "SERVICE_BUSY",
        desc: "The service is currently too busy to service this request",
    },
    TIMEOUT_ERROR: {
        val: "TIMEOUT_ERROR",
        desc: "Internal call to downstream service timed out",
    },
    DUPLICATE_APP_NAME: {
        val: "DUPLICATE_APP_NAME",
        desc: "Duplicate application name",
    },
    APP_KEY_CREATION_FAILED: {
        val: "APP_KEY_CREATION_FAILED",
        desc: "Creating application key version has failed",
    },
    APP_CREATION_FAILED: {
        val: "APP_CREATION_FAILED",
        desc: "Application creation has been failed",
    },
    NO_SESSION: {
        val: "NO_SESSION",
        desc: "A session token header ('X-Authentication') has not been provided in the request",
    },
    NO_APP_KEY: {
        val: "NO_APP_KEY",
        desc: "An application key header ('X-Application') has not been provided in the request",
    },
    SUBSCRIPTION_EXPIRED: {
        val: "SUBSCRIPTION_EXPIRED",
        desc: "An application key is required for this operation",
    },
    INVALID_SUBSCRIPTION_TOKEN: {
        val: "INVALID_SUBSCRIPTION_TOKEN",
        desc: "The subscription token provided doesn't exist",
    },
    TOO_MANY_REQUESTS: {
        val: "TOO_MANY_REQUESTS",
        desc: "Too many requests",
    },
    INVALID_CLIENT_REF: {
        val: "INVALID_CLIENT_REF",
        desc: "Invalid length for the client reference",
    },
    WALLET_TRANSFER_ERROR: {
        val: "WALLET_TRANSFER_ERROR",
        desc: "There was a problem transferring funds between your wallets",
    },
    INVALID_VENDOR_CLIENT_ID: {
        val: "INVALID_VENDOR_CLIENT_ID",
        desc: "The vendor client ID is not subscribed to this application key",
    },
    USER_NOT_SUBSCRIBED: {
        val: "USER_NOT_SUBSCRIBED",
        desc: "The user making the request is not subscribed to the application key they are trying to perform the action on (e.g. creating an Authorisation Code)",
    },
    INVALID_SECRET: {
        val: "INVALID_SECRET",
        desc: "The vendor making the request has provided a vendor secret that does not match our records",
    },
    INVALID_AUTH_CODE: {
        val: "INVALID_AUTH_CODE",
        desc: "The vendor making the request has not provided a valid authorisation code",
    },
    INVALID_GRANT_TYPE: {
        val: "INVALID_GRANT_TYPE",
        desc: "The vendor making the request has not provided a valid grant_type, or the grant_type they have passed does not match the parameters (authCode/refreshToken)"
    }
};

export const JSON_RPCExceptions = {
    "-32700": {
        val: "-32700",
        desc: "Invalid JSON was received by the server. An error occurred on the server while parsing the JSoN text",
    },
    "-32601": {
        val: "-32601",
        desc: "Method not found",
    },
    "-32602": {
        val: "-32602",
        desc: "Problem parsing the parameters, or a mandatory parameter was not found",
    },
    "-32603": {
        val: "-32603",
        desc: "Internal JSON-RPC error"
    }
};