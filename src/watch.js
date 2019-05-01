const BetfairBettingApi = require("./exchanges/betfair/apis/betting")
const MatchbookBettingApi = require("./exchanges/matchbook/apis/betting")
const BetfairConfig = require("./exchanges/betfair/config")
const MatchbookConfig = require("./exchanges/matchbook/config")
const { getConfig } = require("./db/helpers")
const { checkForException, getException } = require("./exchanges/betfair/exceptions")
const {
	MarketProjection,
	PriceData,
	OrderProjection,
	BettingOperations,
	MarketBettingType,
	MatchProjection
} = require("../lib/enums/exchanges/betfair/betting")
const { findSameMarkets } = require("./helper")
const { getFormattedMarkets_betfair } = require("./exchanges/betfair/format")
const { getFormattedMarkets_matchbook } = require("./exchanges/matchbook/format")

const BETTING = "Betting"

let matchbookInstance
let betfairInstance

async function getMarketCatalogues(db, bettingApi) {
	const type = BETTING
	const funcName = getMarketCatalogues.name

	let params = {
		filter: {
			eventIds: [
				JSON.parse(process.env.EXCHANGES)
					.find(ex => {
						return ex.exchange === "BETFAIR"
					})
					.eventId.toString()
			]
		},
		marketProjection: [
			MarketProjection.EVENT_TYPE.val,
			MarketProjection.EVENT.val,
			MarketProjection.MARKET_START_TIME.val,
			MarketProjection.MARKET_DESCRIPTION.val,
			MarketProjection.RUNNER_DESCRIPTION.val
		],
		maxResults: 1000
	}
	let response
	let config

	try {
		config = await getConfig(db)
		params.filter.marketBettingTypes = [
			...(config[0].betOnOdds ? [MarketBettingType.ODDS.val] : []),
			...(config[0].betOnSpread ? [MarketBettingType.LINE.val] : []),
			...(config[0].betOnAsianHandicapSingleLine ? [MarketBettingType.ASIAN_HANDICAP_SINGLE_LINE.val] : []),
			...(config[0].betOnAsianHandicapDoubleLine ? [MarketBettingType.ASIAN_HANDICAP_DOUBLE_LINE.val] : [])
		]

		response = await bettingApi.listMarketCatalogue(params)

		checkForException(response, BettingOperations.LIST_MARKET_CATALOGUE, type)

		return response.data.result
	} catch (err) {
		switch (err.code) {
			case "TOO_MUCH_DATA":
				return getMarketCatalogues(db)
			default:
				throw getException({
					err,
					params,
					type,
					funcName
				})
		}
	}
}

async function getMarketBooks(db, catalogues, bettingApi) {
	const type = BETTING
	const funcName = getMarketBooks.name

	const params = {
		marketIds: catalogues.map(catalogue => catalogue.marketId),
		priceProjection: {
			priceData: [PriceData.EX_BEST_OFFERS.val]
		},
		orderProjection: OrderProjection.EXECUTABLE.val,
		matchProjection: MatchProjection.ROLLED_UP_BY_AVG_PRICE.val
	}
	let response

	try {
		response = await bettingApi.listMarketBook(params)

		checkForException(response, BettingOperations.LIST_MARKET_BOOK, type)
		return response.data.result
	} catch (err) {
		throw getException({
			err,
			params,
			type,
			funcName
		})
	}
}

const getMarketFuncs = {
	getMarkets_matchbook,
	getMarkets_betfair
}

async function getMarkets_betfair(db) {
	const bettingApi = new BetfairBettingApi()
	const marketCatalogues = await getMarketCatalogues(db, bettingApi)
	const marketBooks = await getMarketBooks(db, marketCatalogues, bettingApi)
	const marketBookIds = marketBooks.map(book => book.marketId)
	// For some reason, 'listMarketBook' sometimes returns fewer/missing markets that are returned by 'listMarketCatalogue'
	// For this reason, we filter out the catalogues that do not have a market book associated with them
	// Reference: https://forum.developer.betfair.com/forum/sports-exchange-api/exchange-api/27617-listmarketbook-and-listmarketcatalogue-returning-different-amounts-of-data
	const marketsWithBook = marketCatalogues.filter(catalogue => {
		return marketBookIds.includes(catalogue.marketId)
	})

	return getFormattedMarkets_betfair(marketsWithBook)
}

async function getMarkets_matchbook() {
	const bettingApi = new MatchbookBettingApi()
	const eventId = JSON.parse(process.env.EXCHANGES)
		.find(ex => {
			return ex.exchange === "MATCHBOOK"
		})
		.eventId.toString()
	const response = await bettingApi.getMarkets(eventId, {
		"odds-type": "DECIMAL",
		"include-prices": false,
		currency: "GBP"
	})

	return getFormattedMarkets_matchbook(response.data.markets)
}

async function initApis() {
	matchbookInstance = new MatchbookConfig()
	betfairInstance = new BetfairConfig()

	betfairInstance.initAxios()
	matchbookInstance.initAxios()

	if (!process.env.BETFAIR_SESSIONTOKEN) {
		await betfairInstance.login()
	}
	if (!process.env.MATCHBOOK_SESSIONTOKEN) {
		await matchbookInstance.login()
	}
}

async function initPricePolls(markets, db) {
	console.log("here")
}

exports.watchEvent = async function(db) {
	const exchangesInvolved = JSON.parse(process.env.EXCHANGES).map(ex => ex.exchange)

	let markets
	let sameMarkets

	try {
		await initApis()
		markets = await Promise.all(
			exchangesInvolved.map(async exchange => {
				return await getMarketFuncs[`getMarkets_${exchange.toLowerCase()}`](db)
			}, this)
		)
		sameMarkets = findSameMarkets(markets)

		initPricePolls.bind(this)(sameMarkets, db)

		// setInterval(initPricePolls.bind(this)(exchangesInvolved, db), 300000) // Poll the exchanges every 5 minutes
	} catch (err) {
		console.error(err)
	}
}
