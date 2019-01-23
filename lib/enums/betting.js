export const MarketProjection = {
    COMPETITION: {
        val: "COMPETITION",
        desc: "If not selected then the competition will not be returned with marketCatalogue"
    },
    EVENT: {
        val: "EVENT",
        desc: "If not selected then the event will not be returned with marketCatalogue"
    },
    EVENT_TYPE: {
        val: "EVENT_TYPE",
        desc: "If not selected then the eventType will not be returned with marketCatalogue"
    },
    MARKET_START_TIME: {
        val: "MARKET_START_TIME",
        desc: "If not selected then the start time will not be returned with marketCatalogue"
    },
    MARKET_DESCRIPTION: {
        val: "MARKET_DESCRIPTION",
        desc: "If not selected then the description will not be returned with marketCatalogue"
    },
    RUNNER_DESCRIPTION: {
        val: "RUNNER_DESCRIPTION",
        desc: "If not selected then the runners will not be returned with marketCatalogue"
    },
    RUNNER_METADATA: {
        val: "RUNNER_METADATA",
        desc: "If not selected then the runner metadata will not be returned with marketCatalogue. "
            + "If selected then RUNNER_DESCRIPTION will also be returned regardless of whether it is included as a market projection."
    }
};

export const PriceData = {
    SP_AVAILABLE: {
        val: "SP_AVAILABLE",
        desc: "Amount available for the BSP auction"
    },
    SP_TRADED: {
        val: "SP_TRADED",
        desc: "Amount traded in the BSP auction"
    },
    EX_BEST_OFFERS: {
        val: "EX_BEST_OFFERS",
        desc: "Only the best prices available for each runner, to requested price depth"
    },
    EX_ALL_OFFERS: {
        val: "EX_ALL_OFFERS",
        desc: "EX_ALL_OFFERS trumps EX_BEST_OFFERS if both settings are present"
    },
    EX_TRADED: {
        val: "EX_TRADED",
        desc: "Amount traded on the exchange"
    }
};

export const MatchProjection = {
    NO_ROLLUP: {
        val: "NO_ROLLUP",
        desc: "No rollup, return raw fragments"
    },
    ROLLED_UP_BY_PRICE: {
        val: "ROLLED_UP_BY_PRICE",
        desc: "Rollup matched amounts by distinct matched prices per side"
    },
    ROLLED_UP_BY_AVG_PRICE: {
        val: "ROLLED_UP_BY_AVG_PRICE",
        desc: "Rollup matched amounts by average matched price per side"
    }
};

export const OrderProjection = {
    ALL: {
        val: "ALL",
        desc: "EXECUTABLE and EXECUTION_COMPLETE orders"
    },
    EXECUTABLE: {
        val: "EXECUTABLE",
        desc: "An order that has a remaining unmatched portion"
    },
    EXECUTION_COMPLETE: {
        val: "EXECUTION_COMPLETE",
        desc: "An order that does not have any remaining unmatched portion"
    }
};

export const MarketStatus = {
    INACTIVE: {
        val: "INACTIVE",
        desc: "The market has been created but isn't yet available"
    },
    OPEN: {
        val: "OPEN",
        desc: "The market is open for betting"
    },
    SUSPENDED: {
        val: "SUSPENDED",
        desc: "The market is suspended and not available for betting"
    },
    CLOSED: {
        val: "CLOSED",
        desc: "The market has been settled and is no longer available for betting"
    }
};

export const RunnerStatus = {
    ACTIVE: {
        val: "ACTIVE",
        desc: "ACTIVE"
    },
    WINNER: {
        val: "WINNER",
        desc: "WINNER"
    },
    LOSER: {
        val: "LOSER",
        desc: "LOSER"
    },
    PLACED: {
        val: "PLACED",
        desc: "The runner was placed, applies to EACH_WAY marketTypes only"
    },
    REMOVED_VACANT: {
        val: "REMOVED_VACANT",
        desc: "REMOVED_VACANT applies to Greyhounds. Greyhound markets always return a fixed number of runners (traps). "
            + "If a dog has been removed, the trap is shown as vacant"
    },
    REMOVED: {
        val: "REMOVED",
        desc: "REMOVED"
    },
    HIDDEN: {
        val: "HIDDEN",
        desc: "The selection is hidden from the market.  This occurs in Horse Racing markets were runners is hidden when it is doesn’t hold an official entry following an entry stage. "
            + "This could be because the horse was never entered or because they have been scratched from a race at a declaration stage. "
            + "All matched customer bet prices are set to 1.0 even if there are later supplementary stages. "
            + "Should it appear likely that a specific runner may actually be supplemented into the race this runner will be reinstated with all matched customer bets set back to the original prices."
    }
};

export const TimeGranularity = {
    DAYS: {
        val: "DAYS",
        desc: ""
    },
    HOURS: {
        val: "HOURS",
        desc: ""
    },
    MINUTES: {
        val: "MINUTES",
        desc: ""
    }
};

export const Side = {
    BACK: {
        val: "BACK",
        desc: "To back a team, horse or outcome is to bet on the selection to win. For LINE markets a Back bet refers to a SELL line. "
            + "A SELL line will win if the outcome is LESS THAN the taken line (price)"
    },
    LAY: {
        val: "LAY",
        desc: "To lay a team, horse, or outcome is to bet on the selection to lose. For LINE markets a Lay bet refers to a BUY line. "
            + "A BUY line will win if the outcome is MORE THAN the taken line (price)"
    }
};

export const OrderStatus = {
    PENDING: {
        val: "PENDING",
        desc: "An asynchronous order is yet to be processed. Once the bet has been processed by the exchange (including waiting for any in-play delay), "
            + "the result will be reported and available on the Exchange Stream API and API NG. Not a valid search criteria on MarketFilter"
    },
    EXECUTION_COMPLETE: {
        val: "EXECUTION_COMPLETE",
        desc: "An order that does not have any remaining unmatched portion"
    },
    EXECUTABLE: {
        val: "EXECUTABLE",
        desc: "An order that has a remaining unmatched portion",
    },
    EXPIRED: {
        val: "EXPIRED",
        desc: "The order is no longer available for execution due to its time in force constraint. In the case of FILL_OR_KILL orders, "
            + "this means the order has been killed because it could not be filled to your specifications. Not a valid search criteria on MarketFilter"
    }
};

export const OrderBy = {
    BY_BET: {
        val: "BY_BET",
        desc: "@Deprecated Use BY_PLACE_TIME instead. Order by placed time, then bet id"
    },
    BY_MARKET: {
        val: "BY_MARKET",
        desc: "Order by market id, then placed time, then bet id"
    },
    BY_MATCH_TIME: {
        val: "BY_MATCH_TIME",
        desc: "Order by time of last matched fragment (if any), then placed time, then bet id. Filters out orders which have no matched date. "
            + "The dateRange filter (if specified) is applied to the matched date"
    },
    BY_PLACE_TIME: {
        val: "BY_PLACE_TIME",
        desc: "Order by placed time, then bet id. This is an alias of to be deprecated BY_BET. The dateRange filter (if specified) is applied to the placed date"
    },
    BY_SETTLED_TIME: {
        val: "BY_SETTLED_TIME",
        desc: "Order by time of last settled fragment (if any due to partial market settlement), then by last match time, then placed time, then bet id. "
            + "Filters out orders which have not been settled. The dateRange filter (if specified) is applied to the settled date."
    },
    BY_VOID_TIME: {
        val: "BY_VOID_TIME",
        desc: "Order by time of last voided fragment (if any), then by last match time, then placed time, then bet id. "
            + "Filters out orders which have not been voided. The dateRange filter (if specified) is applied to the voided date"
    }
};

export const SortDir = {
    EARLIEST_TO_LATEST: {
        val: "EARLIEST_TO_LATEST",
        desc: "Order from earliest value to latest e.g. lowest betId is first in the results"
    },
    LATEST_TO_EARLIEST: {
        val: "LATEST_TO_EARLIEST",
        desc: "Order from the latest value to the earliest e.g. highest betId is first in the results"
    }
};

export const OrderType = {
    LIMIT: {
        val: "LIMIT",
        desc: "A normal exchange limit order for immediate execution"
    },
    LIMIT_ON_CLOSE: {
        val: "LIMIT_ON_CLOSE",
        desc: "Limit order for the auction (SP)"
    },
    MARKET_ON_CLOSE: {
        val: "MARKET_ON_CLOSE",
        desc: "Market order for the auction (SP)"
    }
};

export const MarketSort = {
    MINIMUM_TRADED: {
        val: "MINIMUM_TRADED",
        desc: "Minimum traded volume"
    },
    MAXIMUM_TRADED: {
        val: "MAXIMUM_TRADED",
        desc: "Maximum traded volume"
    },
    MINIMUM_AVAILABLE: {
        val: "MINIMUM_AVAILABLE",
        desc: "Minimum available to match"
    },
    MAXIMUM_AVAILABLE: {
        val: "MAXIMUM_AVAILABLE",
        desc: "Maximum available to match"
    },
    FIRST_TO_START: {
        val: "FIRST_TO_START",
        desc: "The closest markets based on their expected start time"
    },
    LAST_TO_START: {
        val: "LAST_TO_START",
        desc: "The most distant markets based on their expected start time"
    }
};

export const MarketBettingType = {
    ODDS: {
        val: "ODDS",
        desc: "Odds Market - Any market that doesn't fit any any of the below categories"
    },
    LINE: {
        val: "LINE",
        desc: "Line Market - LINE markets operate at even-money odds of 2.0. "
            + "However, price for these markets refers to the line positions available as defined by the markets min-max range and interval steps. "
            + "Customers either Buy a line (LAY bet, winning if outcome is greater than the taken line (price)) or Sell a line "
            + "(BACK bet, winning if outcome is less than the taken line (price)). If settled outcome equals the taken line, stake is returned"
    },
    RANGE: {
        val: "RANGE",
        desc: "Range Market - Now Deprecated"
    },
    ASIAN_HANDICAP_DOUBLE_LINE: {
        val: "ASIAN_HANDICAP_DOUBLE_LINE",
        desc: "Asian Handicap Market - A traditional Asian handicap market. Can be identified by marketType ASIAN_HANDICAP"
    },
    ASIAN_HANDICAP_SINGLE_LINE: {
        val: "ASIAN_HANDICAP_SINGLE_LINE",
        desc: "Asian Single Line Market - A market in which there can be 0 or multiple winners. e,.g marketType TOTAL_GOALS"
    },
    FIXED_ODDS: {
        val: "FIXED_ODDS",
        desc: "Sportsbook Odds Market. This type is deprecated and will be removed in future releases, "
            + "when Sportsbook markets will be represented as ODDS market but with a different product type"
    }
};

export const ExecutionReportStatus = {
    SUCCESS: {
        val: "SUCCESS",
        desc: "Order processed successfully",
    },
    FAILURE: {
        val: "FAILURE",
        desc: "Order failed"
    },
    PROCESSED_WITH_ERRORS: {
        val: "PROCESSED_WITH_ERRORS",
        desc: "The order itself has been accepted, but at least one (possibly all) actions have generated errors. "
            + "This error only occurs for replaceOrders, cancelOrders and updateOrders operations. "
            + "The placeOrders operation will not return PROCESSED_WITH_ERRORS status as it is an atomic operation"
    },
    TIMEOUT: {
        val: "TIMEOUT",
        desc: "The order timed out & the status of the bet is unknown. "
            + "If a TIMEOUT error occurs on a placeOrders/replaceOrders request, you should check listCurrentOrders to verify the status of your bets before placing further orders. "
            + "Please Note: Timeouts will occur after 5 seconds of attempting to process the bet but please allow up to 2 minutes for a timed out order to appear"
    }
};

export const ExecutionReportErrorCode = {
    ERROR_IN_MATCHER: {
        val: "ERROR_IN_MATCHER",
        desc: "The matcher is not healthy",
    },
    PROCESSED_WITH_ERRORS: {
        val: "PROCESSED_WITH_ERRORS",
        desc: "The order itself has been accepted, but at least one (possibly all) actions have generated errors",
    },
    BET_ACTION_ERROR: {
        val: "BET_ACTION_ERROR",
        desc: "There is an error with an action that has caused the entire order to be rejected. Check the instructionReports errorCode for the reason for the rejection of the order.",
    },
    INVALID_ACCOUNT_STATE: {
        val: "INVALID_ACCOUNT_STATE",
        desc: "Order rejected due to the account's status (suspended, inactive, dup cards)",
    },
    INVALID_WALLET_STATUS: {
        val: "INVALID_WALLET_STATUS",
        desc: "Order rejected due to the account's wallet's status",
    },
    INSUFFICIENT_FUNDS: {
        val: "INSUFFICIENT_FUNDS",
        desc: "Account has exceeded its exposure limit or available to bet limit",
    },
    LOSS_LIMIT_EXCEEDED: {
        val: "LOSS_LIMIT_EXCEEDED",
        desc: "The account has exceed the self imposed loss limit",
    },
    MARKET_SUSPENDED: {
        val: "MARKET_SUSPENDED",
        desc: "Market is suspended",
    },
    MARKET_NOT_OPEN_FOR_BETTING: {
        val: "MARKET_NOT_OPEN_FOR_BETTING",
        desc: "Market is not open for betting. It is either not yet active, suspended or closed awaiting settlement.",
    },
    DUPLICATE_TRANSACTION: {
        val: "DUPLICATE_TRANSACTION",
        desc: "Duplicate customer reference data submitted - Please note: There is a time window associated with the de-duplication of duplicate submissions which is 60 second",
    },
    INVALID_ORDER: {
        val: "INVALID_ORDER",
        desc: "Order cannot be accepted by the matcher due to the combination of actions. For example, bets being edited are not on the same market, or order includes both edits and placement",
    },
    INVALID_MARKET_ID: {
        val: "INVALID_MARKET_ID",
        desc: "Market doesn't exist",
    },
    PERMISSION_DENIED: {
        val: "PERMISSION_DENIED",
        desc: "Business rules do not allow order to be placed. You are either attempting to place the order using a Delayed Application Key or from a restricted jurisdiction (i.e. USA)",
    },
    DUPLICATE_BETIDS: {
        val: "DUPLICATE_BETIDS",
        desc: "Duplicate Bet IDs found",
    },
    NO_ACTION_REQUIRED: {
        val: "NO_ACTION_REQUIRED",
        desc: "Order hasn't been passed to matcher as system detected there will be no state change",
    },
    SERVICE_UNAVAILABLE: {
        val: "SERVICE_UNAVAILABLE",
        desc: "The requested service is unavailable",
    },
    REJECTED_BY_REGULATOR: {
        val: "REJECTED_BY_REGULATOR",
        desc: "The regulator rejected the order. On the Italian Exchange this error will occur if more than 50 bets are sent in a single placeOrders request.",
    },
    NO_CHASING: {
        val: "NO_CHASING",
        desc: "A specific error code that relates to Spanish Exchange markets only which indicates that the bet placed contravenes the Spanish regulatory rules relating to loss chasing.",
    },
    REGULATOR_IS_NOT_AVAILABLE: {
        val: "REGULATOR_IS_NOT_AVAILABLE",
        desc: "The underlying regulator service is not available.",
    },
    TOO_MANY_INSTRUCTIONS: {
        val: "TOO_MANY_INSTRUCTIONS",
        desc: "The amount of orders exceeded the maximum amount allowed to be executed",
    },
    INVALID_MARKET_VERSION: {
        val: "INVALID_MARKET_VERSION",
        desc: "The supplied market version is invalid. Max length allowed for market version is 12."
    }
};

export const PersistenceType = {
    LAPSE: {
        val: "LAPSE",
        desc: "Lapse the order when the market is turned in-play",
    },
    PERSIST: {
        val: "PERSIST",
        desc: "Persist the order to in-play. The bet will be placed automatically into the in-play market at the start of the event"
    },
    MARKET_ON_CLOSE: {
        val: "MARKET_ON_CLOSE",
        desc: "Put the order into the auction (SP) at turn in-play"
    }
};

export const InstructionReportStatus = {
    SUCCESS: {
        val: "SUCCESS",
        desc: "The instruction was successful"
    },
    FAILURE: {
        val: "FAILURE",
        desc: "The instruction failed"
    },
    TIMEOUT: {
        val: "TIMEOUT",
        desc: "The instruction timed out & the status of the bet is unknown. "
            + "If a TIMEOUT error occurs on a placeOrders/replaceOrders request, you should check listCurrentOrders to verify the status of your bets before placing further orders. "
            + "Please Note: Timeouts will occur after 5 seconds of attempting to process the bet but please allow up to 2 minutes for timed out order to appear"
    }
};

export const InstructionReportErrorCode = {
    INVALID_BET_SIZE: {
        val: "INVALID_BET_SIZE",
        desc: "Bet size is invalid for your currency or your regulator",
    },
    INVALID_RUNNER: {
        val: "INVALID_RUNNER",
        desc: "Runner does not exist, includes vacant traps in greyhound racing",
    },
    BET_TAKEN_OR_LAPSED: {
        val: "BET_TAKEN_OR_LAPSED",
        desc: "Bet cannot be cancelled or modified as it has already been taken or has been cancelled/lapsed Includes attempts to cancel/modify market on close BSP bets and cancelling limit on close BSP bets. The error may be returned on placeOrders request if for example a bet is placed at the point when a market admin event takes place (i.e. market is turned in-play)",
    },
    BET_IN_PROGRESS: {
        val: "BET_IN_PROGRESS",
        desc: "No result was received from the matcher in a timeout configured for the system",
    },
    RUNNER_REMOVED: {
        val: "RUNNER_REMOVED",
        desc: "Runner has been removed from the event",
    },
    MARKET_NOT_OPEN_FOR_BETTING: {
        val: "MARKET_NOT_OPEN_FOR_BETTING",
        desc: "Attempt to edit a bet on a market that has closed",
    },
    LOSS_LIMIT_EXCEEDED: {
        val: "LOSS_LIMIT_EXCEEDED",
        desc: "The action has caused the account to exceed the self imposed loss limit",
    },
    MARKET_NOT_OPEN_FOR_BSP_BETTING: {
        val: "MARKET_NOT_OPEN_FOR_BSP_BETTING",
        desc: "Market now closed to bsp betting. Turned in-play or has been reconciled",
    },
    INVALID_PRICE_EDIT: {
        val: "INVALID_PRICE_EDIT",
        desc: "Attempt to edit down the price of a bsp limit on close lay bet, or edit up the price of a limit on close back bet",
    },
    INVALID_ODDS: {
        val: "INVALID_ODDS",
        desc: "Odds not on price ladder - either edit or placement",
    },
    INSUFFICIENT_FUNDS: {
        val: "INSUFFICIENT_FUNDS",
        desc: "Insufficient funds available to cover the bet action. Either the exposure limit or available to bet limit would be exceeded",
    },
    INVALID_PERSISTENCE_TYPE: {
        val: "INVALID_PERSISTENCE_TYPE",
        desc: "Invalid persistence type for this market, e.g. KEEP for a non in-play market.",
    },
    ERROR_IN_MATCHER: {
        val: "ERROR_IN_MATCHER",
        desc: "A problem with the matcher prevented this action completing successfully",
    },
    INVALID_BACK_LAY_COMBINATION: {
        val: "INVALID_BACK_LAY_COMBINATION",
        desc: "The order contains a back and a lay for the same runner at overlapping prices. This would guarantee a self match. This also applies to BSP limit on close bets",
    },
    ERROR_IN_ORDER: {
        val: "ERROR_IN_ORDER",
        desc: "The action failed because the parent order failed",
    },
    INVALID_BID_TYPE: {
        val: "INVALID_BID_TYPE",
        desc: "Bid type is mandatory",
    },
    INVALID_BET_ID: {
        val: "INVALID_BET_ID",
        desc: "Bet for id supplied has not been found",
    },
    CANCELLED_NOT_PLACED: {
        val: "CANCELLED_NOT_PLACED",
        desc: "Bet cancelled but replacement bet was not placed",
    },
    RELATED_ACTION_FAILED: {
        val: "RELATED_ACTION_FAILED",
        desc: "Action failed due to the failure of a action on which this action is dependent",
    },
    NO_ACTION_REQUIRED: {
        val: "NO_ACTION_REQUIRED",
        desc: "The action does not result in any state change. eg changing a persistence to it's current value",
    },
    TIME_IN_FORCE_CONFLICT: {
        val: "TIME_IN_FORCE_CONFLICT",
        desc: "You may only specify a time in force on either the place request OR on individual limit order instructions (not both), since the implied behaviors are incompatible.",
    },
    UNEXPECTED_PERSISTENCE_TYPE: {
        val: "UNEXPECTED_PERSISTENCE_TYPE",
        desc: "You have specified a persistence type for a FILL_OR_KILL order, which is nonsensical because no umatched portion can remain after the order has been placed.",
    },
    INVALID_ORDER_TYPE: {
        val: "INVALID_ORDER_TYPE",
        desc: "You have specified a time in force of FILL_OR_KILL, but have included a non-LIMIT order type",
    },
    UNEXPECTED_MIN_FILL_SIZE: {
        val: "UNEXPECTED_MIN_FILL_SIZE",
        desc: "You have specified a minFillSize on a limit order, where the limit order's time in force is not FILL_OR_KILL. Using minFillSize is not supported where the time in force of the request (as opposed to an order) is FILL_OR_KILL.",
    },
    INVALID_CUSTOMER_ORDER_REF: {
        val: "INVALID_CUSTOMER_ORDER_REF",
        desc: "The supplied customer order reference is too long",
    },
    INVALID_MIN_FILL_SIZE: {
        val: "INVALID_MIN_FILL_SIZE",
        desc: "The minFillSize must be greater than zero and less than or equal to the order's size. The minFillSize cannot be less than the minimum bet size for your currency",
    },
    BET_LAPSED_PRICE_IMPROVEMENT_TOO_LARGE: {
        val: "BET_LAPSED_PRICE_IMPROVEMENT_TOO_LARGE",
        desc: "Your bet is lapsed. There is better odds than requested available in the market, but your preferences don't allow the system to match your bet against better odds. Change your betting preferences to accept better odds if you don't want to receive this error."
    }
};

export const RollupModel = {
    STAKE: {
        val: "STAKE",
        desc: "The volumes will be rolled up to the minimum value which is >= rollupLimit"
    },
    PAYOUT: {
        val: "PAYOUT",
        desc: "The volumes will be rolled up to the minimum value where the payout( price * volume ) is >= rollupLimit. "
            + "On a LINE market, volumes will be rolled up where payout( 2.0 * volume ) is >= rollupLimit"
    },
    MANAGED_LIABILITY: {
        val: "MANAGED_LIABILITY",
        desc: "The volumes will be rolled up to the minimum value which is >= rollupLimit, until a lay price threshold. "
            + "There after, the volumes will be rolled up to the minimum value such that the liability >= a minimum liability. Not supported as yet"
    },
    NONE: "No rollup will be applied. However the volumes will be filtered by currency specific minimum stake unless overridden specifically for the channel"
};

export const GroupBy = {
    EVENT_TYPE: {
        val: "EVENT_TYPE",
        desc: "A roll up of settled P&L, commission paid and number of bet orders, on a specified event type"
    },
    EVENT: {
        val: "EVENT",
        desc: "A roll up of settled P&L, commission paid and number of bet orders, on a specified event"
    },
    MARKET: {
        val: "MARKET",
        desc: "A roll up of settled P&L, commission paid and number of bet orders, on a specified market"
    },
    SIDE: {
        val: "SIDE",
        desc: "An averaged roll up of settled P&L, and number of bets, on the specified side of a specified selection with a specified market, that are either settled or voided"
    },
    BET: {
        val: "BET",
        desc: "The P&L, commission paid, side and regulatory information etc, about each individual bet order"
    }
};

export const BetStatus = {

};

export const Operations = {
    CANCEL_ORDERS: "cancelOrders",
    LIST_CLEARED_ORDERS: "listClearedOrders",
    LIST_COMPETITIONS: "listCompetitions",
    LIST_COUNTRIES: "listCountries",
    LIST_CURRENT_ORDERS: "listCurrentOrders",
    LIST_EVENT_TYPES: "listEventTypes",
    LIST_EVENTS: "listEvents",
    LIST_MARKET_BOOK: "listMarketBook",
    LIST_MARKET_CATALOGUE: "listMarketCatalogue",
    LIST_MARKET_PROFIT_AND_LOSS: "listMarketProfitAndLoss",
    LIST_MARKET_TYPES: "listMarketTypes",
    LIST_RUNNER_BOOK: "listRunnerBook",
    LIST_TIME_RANGES: "listTimeRanges",
    LIST_VENUES: "listVenues",
    PLACE_ORDERS: "placeOrders",
    REPLACE_ORDERS: "replaceOrders",
    UPDATE_ORDERS: "updateOrders"
};

export const EventTypeIds = {
    SOCCER: "1",
    TENNIS: "2",
    GOLF: "3",
    CRICKET: "4",
    RUGBY_UNION: "5",
    BOXING: "6",
    HORSE_RACING: "7",
    MOTOR_SPORT: "8",
    SPECIAL_BETS: "10",
    CYCLING: "11",
    RUGBY_LEAGUE: "1477",
    DARTS: "3520",
    ATHLETICS: "3988",
    GREYHOUND_RACING: "4339",
    FINANCIAL_BETS: "6231",
    SNOOKER: "6422",
    AMERICAN_FOOTBALL: "6423",
    BASEBALL: "7511",
    BASKETBALL: "7522",
    ICE_HOCKEY: "7524",
    AUSTRALIAN_RULES: "61420",
    HANDBALL: "468328",
    WINTER_SPORTS: "451485",
    YACHTING: "998916",
    VOLLEYBALL: "998917",
    POLITICS: "2378961",
    GAELIC_GAMES: "2152880",
    MIXED_MARTIAL_ARTS: "26420387",
    ESPORTS: "27454571"
};