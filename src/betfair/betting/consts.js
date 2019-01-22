export const MarketProjection = {
    COMPETITION: "COMPETITION",
    EVENT: "EVENT",
    EVENT_TYPE: "EVENT_TYPE",
    MARKET_START_TIME: "MARKET_START_TIME",
    MARKET_DESCRIPTION: "MARKET_DESCRIPTION",
    RUNNER_DESCRIPTION: "RUNNER_DESCRIPTION",
    RUNNER_METADATA: "RUNNER_METADATA"
};

export const PriceData = {
    SP_AVAILABLE: "SP_AVAILABLE",
    SP_TRADED: "SP_TRADED",
    EX_BEST_OFFERS: "EX_BEST_OFFERS",
    EX_ALL_OFFERS: "EX_ALL_OFFERS",
    EX_TRADED: "EX_TRADED"
};

export const MatchProjection = {
    NO_ROLLUP: "NO_ROLLUP",
    ROLLED_UP_BY_PRICE: "ROLLED_UP_BY_PRICE",
    ROLLED_UP_BY_AVG_PRICE: "ROLLED_UP_BY_AVG_PRICE"
};

export const OrderProjection = {
    ALL: "ALL",
    EXECUTABLE: "EXECUTABLE",
    EXECUTION_COMPLETE: "EXECUTION_COMPLETE"
};

export const MarketStatus = {
    INACTIVE: "INACTIVE",
    OPEN: "OPEN",
    SUSPENDED: "SUSPENDED",
    CLOSED: "CLOSED"
};

export const RunnerStatus = {
    ACTIVE: "ACTIVE",
    WINNER: "WINNER",
    LOSER: "LOSER",
    PLACED: "PLACED",
    REMOVED_VACANT: "REMOVED_VACANT",
    REMOVED: "REMOVED",
    HIDDEN: "HIDDEN"
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

export const MarketBettingTypes = {
    ODDS: "ODDS",
    LINE: "LINE",
    RANGE: "RANGE",
    ASIAN_HANDICAP_DOUBLE_LINE: "ASIAN_HANDICAP_DOUBLE_LINE",
    ASIAN_HANDICAP_SINGLE_LINE: "ASIAN_HANDICAP_SINGLE_LINE",
    FIXED_ODDS: "FIXED_ODDS"
};

export const MarketSort = {
    MINIMUM_TRADED: "MINIMUM_TRADED",
    MAXIMUM_TRADED: "MAXIMUM_TRADED",
    MINIMUM_AVAILABLE: "MINIMUM_AVAILABLE",
    MAXIMUM_AVAILABLE: "MAXIMUM_AVAILABLE",
    FIRST_TO_START: "FIRST_TO_START",
    LAST_TO_START: "LAST_TO_START"
};

export const OrderType = {
    LIMIT: "LIMIT",
    LIMIT_ON_CLOSE: "LIMIT_ON_CLOSE",
    MARKET_ON_CLOSE: "MARKET_ON_CLOSE"
};

export const MarketTypes = {
    Soccer: {
        WINNER: "WINNER",
        UNDIFFERENTIATED: "UNDIFFERENTIATED"
    }
}