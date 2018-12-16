const ORDER_PROJECTION = {
    "id": "/OrderProjection",
    "type": "array",
    "items": {
        "type": "string",
        "enum": [
            "ALL",
            "EXECUTABLE",
            "EXECUTION_COMPLETE"
        ]
    }
};

const MATCH_PROJECTION = {
    "id": "/MatchProjection",
    "type": "array",
    "items": {
        "type": "string",
        "enum": [
            "NO_ROLLUP",
            "ROLLED_UP_BY_PRICE",
            "ROLLED_UP_BY_AVG_PRICE"
        ]
    }
};

const MARKET_PROJECTION = {
    "id": "/MarketProjection",
    "type": "array",
    "items": {
        "type": "string",
        "enum": [
            "COMPETITION",
            "EVENT",
            "EVENT_TYPE",
            "MARKET_START_TIME",
            "MARKET_DESCRIPTION",
            "RUNNER_DESCRIPTION",
            "RUNNER_METADATA"
        ]
    }
};

const MARKET_SORT = {
    "id": "/MarketSort",
    "type": "array",
    "items": {
        "type": "string",
        "enum": [
            "MINIMUM_TRADED",
            "MAXIMUM_TRADED",
            "MINIMUM_AVAILABLE",
            "MAXIMUM_AVAILABLE",
            "FIRST_TO_START",
            "LAST_TO_START"
        ]
    }
};

const PRICE_DATA = {
    "id": "/PriceData",
    "type": "array",
    "items": {
        "type": "string",
        "enum": [
            "SP_AVAILABLE",
            "SP_TRADED",
            "EX_BEST_OFFERS",
            "EX_ALL_OFFERS",
            "EX_TRADED"
        ]
    }
};

const MARKET_BETTING_TYPE = {
    "id": "/MarketBettingType",
    "type": "array",
    "items": {
        "type": "string",
        "enum": [
            "ODDS",
            "LINE",
            "RANGE",
            "ASIAN_HANDICAP_DOUBLE_LINE",
            "ASIAN_HANDICAP_SINGLE_LINE",
            "FIXED_ODDS"
        ]
    }
};

const MARKET_STATUS = {
    "id": "/MarketStatus",
    "type": "array",
    "items": {
        "type": "string",
        "enum": [
            "INACTIVE",
            "OPEN",
            "SUSPENDED",
            "CLOSED"
        ]
    }
};

const ORDER_TYPE = {
    "id": "/OrderType",
    "type": "array",
    "items": {
        "type": "string",
        "enum": [
            "LIMIT",
            "LIMIT_ON_CLOSE",
            "MARKET_ON_CLOSE"
        ]
    }
};

const SIDE = {
    "id": "/Side",
    "type": "array",
    "items": {
        "type": "string",
        "enum": [
            "BACK",
            "LAY"
        ]
    }
};

const PERSISTENCE_TYPE = {
    "id": "/PersistenceType",
    "type": "array",
    "items": {
        "type": "string",
        "enum": [
            "LAPSE",
            "PERSIST",
            "MARKET_ON_CLOSE"
        ]
    }
};

const TIME_IN_FORCE = {
    "id": "/TimeInForce",
    "type": "array",
    "items": {
        "type": "string",
        "enum": [
            "FILL_OR_KILL"
        ]
    }
};

export default {
    ORDER_PROJECTION,
    ORDER_TYPE,
    PERSISTENCE_TYPE,
    PRICE_DATA,
    MARKET_BETTING_TYPE,
    MATCH_PROJECTION,
    MARKET_PROJECTION,
    MARKET_SORT,
    MARKET_STATUS,
    SIDE,
    TIME_IN_FORCE
};