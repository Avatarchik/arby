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
            "$ref": "/MarketBettingType"
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
            "type": "number"
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

const LIST_MARKET_CATALOGUE = {
    "id": "/listMarketCatalogue",
    "type": "object",
    "properties": {
        "filter": {
            "$ref": "/MarketFilter"
        },
        "marketProjection": {
            "$ref": "/MarketProjection"
        },
        "sort": {
            "$ref": "/MarketSort"
        },
        "maxResults": {
            "type": "number"
        },
        "locale": {
            "type": "string"
        }
    }
};

const LIST_MARKET_BOOK = {
    "id": "/listMarketBook",
    "type": "object",
    "properties": {
        "marketIds": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "priceProjection": {
            "$ref": "/PriceProjection"
        },
        "orderProjection": {
            "$ref": "/OrderProjection"
        },
        "matchProjection": {
            "$ref": "/MatchProjection"
        },
        "includeOverallPosition": {
            "type": "boolean"
        },
        "partitionMatchedByStrategyRef": {
            "type": "boolean"
        },
        "customerStrategyRefs": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "currencyCode": {
            "type": "string"
        },
        "locale": {
            "type": "string"
        },
        "matchedSince": {
            "type": "Date"
        },
        "betIds": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    },
    "required": [
        "marketIds"
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
            "$ref": "/MarketStatus"
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
            "type": "number"
        },
        "numberOfRunners": {
            "type": "number"
        },
        "lastMatchTime": {
            "type": "string"
        },
        "totalMatched": {
            "type": "number"
        },
        "totalAvailable": {
            "type": "number"
        },
        "crossMatching": {
            "type": "boolean"
        },
        "runnersVoidable": {
            "type": "boolean"
        },
        "version": {
            "type": "number"
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
            "$ref": "/OrderType",
        },
        "sectionId": {
            "type": "string"
        },
        "handicap": {
            "type": "number"
        },
        "side": {
            "$ref": "/Side"
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

const PRICE_PROJECTION = {
    "id": "/PriceProjection",
    "type": "object",
    "properties": {
        "priceData": {
            "$ref": "/PriceData"
        },
        "exBestOffersOverrides": {
            "$ref": "/ExBestOffersOverrides"
        }
    }
};

const LIST_EVENT_TYPES = {
    "id": "/listEventTypes",
    "type": "object",
    "properties": {
        "filter": {
            "$ref": "/MarketFilter"
        },
        "locale": {
            "type": "string"
        }
    }
};

const LIST_EVENTS = {
    "id": "/listEvents",
    "type": "object",
    "properties": {
        "filter": {
            "$ref": "/MarketFilter"
        },
        "locale": {
            "type": "string"
        }
    },
    "required": [
        "filter"
    ]
};

const LIST_RUNNER_BOOK = {
    "id": "/listRunnerBook",
    "type": "object",
    "properties": {
        "marketId": {
            "type": "string"
        },
        "selectionId": {
            "type": "string"
        },
        "handicap": {
            "type": "number"
        },
        "priceProjection": {
            "$ref": "/PriceProjection"
        },
        "orderProjection": {
            "$ref": "/OrderProjection"
        },
        "matchProjection": {
            "$ref": "/MatchProjection"
        },
        "includeOverallPosition": {
            "type": "boolean"
        },
        "partitionMatchedByStrategyRef": {
            "type": "boolean"
        },
        "customerStrategyRefs": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        "currencyCode": {
            "type": "string"
        },
        "locale": {
            "type": "string"
        },
        "matchedSince": {
            "type": "Date"
        },
        "betIds": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    }
};

const EX_BEST_OFFERS_OVERRIDES = {
    "id": "/ExBestOffersOverrides",
    "type": "object",
    "properties": {
        "bestPriceDepth": {
            "type": "number"
        },
        "rollupModel": {
            "$ref": "/RollupModel"
        },
        "rollupLimit": {
            "type": "number"
        },
        "rollupLiabilityThreshold": {
            "type": "number"
        },
        "rollupLiabilityFactor": {
            "type": "number"
        }
    }
};

const LIMIT_ORDER = {
    "id": "/LimitOrder",
    "type": "object",
    "properties": {
        "size": {
            "type": "number"
        },
        "price": {
            "type": "number"
        },
        "persistenceType": {
            "$ref": "/PersistenceType"
        },
        "timeInForce": {
            "$ref": "/TimeInForce"
        },
        "minFillSize": {
            "type": "number"
        },
        "betMarketType": {
            "type": "string"
        },
        "betTargetSize": {
            "type": "number"
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
            "type": "number"
        },
        "price": {
            "type": "number"
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
            "type": "number"
        }
    },
    "required": [
        "liability"
    ]
};

const PLACE_ORDER = {
    "id": "/placeOrder",
    "type": "object",
    "properties": {
        "marketId": {
            "type": "string"
        },
        "instructions": {
            "$ref": "/PlaceInstruction"
        },
        "customerRef": {
            "type": "string"
        },
        "marketVersion": {
            "$ref": "/MarketVersion"
        },
        "customerStrategyRef": {
            "type": "string"
        },
        "async": {
            "type": "boolean"
        }
    },
    "required": [
        "marketId",
        "instructions"
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
    PLACE_ORDER,
    PRICE_PROJECTION,
    EX_BEST_OFFERS_OVERRIDES,
    TIME_RANGE,
    LIST_EVENT_TYPES,
    LIST_EVENTS,
    LIST_MARKET_BOOK,
    LIST_MARKET_CATALOGUE,
    LIST_RUNNER_BOOK
};