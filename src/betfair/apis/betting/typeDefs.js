const MARKET_FILTER = {
    "id": "/MarketFilter",
    "type": "object",
    "properties": {
        // Restrict markets by any text with the market such as the; Name, Event, Competition etc.
        "textQuery": {
            "type": "string"
        },
        // Restrict markets by event type associated with the market (i.e. Football, Hockey, etc.)
        "eventTypeIds": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        // Restrict markets by the event ID associated with the market
        "eventIds": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        // Restict markets by the competitions associated with the market
        "competitionIds": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        // Restrict markets by market ID associated with the market
        "marketIds": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        // Restrict markets by venue associated with the market
        "venues": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        // Restrict to bsp markets only. Returns both types if not specified
        "bspOnly": {
            "type": "boolean"
        },
        // Restrict to markets that will turn in-play. Returns both if not specified
        "turnInPlayEnabled": {
            "type": "boolean"
        },
        // Restrict to markets that are currently in play. Returns both if not specified
        "inPlayOnly": {
            "type": "boolean"
        },
        // Restrict to markets that match the betting type of market (i.e. Odds, Asian Handicap Singles, etc.)
        "marketBettingTypes": {
            "$ref": "/MarketBettingType"
        },
        // Restrict to markets that are in the specified country/countries
        "marketCountries": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        // Restrict to markets that match the type of market (i.e. MATCH_ODDS, HALF_TIME_SCORE)
        // Should use this instead of relying on the market name as the market type codes are the same in all locales
        "marketTypeCodes": {
            "type": "array",
            "items": {
                "type": "string"
            }
        },
        // Restrict to markets with a market start time before or after the specified date
        "marketStartTime": {
            "$ref": "/TimeRange"
        },
        // Restrict to markets that I have one or more orders in these status
        "withOrders": {
            "type": "string",
            "items": {
                "$ref": "/OrderStatus"
            }
        },
        // Restrict by race type (i.e. Hurdle, Bumper, Harness, Chase)
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

/*
 * Information about a market
 */
const MARKET_CATALOGUE = {
    "id": "/MarketCatalogue",
    "type": "object",
    "properties": {
        // The unique identifier for the market. MarketId's are prefixed with '1.' or '2.' ('1.' = UK Exchange, '2.' = AUS Exchange) 
        "marketId": {
            "type": "string"
        },
        // Name of the market
        "marketName": {
            "type": "string"
        },
        // Time this market starts at, only returned when the MARKET_START_TIME enum is passed in the 'marketProjections'
        "marketStartTime": {
            "type": "string"
        },
        // Details about the market
        "description": {
            "$ref": "/MarketDescription"
        },
        // Total amount of money matched on the market
        "totalMatched": {
            "type": "number"
        },
        // The runners (selection) contained in the market
        "runners": {
            "$ref": "/RunnerCatalog"
        },
        // Event Ttype the market is contained within
        "eventType": {
            "$ref": "/EventType"
        },
        // Competition the market is contained within. Usually only applies to Football competitions
        "competition": {
            "$ref": "/Competition"
        },
        // Event the market is contained within
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

const LIST_MARKET_BOOK = {
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

/*
 * The dynamic data in a market
 */
const MARKET_BOOK = {
    "id": "/MarketBook",
    "type": "object",
    "properties": {
        // The unique identifier for the market. MarketId's are prefixed with '1.' or '2.' ('1.' = UK Exchange, '2.' = AUS Exchange) 
        "marketId": {
            "type": "string"
        },
        // 'True' if the data returned by 'listMarketBook' will be delayed
        // Data may be delayed if not logged in with funded account or using an Application Key that does not allow up-to-date data
        "isMarketDataDelayed": {
            "type": "boolean"
        },
        // Status of the market; OPEN, SUSPENDED, CLOSED (settled) etc.
        "status": {
            "$ref": "/MarketStatus"
        },
        // Number of seconds an order is held until it is submitted into the market
        // Orders are usually delayed when the market is in-play
        "betDelay": {
            "type": "boolean"
        },
        // 'True' if the market starting price has been reconciled
        "bspReconciled": {
            "type": "boolean"
        },
        // If 'false', runners may be added to the market
        "complete": {
            "type": "boolean"
        },
        // 'True' if the market is currently in-play
        "inplay": {
            "type": "boolean"
        },
        // Number of selections that could be settled as winners
        "numberOfWinners": {
            "type": "number"
        },
        // Number of runners in the market
        "numberOfRunners": {
            "type": "number"
        },
        // Most recent time an order was executed
        "lastMatchTime": {
            "type": "string"
        },
        // Total amount matched
        "totalMatched": {
            "type": "number"
        },
        // Total amount of orders that remain unmatched
        "totalAvailable": {
            "type": "number"
        },
        // 'True' if cross matching is enabled for this market
        "crossMatching": {
            "type": "boolean"
        },
        // 'True' if runners in the market can be voided
        // This doesn't include horse racing markets under which bets are voided on non-runners with any applicable reduction factor applied
        "runnersVoidable": {
            "type": "boolean"
        },
        // Version of the market
        // Version increments whenever the market status changes (i.e. turning in-play or suspended when a goal is scored)
        "version": {
            "type": "number"
        },
        // Information about the runners (selections) in the market
        "runners": {
            "type": "array",
            "items": {
                "$ref": "/Runners"
            }
        },
        // Description of a markets key line for valid market types
        "keyLineDescription": {
            "$ref": "/KeyLineDescription"
        }
    },
    "required": [
        "marketId",
        "isMarketDataDelayed"
    ]
};

/*
 * Instruction to place a new order
 */
const PLACE_INSTRUCTION = {
    "id": "/PlaceInstruction",
    "type": "object",
    "properties": {
        "orderType": {
            "$ref": "/OrderType",
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
        // Back or Lay
        "side": {
            "$ref": "/Side"
        },
        // A simple exchange bet for immediate execution
        "limitOrder": {
            "$ref": "/LimitOrder"
        },
        // Bets are matched if, and only if, the returned starting price if better than a specified price
        // In the case of BACK bets, LOC bets are matched if the calculated starting price is GREATER than the specified price
        // In the case of LAY bets, LOC bets are matched if the starting price is LESS than the specified price
        // If the specified limit is equal to the starting price, then it may be matched, partially matched, or may not be matched at all, depending on how much is needed to balance all bets against each other (MOC, LOC, & normal exchange bets)
        "limitOnCloseOrder": {
            "$ref": "/LimitOnCloseOrder"
        },
        // Bets remain unmatched until the market is reconciled. They are matched & settled at a price that is representative of the market at the point the market is turned in-play
        // The market is reconciled to find a starting price and MOC bets are settled at whatever starting price is returned. MOC bets are always matched & settled, unless a starting price is not available for selection
        // Market on Close (MOC) bets can only be placed before the starting price is determined
        "marketOnCloseOrder": {
            "$ref": "/MarketOnCloseOrder"
        },
        // An optional reference customers can set to identify instructions. No validation will be done on unqiqueness and the string is limited to 32 characters
        // Empty string treated as null
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

/*
 * Selection criteria of the returning price data
 */
const PRICE_PROJECTION = {
    "id": "/PriceProjection",
    "type": "object",
    "properties": {
        // Basic price data you want to receive in the response
        "priceData": {
            "$ref": "/PriceData"
        },
        // Options to alter the default representation of best offer prices
        // Applicable to EX_BEST_OFFERS 'priceData' selection
        "exBestOffersOverrides": {
            "$ref": "/ExBestOffersOverrides"
        },
        // Indicates if the returned prices should include virtual prices (https://docs.developer.betfair.com/display/1smk3cen4v3lu3yomq5qye0ni/Additional+Information)
        // Applicable to EX_BEST_OFFERS and EX_ALL_OFFERS 'priceData' selections. Default value is 'false'
        "virtualise": {
            "type": "boolean"
        },
        // Indicates if the volume returned at each price point should be the absolute or a cumulative sum of volumes available at the price and all better prices
        // Applicable to EX_BEST_OFFERS and EX_ALL_OFFERS 'priceData' selections. Default value is 'false'
        "rolloverStakes": {
            "type": "boolean"
        }
    }
};

const LIST_EVENT_TYPES = {
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

const LIST_EVENTS = {
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

const LIST_RUNNER_BOOK = {
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

/*
 * Options to alter the default representation of best offer prices
 */
const EX_BEST_OFFERS_OVERRIDES = {
    "id": "/ExBestOffersOverrides",
    "type": "object",
    "properties": {
        // Maximum number of prices to return on each side for each runner. If unspecified, defaults to 3. Maximum returned price depth is 10
        "bestPriceDepth": {
            "type": "number"
        },
        // Model to use when rolling up available sizes. If unspecified, defaults to STAKE rollup model with 'rollupLimit' of minimum stake in specified currency
        "rollupModel": {
            "$ref": "/RollupModel"
        },
        // Volume limit to use when rolling up returned sizes. The exact definition of the limit depends on the 'rollupModel'
        // If no limit is provided, will use the minimum stake as the default value. Ignored if no 'rollupModel' specified
        "rollupLimit": {
            "type": "number"
        },
        // Only applicable when 'rollupModel' is MANAGED_LIABILITY. The 'rollupModel' switches from being stake based at the smallest lay price whihc is >= 'rollupLiabilityThreshold'
        "rollupLiabilityThreshold": {
            "type": "number"
        },
        // Only applicable when 'rollupModel' is MANAGED_LIABILITY. ('rollupLiabilityFactor * 'rollupLimit') is the minimum liability the user is deemed to be comfortable with
        // After the 'rollupLiabilityThreshold' price, subsequent volumes will be rolled up to the minimum value such that the liability >- the minimum liability 
        "rollupLiabilityFactor": {
            "type": "number"
        }
    }
};

/*
 * Place a new LIMIT order (simple exchange bet for immediate execution)
 */
const LIMIT_ORDER = {
    "id": "/LimitOrder",
    "type": "object",
    "properties": {
        // Size of the bet. For market type EACH_WAY, total stake = (size * 2)
        "size": {
            "type": "number"
        },
        // Limit price. For LINE markets, the price at which the bet is settled and struck will always be 2.0 (evens)
        // On these bets, the 'price' is used to indicate the line value which is being bought/sold
        "price": {
            "type": "number"
        },
        // What to do with the order at turn-in-play
        "persistenceType": {
            "$ref": "/PersistenceType"
        },
        // Type of TimeInForce value to use. This value takes precendence over any 'persistenceType' value chosen
        // If this attribute is populated along with 'persistenceType', then 'persistenceType' will be ignored
        // When using FILL_OR_KILL for LINE market, the Volume Weighted Average Price (AWAP) functionality is disabled 
        "timeInForce": {
            "$ref": "/TimeInForce"
        },
        // Optional field used if 'timeInForce' attribute is populated. If specified without 'timeInForce', this field will be ignored
        // If no 'minFillSize' is specified, the order is killed unless the entire size can be matched
        // If 'minFillSize' is specified, the order is killed unless at least the 'minFillSize' can be matched
        // The 'minFillSize' cannot be greater that the order's size. If specified for a 'betTargetType' and FILL_OR_KILL order, then this value will be ignored
        "minFillSize": {
            "type": "number"
        },
        // Optional field to allow betting to a targetted PAYOUT or BACKERS_PROFIT. It's invalid to specify both 'size' and 'betTargetType'
        // Matching provides best execution at the requested price or better up to the payout or profit
        // If bet is not matched completely and immediately, the remaining portion enters the unmatched pool of bets on the exchange
        "betTargetType": {
            "type": "string"
        },
        // Optional filed which must be specified if the 'betTargetType' is specified for this order. The requested outcome size of either the payout or profit
        // This is named from the backer's perspective. For lay bets, the profit represents the bet's liability
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

/*
 * Place a new LIMIT_ON_CLOSE (LOC) bet
 */
const LIMIT_ON_CLOSE_ORDER = {
    "id": "/LimitOnCloseOrder",
    "type": "object",
    "properties": {
        // Size of the bet. See: https://docs.developer.betfair.com/display/1smk3cen4v3lu3yomq5qye0ni/Additional+Information#AdditionalInformation-CurrencyParameters
        "liability": {
            "type": "number"
        },
        // Limit price of the bet if LOC
        "price": {
            "type": "number"
        }
    },
    "required": [
        "liability",
        "price"
    ]
};

/*
 * Place a neew MARKET_ON_CLOSE (MOC) bet
 */
const MARKET_ON_CLOSE_ORDER = {
    "id": "/MarketOnCloseOrder",
    "type": "object",
    "properties": {
        // Size of the bet
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
        // The unique identifier for the market. MarketId's are prefixed with '1.' or '2.' ('1.' = UK Exchange, '2.' = AUS Exchange) 
        "marketId": {
            "type": "string"
        },
        // Number of place instructions. Limit of place instructions per request is 200 for UK/AUS Exchange & 50 for Italian Exchange
        "instructions": {
            "$ref": "/PlaceInstruction"
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