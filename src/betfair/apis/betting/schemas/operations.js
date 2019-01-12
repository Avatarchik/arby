const listMarketCatalogue = {
    "id": "/listMarketCatalogue",
    "type": "object",
    "properties": {
        // Filter to select desired markets. All markets that match the criteria in filter are selected
        "filter": {
            "$ref": "/MarketFilter"
        },
        // Type and amount of data returned in about the market
        "marketProjection": {
            "$ref": "/MarketProjection"
        },
        // Order of the results. Will default to RANK if not passed. RANK is an assigned priority that is determined by our Market Operations team in our back-end system
        // A result's overall rank is derived from the ranking given to the following attributes for the result; EventType, Competition, StartTime, MarketType, MarketId.
        // For example, EventType is ranked by the most popular sports types and marketTypes are ranked in the following order; ODDS, ASIAN, LINE, RANGE.
        // If all other dimensions of the result are equal, then the results are ranked in the MarketId order
        "sort": {
            "$ref": "/MarketSort"
        },
        // Limit on the total number of results returned (> 0 && <= 1000)
        "maxResults": {
            "type": "number"
        },
        // Language used for the response. If not specified, the default is returned
        "locale": {
            "type": "string"
        }
    }
};

const listMarketBook = {
    "id": "/listMarketBook",
    "type": "object",
    "properties": {
        // 1+ market IDs. The number of markets returned depends on the amount of data you request via the priceProjection
        "marketIds": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        // Projection of price data you want to receive in the response
        "priceProjection": {
            "$ref": "/PriceProjection"
        },
        // Orders you want to receive in the response
        "orderProjection": {
            "$ref": "/OrderProjection"
        },
        // If you ask for orders, specifies the representation of matches
        "matchProjection": {
            "$ref": "/MatchProjection"
        },
        // If you ask for orders, returns matches for each selection. Defaults to 'true' if unspecified
        "includeOverallPosition": {
            "type": "boolean"
        },
        // If you ask for orders, returns the breakdown of matches by strategy for each selection. Defaults to 'false' if unspecified
        "partitionMatchedByStrategyRef": {
            "type": "boolean"
        },
        // If you ask for orders, restricts the results to orders matching any of the specified set of customer defined strategies
        // Also filters which matches by strategy for selections are returned, if 'partitionMatchedByStrategyRef' is 'true'
        // An empty set will be treated as if the parameter haz been omitted (or null passed)
        "customerStrategyRefs": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        // A Betfair standard currency code. If not specified, the default currency code is used
        "currencyCode": {
            "type": "string"
        },
        // Language used for the response. If not specified, the default is returned
        "locale": {
            "type": "string"
        },
        // If you ask for orders, restricts the results to orders that have at least 1 fragment matched since the specified data (all matched fragments of such an order will be returned even if some were matched before the specified date)
        // All EXECUTABLE orders will be returned regardless of matched date
        "matchedSince": {
            "type": "Date"
        },
        // If you ask for orders, restricts the results to orders with the specified bet IDs. Omitting this parameter means that all bets will be included in the response
        // Maximum of 250 betId's can be supplied at a time
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

const listEventTypes = {
    "id": "/listEventTypes",
    "type": "object",
    "properties": {
        // Filter to select desired markets
        // All markets that match criteria in the filter are selected
        "filter": {
            "$ref": "/MarketFilter"
        },
        // Language used for the response. If not specified, the default is returned
        "locale": {
            "type": "string"
        }
    }
};

const listEvents = {
    "id": "/listEvents",
    "type": "object",
    "properties": {
        // Filter to select desired markets
        // All markets that match criteria in the filter are selected
        "filter": {
            "$ref": "/MarketFilter"
        },
        // Language used for the response. If not specified, the default is returned
        "locale": {
            "type": "string"
        }
    },
    "required": [
        "filter"
    ]
};

const listRunnerBook = {
    "id": "/listRunnerBook",
    "type": "object",
    "properties": {
        // The unique identifier for the market. MarketId's are prefixed with '1.' or '2.' ('1.' = UK Exchange, '2.' = AUS Exchange) 
        "marketId": {
            "type": "string"
        },
        // The unique identified for the selection in the market
        "selectionId": {
            "type": "string"
        },
        // The handicap associated with the runner in case of Asian handicap markets (i.e. marketTypes: ASIAN_HANDICAP_DOUBLE_LINE, ASIAN_HANDICAP_SINGLE_LINE)
        // Null otherwise
        "handicap": {
            "type": "number"
        },
        // Projection of price data you want to receive in the response
        "priceProjection": {
            "$ref": "/PriceProjection"
        },
        // Orders you want to receive in the response
        "orderProjection": {
            "$ref": "/OrderProjection"
        },
        // If you ask for orders, specifies the representation of matches
        "matchProjection": {
            "$ref": "/MatchProjection"
        },
        // If you ask for orders, returns matches for each selection. Defaults to 'true' if unspecified
        "includeOverallPosition": {
            "type": "boolean"
        },
        // If you ask for orders, returns the breakdown of matches by strategy for each selection. Defaults to 'false' if unspecified
        "partitionMatchedByStrategyRef": {
            "type": "boolean"
        },
        // If you ask for orders, restricts the results to orders matching any of the specified set of customer defined strategies
        // Also filters which matches by strategy for selections are returned, if 'partitionMatchedByStrategyRef' is 'true'
        // An empty set will be treated as if the parameter haz been omitted (or null passed)
        "customerStrategyRefs": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        // A Betfair standard currency code. If not specified, the default currency code is used
        "currencyCode": {
            "type": "string"
        },
        // Language used for the response. If not specified, the default is returned
        "locale": {
            "type": "string"
        },
        // If you ask for orders, restricts the results to orders that have at least 1 fragment matched since the specified data (all matched fragments of such an order will be returned even if some were matched before the specified date)
        // All EXECUTABLE orders will be returned regardless of matched date
        "matchedSince": {
            "type": "Date"
        },
        // If you ask for orders, restricts the results to orders with the specified bet IDs. Omitting this parameter means that all bets will be included in the response
        // Maximum of 250 betId's can be supplied at a time
        "betIds": {
            "type": "array",
            "items": {
                "type": "string"
            }
        }
    }
};

const placeOrder = {
    "id": "/placeOrder",
    "type": "object",
    "properties": {
        // The unique identifier for the market. MarketId's are prefixed with '1.' or '2.' ('1.' = UK Exchange, '2.' = AUS Exchange) 
        "marketId": {
            "type": "string"
        },
        // Number of place instructions. Limit of place instructions per request is 200 for UK/AUS Exchange & 50 for Italian Exchange
        "instructions": {
            "type": "array",
            "items": {
                "$ref": "/PlaceInstruction"
            }
        },
        // Optional parameter allowing the client to pass a unique string (up to 32 chars) that is used to de-dupe mistaken re-submissions
        // 'customerRef' can contain; upper/lower chars, digits, special chars (:-._+*;~)
        // There is a time window associated with the de-duplication of duplicate submissions which is 60 seconds
        "customerRef": {
            "type": "string"
        },
        // Optional parameter allowing you to specify which version of the market the orders should be place on
        // If current market version is higher that that sent on an ordeer, the bet will be lapsed
        "marketVersion": {
            "$ref": "/MarketVersion"
        },
        // Optional reference you can use to specify which strategy has sent the order. The reference will be returned on order change messages through the stream API
        // The string is limited to 15 chars. If an empty string is provided, treated as null 
        "customerStrategyRef": {
            "type": "string"
        },
        // Optional flag which specifies if the orders should be places asynchronously. Order can be tracked via the Exchange Stream API or the API-NG by providing a 'customerOrderRef' for each place order
        // An order's status will be PENDING and no bet ID will be returned
        // This functionality is available for all betting types - including MOC and LOC
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
    listEvents,
    listEventTypes,
    listMarketBook,
    listMarketCatalogue,
    listRunnerBook,
    placeOrder
}