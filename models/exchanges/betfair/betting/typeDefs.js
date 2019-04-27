const MarketFilter = {
	id: "/MarketFilter",
	type: "object",
	properties: {
		// Restrict markets by any text with the market such as the; Name, Event, Competition etc.
		textQuery: {
			type: "string"
		},
		// Restrict markets by event type associated with the market (i.e. Football, Hockey, etc.)
		eventTypeIds: {
			type: "array",
			items: {
				type: "string"
			}
		},
		// Restrict markets by the event ID associated with the market
		eventIds: {
			type: "array",
			items: {
				type: "string"
			}
		},
		// Restict markets by the competitions associated with the market
		competitionIds: {
			type: "array",
			items: {
				type: "string"
			}
		},
		// Restrict markets by market ID associated with the market
		marketIds: {
			type: "array",
			items: {
				type: "string"
			}
		},
		// Restrict markets by venue associated with the market
		venues: {
			type: "array",
			items: {
				type: "string"
			}
		},
		// Restrict to bsp markets only. Returns both types if not specified
		bspOnly: {
			type: "boolean"
		},
		// Restrict to markets that will turn in-play. Returns both if not specified
		turnInPlayEnabled: {
			type: "boolean"
		},
		// Restrict to markets that are currently in play. Returns both if not specified
		inPlayOnly: {
			type: "boolean"
		},
		// Restrict to markets that match the betting type of market (i.e. Odds, Asian Handicap Singles, etc.)
		marketBettingTypes: {
			$ref: "/MarketBettingType"
		},
		// Restrict to markets that are in the specified country/countries
		marketCountries: {
			type: "array",
			items: {
				type: "string"
			}
		},
		// Restrict to markets that match the type of market (i.e. MATCH_ODDS, HALF_TIME_SCORE)
		// Should use this instead of relying on the market name as the market type codes are the same in all locales
		marketTypeCodes: {
			type: "array",
			items: {
				type: "string"
			}
		},
		// Restrict to markets with a market start time before or after the specified date
		marketStartTime: {
			$ref: "/TimeRange"
		},
		// Restrict to markets that I have one or more orders in these status
		withOrders: {
			type: "string",
			items: {
				$ref: "/OrderStatus"
			}
		},
		// Restrict by race type (i.e. Hurdle, Bumper, Harness, Chase)
		raceTypes: {
			type: "array",
			items: {
				type: "string"
			}
		}
	}
}

const MarketVersion = {
	id: "/MarketVersion",
	type: "object",
	properties: {
		version: {
			type: "string"
		}
	}
}

const TimeRange = {
	id: "/TimeRange",
	type: "object",
	properties: {
		from: {
			type: "Date"
		},
		to: {
			type: "Date"
		}
	}
}

/*
 * Information about a market
 */
const MarketCatalogue = {
	id: "/MarketCatalogue",
	type: "object",
	properties: {
		// The unique identifier for the market. MarketId's are prefixed with '1.' or '2.' ('1.' = UK Exchange, '2.' = AUS Exchange)
		marketId: {
			type: "string"
		},
		// Name of the market
		marketName: {
			type: "string"
		},
		// Time this market starts at, only returned when the MARKET_START_TIME enum is passed in the 'marketProjections'
		marketStartTime: {
			type: "string"
		},
		// Details about the market
		description: {
			$ref: "/MarketDescription"
		},
		// Total amount of money matched on the market
		totalMatched: {
			type: "number"
		},
		// The runners (selection) contained in the market
		runners: {
			$ref: "/RunnerCatalog"
		},
		// Event Ttype the market is contained within
		eventType: {
			$ref: "/EventType"
		},
		// Competition the market is contained within. Usually only applies to Football competitions
		competition: {
			$ref: "/Competition"
		},
		// Event the market is contained within
		event: {
			$ref: "/Event"
		}
	},
	required: ["marketId", "marketName"]
}

/*
 * The dynamic data in a market
 */
const MarketBook = {
	id: "/MarketBook",
	type: "object",
	properties: {
		// The unique identifier for the market. MarketId's are prefixed with '1.' or '2.' ('1.' = UK Exchange, '2.' = AUS Exchange)
		marketId: {
			type: "string"
		},
		// 'True' if the data returned by 'listMarketBook' will be delayed
		// Data may be delayed if not logged in with funded account or using an Application Key that does not allow up-to-date data
		isMarketDataDelayed: {
			type: "boolean"
		},
		// Status of the market; OPEN, SUSPENDED, CLOSED (settled) etc.
		status: {
			$ref: "/MarketStatus"
		},
		// Number of seconds an order is held until it is submitted into the market
		// Orders are usually delayed when the market is in-play
		betDelay: {
			type: "boolean"
		},
		// 'True' if the market starting price has been reconciled
		bspReconciled: {
			type: "boolean"
		},
		// If 'false', runners may be added to the market
		complete: {
			type: "boolean"
		},
		// 'True' if the market is currently in-play
		inplay: {
			type: "boolean"
		},
		// Number of selections that could be settled as winners
		numberOfWinners: {
			type: "number"
		},
		// Number of runners in the market
		numberOfRunners: {
			type: "number"
		},
		// Most recent time an order was executed
		lastMatchTime: {
			type: "string"
		},
		// Total amount matched
		totalMatched: {
			type: "number"
		},
		// Total amount of orders that remain unmatched
		totalAvailable: {
			type: "number"
		},
		// 'True' if cross matching is enabled for this market
		crossMatching: {
			type: "boolean"
		},
		// 'True' if runners in the market can be voided
		// This doesn't include horse racing markets under which bets are voided on non-runners with any applicable reduction factor applied
		runnersVoidable: {
			type: "boolean"
		},
		// Version of the market
		// Version increments whenever the market status changes (i.e. turning in-play or suspended when a goal is scored)
		version: {
			type: "number"
		},
		// Information about the runners (selections) in the market
		runners: {
			type: "array",
			items: {
				$ref: "/Runners"
			}
		},
		// Description of a markets key line for valid market types
		keyLineDescription: {
			$ref: "/KeyLineDescription"
		}
	},
	required: ["marketId", "isMarketDataDelayed"]
}

/*
 * Instruction to place a new order
 */
const PlaceInstruction = {
	id: "/PlaceInstruction",
	type: "object",
	properties: {
		orderType: {
			$ref: "/OrderType"
		},
		// The unique identified for the selection in the market
		selectionId: {
			type: "string"
		},
		// The handicap associated with the runner in case of Asian handicap markets (i.e. marketTypes: ASIAN_HANDICAP_DOUBLE_LINE, ASIAN_HANDICAP_SINGLE_LINE)
		// Null otherwise
		handicap: {
			type: "number"
		},
		// Back or Lay
		side: {
			$ref: "/Side"
		},
		// A simple exchange bet for immediate execution
		limitOrder: {
			$ref: "/LimitOrder"
		},
		// Bets are matched if, and only if, the returned starting price if better than a specified price
		// In the case of BACK bets, LOC bets are matched if the calculated starting price is GREATER than the specified price
		// In the case of LAY bets, LOC bets are matched if the starting price is LESS than the specified price
		// If the specified limit is equal to the starting price, then it may be matched, partially matched, or may not be matched at all, depending on how much is needed to balance all bets against each other (MOC, LOC, & normal exchange bets)
		limitOnCloseOrder: {
			$ref: "/LimitOnCloseOrder"
		},
		// Bets remain unmatched until the market is reconciled. They are matched & settled at a price that is representative of the market at the point the market is turned in-play
		// The market is reconciled to find a starting price and MOC bets are settled at whatever starting price is returned. MOC bets are always matched & settled, unless a starting price is not available for selection
		// Market on Close (MOC) bets can only be placed before the starting price is determined
		marketOnCloseOrder: {
			$ref: "/MarketOnCloseOrder"
		},
		// An optional reference customers can set to identify instructions. No validation will be done on unqiqueness and the string is limited to 32 characters
		// Empty string treated as null
		customerOrderRef: {
			type: "string"
		}
	},
	required: ["orderType", "selectionId", "side"]
}

/*
 * Selection criteria of the returning price data
 */
const PriceProjection = {
	id: "/PriceProjection",
	type: "object",
	properties: {
		// Basic price data you want to receive in the response
		priceData: {
			$ref: "/PriceData"
		},
		// Options to alter the default representation of best offer prices
		// Applicable to EX_BEST_OFFERS 'priceData' selection
		exBestOffersOverrides: {
			$ref: "/ExBestOffersOverrides"
		},
		// Indicates if the returned prices should include virtual prices (https://docs.developer.betfair.com/display/1smk3cen4v3lu3yomq5qye0ni/Additional+Information)
		// Applicable to EX_BEST_OFFERS and EX_ALL_OFFERS 'priceData' selections. Default value is 'false'
		virtualise: {
			type: "boolean"
		},
		// Indicates if the volume returned at each price point should be the absolute or a cumulative sum of volumes available at the price and all better prices
		// Applicable to EX_BEST_OFFERS and EX_ALL_OFFERS 'priceData' selections. Default value is 'false'
		rolloverStakes: {
			type: "boolean"
		}
	}
}

/*
 * Options to alter the default representation of best offer prices
 */
const ExBestOffersOverrides = {
	id: "/ExBestOffersOverrides",
	type: "object",
	properties: {
		// Maximum number of prices to return on each side for each runner. If unspecified, defaults to 3. Maximum returned price depth is 10
		bestPriceDepth: {
			type: "number"
		},
		// Model to use when rolling up available sizes. If unspecified, defaults to STAKE rollup model with 'rollupLimit' of minimum stake in specified currency
		rollupModel: {
			$ref: "/RollupModel"
		},
		// Volume limit to use when rolling up returned sizes. The exact definition of the limit depends on the 'rollupModel'
		// If no limit is provided, will use the minimum stake as the default value. Ignored if no 'rollupModel' specified
		rollupLimit: {
			type: "number"
		},
		// Only applicable when 'rollupModel' is MANAGED_LIABILITY. The 'rollupModel' switches from being stake based at the smallest lay price whihc is >= 'rollupLiabilityThreshold'
		rollupLiabilityThreshold: {
			type: "number"
		},
		// Only applicable when 'rollupModel' is MANAGED_LIABILITY. ('rollupLiabilityFactor * 'rollupLimit') is the minimum liability the user is deemed to be comfortable with
		// After the 'rollupLiabilityThreshold' price, subsequent volumes will be rolled up to the minimum value such that the liability >- the minimum liability
		rollupLiabilityFactor: {
			type: "number"
		}
	}
}

/*
 * Place a new LIMIT order (simple exchange bet for immediate execution)
 */
const LimitOrder = {
	id: "/LimitOrder",
	type: "object",
	properties: {
		// Size of the bet. For market type EACH_WAY, total stake = (size * 2)
		size: {
			type: "number"
		},
		// Limit price. For LINE markets, the price at which the bet is settled and struck will always be 2.0 (evens)
		// On these bets, the 'price' is used to indicate the line value which is being bought/sold
		price: {
			type: "number"
		},
		// What to do with the order at turn-in-play
		persistenceType: {
			$ref: "/PersistenceType"
		},
		// Type of TimeInForce value to use. This value takes precendence over any 'persistenceType' value chosen
		// If this attribute is populated along with 'persistenceType', then 'persistenceType' will be ignored
		// When using FILL_OR_KILL for LINE market, the Volume Weighted Average Price (AWAP) functionality is disabled
		timeInForce: {
			$ref: "/TimeInForce"
		},
		// Optional field used if 'timeInForce' attribute is populated. If specified without 'timeInForce', this field will be ignored
		// If no 'minFillSize' is specified, the order is killed unless the entire size can be matched
		// If 'minFillSize' is specified, the order is killed unless at least the 'minFillSize' can be matched
		// The 'minFillSize' cannot be greater that the order's size. If specified for a 'betTargetType' and FILL_OR_KILL order, then this value will be ignored
		minFillSize: {
			type: "number"
		},
		// Optional field to allow betting to a targetted PAYOUT or BACKERS_PROFIT. It's invalid to specify both 'size' and 'betTargetType'
		// Matching provides best execution at the requested price or better up to the payout or profit
		// If bet is not matched completely and immediately, the remaining portion enters the unmatched pool of bets on the exchange
		betTargetType: {
			type: "string"
		},
		// Optional filed which must be specified if the 'betTargetType' is specified for this order. The requested outcome size of either the payout or profit
		// This is named from the backer's perspective. For lay bets, the profit represents the bet's liability
		betTargetSize: {
			type: "number"
		}
	},
	required: ["size", "price", "persistenceType"]
}

/*
 * Place a new LIMIT_ON_CLOSE (LOC) bet
 */
const LimitOnCloseOrder = {
	id: "/LimitOnCloseOrder",
	type: "object",
	properties: {
		// Size of the bet. See: https://docs.developer.betfair.com/display/1smk3cen4v3lu3yomq5qye0ni/Additional+Information#AdditionalInformation-CurrencyParameters
		liability: {
			type: "number"
		},
		// Limit price of the bet if LOC
		price: {
			type: "number"
		}
	},
	required: ["liability", "price"]
}

/*
 * Place a neew MARKET_ON_CLOSE (MOC) bet
 */
const MarketOnCloseOrder = {
	id: "/MarketOnCloseOrder",
	type: "object",
	properties: {
		// Size of the bet
		liability: {
			type: "number"
		}
	},
	required: ["liability"]
}

module.exports = {
	LimitOnCloseOrder,
	LimitOrder,
	MarketBook,
	MarketCatalogue,
	MarketFilter,
	MarketVersion,
	MarketOnCloseOrder,
	PlaceInstruction,
	PriceProjection,
	ExBestOffersOverrides,
	TimeRange
}
