const MARKET_FILTER = {
    "id": "/MarketFilter",
    "type": "object",
    "properties": {
        "textQuery": {
            "type": "string"
        },
        "eventTypeIds": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "eventIds": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "competitionIds": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "marketIds": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "venues": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "bspOnly": {
            "type": "boolean"
        },
        "turnInPlayEnabled": {
            "type": "boolean"
        },
        "inPlayOnly": {
            "type": "boolean"
        },
        "marketBettingTypes": {
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
        },
        "marketCountries": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "marketTypeCodes": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "marketStartTime": {
            "$ref": "/TimeRange"
        },
        "withOrders": {
            "type": "string",
            "items": {
                "$ref": "/OrderStatus"
            }
        },
        "raceTypes": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    }
};

const TIME_RANGE = {
    "id": "/TimeRange",
    "type": "object",
    "properties": {
        "from": {
            "type": "Date"
        },
        "to": {
            "type": "Date"
        }
    }
};

const MARKET_CATALOGUE = {
    "id": "/MarketCatalogue",
    "type": "object",
    "properties": {
        "marketId": {
            "type": "string"
        },
        "marketName": {
            "type": "string"
        },
        "marketStartTime": {
            "type": "string"
        },
        "description": {
            "$ref": "/MarketDescription"
        },
        "totalMatched": {
            "type": "integer"
        },
        "runners": {
            "$ref": "/RunnerCatalog"
        },
        "eventType": {
            "$ref": "/EventType"
        },
        "competition": {
            "$ref": "/Competition"
        },
        "event": {
            "$ref": "/Event"
        }
    },
    "required": [
        "marketId",
        "marketName"
    ]
};

const MARKET_BOOK = {
    "id": "/MarketBook",
    "type": "object",
    "properties": {
        "marketId": {
            "type": "string"
        },
        "isMarketDataDelayed": {
            "type": "boolean"
        },
        "status": {
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
        },
        "betDelay": {
            "type": "boolean"
        },
        "bspReconciled": {
            "type": "boolean"
        },
        "complete": {
            "type": "boolean"
        },
        "inplay": {
            "type": "boolean"
        },
        "numberOfWinners": {
            "type": "integer"
        },
        "numberOfRunners": {
            "type": "integer"
        },
        "lastMatchTime": {
            "type": "string"
        },
        "totalMatched": {
            "type": "integer"
        },
        "totalAvailable": {
            "type": "integer"
        },
        "crossMatching": {
            "type": "boolean"
        },
        "runnersVoidable": {
            "type": "boolean"
        },
        "version": {
            "type": "integer"
        },
        "runners": {
            "type": "array",
            "items": {
                "$ref": "/Runners"
            }
        },
        "keyLineDescription": {
            "$ref": "/KeyLineDescription"
        }
    },
    "required": [
        "marketId",
        "isMarketDataDelayed"
    ]
};

const PLACE_INSTRUCTION = {
    "id": "/PlaceInstruction",
    "type": "object",
    "properties": {
        "orderType": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": [
                    "LIMIT",
                    "LIMIT_ON_CLOSE"
                ]
            }
        },
        "sectionId": {
            "type": "string"
        },
        "handicap": {
            "type": "integer"
        },
        "side": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": [
                    "BACK",
                    "LAY"
                ]
            }
        },
        "limitOrder": {
            "$ref": "/LimitOrder"
        },
        "limitOnCloseOrder": {
            "$ref": "/LimitOnCloseOrder"
        },
        "marketOnCloseOrder": {
            "$ref": "/MarketOnCloseOrder"
        },
        "customerOrderRef": {
            "type": "string"
        }
    },
    "required": [
        "orderType",
        "selectionId",
        "side"
    ]
};

const LIMIT_ORDER = {
    "id": "/LimitOrder",
    "type": "object",
    "properties": {
        "size": {
            "type": "double"
        },
        "price": {
            "type": "double"
        },
        "persistanceType": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": [
                    "LAPSE",
                    "PERSIST",
                    "MARKET_ON_CLOSE"
                ]
            }
        },
        "timeInForce": {
            "type": "array",
            "items": {
                "type": "string",
                "enum": [
                    "FILL_OR_KILL"
                ]
            }
        },
        "minFillSize": {
            "type": "double"
        },
        "betMarketType": {
            "type": "string"
        },
        "betTargetSize": {
            "type": "double"
        }
    },
    "required": [
        "size",
        "price",
        "persistenceType"
    ]
};

const LIMIT_ON_CLOSE_ORDER = {
    "id": "/LimitOnCloseOrder",
    "type": "object",
    "properties": {
        "liability": {
            "type": "double"
        },
        "price": {
            "type": "double"
        }
    },
    "required": [
        "liability",
        "price"
    ]
};

const MARKET_ON_CLOSE_ORDER = {
    "id": "/MarketOnCloseOrder",
    "type": "object",
    "properties": {
        "liability": {
            "type": "double"
        }
    },
    "required": [
        "liability"
    ]
};

export default {
    LIMIT_ON_CLOSE_ORDER,
    LIMIT_ORDER,
    MARKET_BOOK,
    MARKET_CATALOGUE,
    MARKET_FILTER,
    MARKET_ON_CLOSE_ORDER,
    PLACE_INSTRUCTION,
    TIME_RANGE
};