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
                "$ref": "/MarketBettingTypes"
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
            "type": "string"
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
    }
};

const PLACE_INSTRUCTION = {
    "id": "/PlaceInstruction",
    "type": "object",
    "properties": {
        "orderType": {
            "$ref": "/OrderType"
        },
        "sectionId": {
            "type": "string"
        },
        "handicap": {
            "type": "integer"
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
    }
}

export default {
    MARKET_FILTER,
    MARKET_CATALOGUE,
    MARKET_BOOK,
    PLACE_INSTRUCTION
};