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
                    "ASIAN_HANDICAP_number_LINE",
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
            "type": "number"
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

const PRICE_PROJECTION = {
    "id": "/PriceProjection",
    "type": "object",
    "properties": {
        "priceData": {
            "type": "array",
            "items": {
                "$ref": "/PriceData"
            }
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
}

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

export default {
    LIMIT_ON_CLOSE_ORDER,
    LIMIT_ORDER,
    MARKET_BOOK,
    MARKET_CATALOGUE,
    MARKET_FILTER,
    MARKET_ON_CLOSE_ORDER,
    PLACE_INSTRUCTION,
    PRICE_PROJECTION,
    EX_BEST_OFFERS_OVERRIDES,
    TIME_RANGE,
    LIST_EVENT_TYPES,
    LIST_EVENTS,
    LIST_MARKET_CATALOGUE
};