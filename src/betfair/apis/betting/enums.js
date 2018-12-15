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

export default {
    ORDER_PROJECTION,
    PRICE_DATA,
    MATCH_PROJECTION,
    MARKET_PROJECTION,
    MARKET_SORT
};