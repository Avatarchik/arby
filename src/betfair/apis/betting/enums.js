const MarketProjection = [
    "COMPETITION",
    "EVENT",
    "EVENT_TYPE",
    "MARKET_START_TIME",
    "MARKET_DESCRIPTION",
    "RUNNER_DESCRIPTION",
    "RUNNER_METADATA"
];

const MarketSort = [
    "MINIMUM_TRADED",
    "MAXIMUM_TRADED",
    "MINIMUM_AVAILABLE",
    "MAXIMUM_AVAILABLE",
    "FIRST_TO_START",
    "LAST_TO_START"
];

const ValidLocales = [
    "en",
    "fr"
];

const Side = [
    "BACK",
    "LAY"
];

const OrderType = [
    "LIMIT",
    "LIMIT_ON_CLOSE"
];

const PersistenceType = [
    "LAPSE",
    "PERSIST",
    "MARKET_ON_CLOSE"
];

const TimeInForce = [
    "FILL_OR_KILL"
];

const MarketStatus = [
    "INACTIVE",
    "OPEN",
    "SUSPENDED",
    "CLOSED"
];

const MarketBettingType = [
    "ODDS",
    "LINE",
    "RANGE",
    "ASIAN_HANDICAP_DOUBLE_LINE",
    "ASIAN_HANDICAP_SINGLE_LINE",
    "FIXED_ODDS"
];

export {
    MarketBettingType,
    MarketProjection,
    MarketSort,
    MarketStatus,
    OrderType,
    PersistenceType,
    Side,
    TimeInForce,
    ValidLocales
}