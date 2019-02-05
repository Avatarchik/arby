const login = {
    "id": "/login",
    "type": "object",
    "properties": {
        "username": {
            "type": "string"
        },
        "password": {
            "type": "string"
        }
    },
    "required": [
        "username",
        "password"
    ]
};

const getSports = {
    "id": "/getSports",
    "type": "object",
    "properties": {
        "offset": {
            "type": "number"
        },
        "per-page": {
            "type": "number"
        },
        "order": {
            "$ref": "/Order"
        },
        "status": {
            "type": "string"
        }
    }
};

const getNavigation = {
    "id": "/getNavigation",
    "type": "object",
    "properties": {
        "offset": {
            "type": "number"
        },
        "per-page": {
            "type": "number"
        }
    }
};

const getEvents = {
    "id": "/getEvents",
    "type": "object",
    "properties": {
        "offset": {
            "type": "number"
        },
        "per-page": {
            "type": "number"
        },
        "after": {
            "type": "string"
        },
        "before": {
            "type": "string"
        },
        "category-ids": {
            "type": "string"
        },
        "ids": {
            "type": "string"
        },
        "sport-ids": {
            "type": "string"
        },
        "states": {
            "type": "string"
        },
        "tag-url-names": {
            "type": "string"
        },
        "exchange-type": {
            "$ref": "/ExchangeType"
        },
        "odds-type": {
            "$ref": "/OddsType"
        },
        "include-prices": {
            "type": "boolean"
        },
        "price-depth": {
            "type": "number"
        },
        "price-mode": {
            "$ref": "/PriceMode"
        },
        "side": {
            "$ref": "/Side"
        },
        "currency": {
            "$ref": "/Currency"
        },
        "minimum-liquidity": {
            "type": "number"
        },
        "include-event-participants": {
            "type": "boolean"
        }
    }
};

const getEvent = {
    "id": "/getEvent",
    "type": "object",
    "properties": {
        "exchange-type": {
            "$ref": "/ExchangeType"
        },
        "odds-type": {
            "$ref": "/OddsType"
        },
        "include-prices": {
            "type": "boolean"
        },
        "price-depth": {
            "type": "number"
        },
        "price-mode": {
            "$ref": "/PriceMode"
        },
        "side": {
            "$ref": "/Side"
        },
        "currency": {
            "$ref": "/Currency"
        },
        "minimum-liquidity": {
            "type": "number"
        },
        "include-event-participants": {
            "type": "boolean"
        }
    }
};

const getMarkets = {
    "id": "/getMarkets",
    "type": "object",
    "properties": {
        "offset": {
            "type": "number"
        },
        "per-page": {
            "type": "number"
        },
        "names": {
            "type": "string"
        },
        "states": {
            "type": "string"
        },
        "types": {
            "type": "string"
        },
        "exchange-type": {
            "$ref": "/ExchangeType"
        },
        "odds-type": {
            "$ref": "/OddsType"
        },
        "include-prices": {
            "type": "boolean"
        },
        "price-depth": {
            "type": "number"
        },
        "price-mode": {
            "$ref": "/PriceMode"
        },
        "side": {
            "$ref": "/Side"
        },
        "currency": {
            "$ref": "/Currency"
        },
        "minimum-liquidity": {
            "type": "number"
        },
        "include-event-participants": {
            "type": "boolean"
        }
    }
};

const getMarket = {
    "id": "/getMarket",
    "type": "object",
    "properties": {
        "exchange-type": {
            "$ref": "/ExchangeType"
        },
        "odds-type": {
            "$ref": "/OddsType"
        },
        "include-prices": {
            "type": "boolean"
        },
        "price-depth": {
            "type": "number"
        },
        "price-mode": {
            "$ref": "/PriceMode"
        },
        "side": {
            "$ref": "/Side"
        },
        "currency": {
            "$ref": "/Currency"
        },
        "minimum-liquidity": {
            "type": "number"
        },
        "include-event-participants": {
            "type": "boolean"
        }
    }
};

const getRunners = {
    "id": "/getRunners",
    "type": "object",
    "properties": {
        "states": {
            "type": "string"
        },
        "exchange-type": {
            "$ref": "/ExchangeType"
        },
        "odds-type": {
            "$ref": "/OddsType"
        },
        "include-prices": {
            "type": "boolean"
        },
        "include-withdrawn": {
            "type": "boolean"
        },
        "price-depth": {
            "type": "number"
        },
        "price-mode": {
            "$ref": "/PriceMode"
        },
        "side": {
            "$ref": "/Side"
        },
        "currency": {
            "$ref": "/Currency"
        },
        "minimum-liquidity": {
            "type": "number"
        }
    }
};

const getRunner = {
    "id": "/getRunner",
    "type": "object",
    "properties": {
        "exchange-type": {
            "$ref": "/ExchangeType"
        },
        "odds-type": {
            "$ref": "/OddsType"
        },
        "include-prices": {
            "type": "boolean"
        },
        "price-depth": {
            "type": "number"
        },
        "price-mode": {
            "$ref": "/PriceMode"
        },
        "side": {
            "$ref": "/Side"
        },
        "currency": {
            "$ref": "/Currency"
        },
        "minimum-liquidity": {
            "type": "number"
        }
    }
};

const getPrices = {
    "id": "/getPrices",
    "type": "object",
    "properties": {
        "exchange-type": {
            "$ref": "/ExchangeType"
        },
        "odds-type": {
            "$ref": "/OddsType"
        },
        "depth": {
            "type": "number"
        },
        "price-mode": {
            "$ref": "/PriceMode"
        },
        "side": {
            "$ref": "/Side"
        },
        "currency": {
            "$ref": "/Currency"
        },
        "minimum-liquidity": {
            "type": "number"
        }
    }
};

const getPopularMarkets = {
    "id": "/getPopularMarkets",
    "type": "object",
    "properties": {
        "exchange-type": {
            "$ref": "/ExchangeType"
        },
        "odds-type": {
            "$ref": "/OddsType"
        },
        "price-depth": {
            "type": "number"
        },
        "price-mode": {
            "$ref": "/PriceMode"
        },
        "side": {
            "$ref": "/Side"
        },
        "currency": {
            "$ref": "/Currency"
        },
        "minimum-liquidity": {
            "type": "number"
        },
        "old-format": {
            "type": "boolean"
        }
    }
};

const getPopularSports = {
    "id": "/getPopularSports",
    "type": "object",
    "properties": {
        "num-sports": {
            "type": "number"
        }
    }
};

export default {
    login,
    getSports,
    getPopularMarkets,
    getPopularSports,
    getPrices,
    getRunner,
    getRunners,
    getEvent,
    getEvents,
    getMarket,
    getMarkets,
    getNavigation
};