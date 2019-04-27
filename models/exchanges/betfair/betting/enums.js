const OrderProjection = {
	id: "/OrderProjection",
	type: "string",
	enum: ["ALL", "EXECUTABLE", "EXECUTION_COMPLETE"]
}

const MatchProjection = {
	id: "/MatchProjection",
	type: "string",
	enum: ["NO_ROLLUP", "ROLLED_UP_BY_PRICE", "ROLLED_UP_BY_AVG_PRICE"]
}

const MarketProjection = {
	id: "/MarketProjection",
	type: "array",
	items: {
		type: "string",
		enum: ["COMPETITION", "EVENT", "EVENT_TYPE", "MARKET_START_TIME", "MARKET_DESCRIPTION", "RUNNER_DESCRIPTION", "RUNNER_METADATA"]
	}
}

const MarketSort = {
	id: "/MarketSort",
	type: "array",
	items: {
		type: "string",
		enum: ["MINIMUM_TRADED", "MAXIMUM_TRADED", "MINIMUM_AVAILABLE", "MAXIMUM_AVAILABLE", "FIRST_TO_START", "LAST_TO_START"]
	}
}

const PriceData = {
	id: "/PriceData",
	type: "array",
	items: {
		type: "string",
		enum: ["SP_AVAILABLE", "SP_TRADED", "EX_BEST_OFFERS", "EX_ALL_OFFERS", "EX_TRADED"]
	}
}

const MarketBettingType = {
	id: "/MarketBettingType",
	type: "array",
	items: {
		type: "string",
		enum: ["ODDS", "LINE", "RANGE", "ASIAN_HANDICAP_DOUBLE_LINE", "ASIAN_HANDICAP_SINGLE_LINE", "FIXED_ODDS"]
	}
}

const MarketStatus = {
	id: "/MarketStatus",
	type: "array",
	items: {
		type: "string",
		enum: ["INACTIVE", "OPEN", "SUSPENDED", "CLOSED"]
	}
}

const OrderType = {
	id: "/OrderType",
	type: "string",
	enum: ["LIMIT", "LIMIT_ON_CLOSE", "MARKET_ON_CLOSE"]
}

const Side = {
	id: "/Side",
	type: "string",
	enum: ["BACK", "LAY"]
}

const PersistenceType = {
	id: "/PersistenceType",
	type: "string",
	enum: ["LAPSE", "PERSIST", "MARKET_ON_CLOSE"]
}

const TimeInForce = {
	id: "/TimeInForce",
	type: "array",
	items: {
		type: "string",
		enum: ["FILL_OR_KILL"]
	}
}

module.exports = {
	OrderProjection,
	OrderType,
	PersistenceType,
	PriceData,
	MarketBettingType,
	MatchProjection,
	MarketProjection,
	MarketSort,
	MarketStatus,
	Side,
	TimeInForce
}
