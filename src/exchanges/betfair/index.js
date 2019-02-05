import moment from "moment";
import scheduler from "node-schedule";
import {
	forOwn
} from "lodash";
import fs from "fs";
import path from "path";

import BettingApi from "./apis/betting";
import AccountsApi from "./apis/accounts";
// import MarketFilter from "./betting/marketFilter";
import BetfairConfig from "./config";
import {
	handleApiException,
	checkForException,
	getException
} from "./exceptions";
import {
	MarketProjection,
	PriceData,
	OrderType,
	Side,
	PersistenceType,
	EventTypes,
	Operations as BettingOperations,
	MarketBettingType
} from "../../../lib/enums/exchanges/betfair/betting";
import {
	Operations as AccountOperations
} from "../../../lib/enums/exchanges/betfair/account";
import * as helpers from "../../../lib/helpers";

const Account = "Account";
const Betting = "Betting";

let bettingApi;
let accountApi;
let betfairConfig;

async function getAccountFunds(...args) {
	const params = {
		filter: {}
	};
	const funcName = getAccountFunds.name

	let response;

	try {
		response = await accountApi.getAccountFunds(params);

		checkForException(response, AccountOperations.GET_ACCOUNT_FUNDS, Account);

		betfairConfig.balance = response.data.result.availableToBetBalance;
	} catch (err) {
		throw getException(err, params, Account, funcName, args);
	}
}

async function getEventTypes() {
	const params = {
		filter: {}
	};

	let response;

	try {
		response = await bettingApi.listEventTypes(params);

		return response.data.result;
	} catch(err) {
		console.error(err);
	}
}

async function getEvents(eventTypeIds) {
	const params = {
		filter: {
			eventTypeIds,
			marketStartTime: {
				from: moment().startOf("day").format(),
				to: moment().endOf("day").format()
			},
		}
	};
	const funcName = getEvents.name;

	let response;

	try {
		response = await bettingApi.listEvents(params);

		checkForException(response, BettingOperations.LIST_EVENTS, Betting);

		return response.data.result;
	} catch (err) {
		throw getException(err, params, Betting, funcName, args);
	}
}

async function getMarketCatalogues(eventIds) {
	const params = {
		filter: {
            eventIds,
            marketBettingTypes: [
                MarketBettingType.ODDS.val
            ]
        },
		marketProjection: [
			MarketProjection.EVENT_TYPE.val,
			MarketProjection.EVENT.val,
			MarketProjection.MARKET_START_TIME.val,
			MarketProjection.MARKET_DESCRIPTION.val,
			MarketProjection.RUNNER_DESCRIPTION.val,
		],
		maxResults: 100
	};

	let response;

	try {
		response = await bettingApi.listMarketCatalogue(params);

		checkForException(response, BettingOperations.LIST_MARKET_CATALOGUE, Betting);
		getMarketBooks(response.data.result);
	} catch (err) {
		throw getException(err, params, Betting);
	}
}

async function getMarketBooks(...args) {
	const marketCatalogues = args[0];
	const marketIds = marketCatalogues.map(market => market.marketId)
	const params = {
		marketIds,
		priceProjection: {
			priceData: [
				PriceData.EX_BEST_OFFERS.val
			]
		}
	};

	let response;
	let completeMarkets;

	try {
		response = await bettingApi.listMarketBook(params);

		checkForException(response, BettingOperations.LIST_MARKET_BOOK, Betting);
		// You can flag this as the ending point for this process. This entire string of functions is meant to be triggered
		// at midnight to get a complete list of the games that day
		completeMarkets = helpers.buildCompleteMarkets(marketCatalogues, response.data.result);

		betfairConfig.schedules = helpers.extractSchedules(completeMarkets);
	} catch (err) {
		throw getException(err, params, Betting);
	}
}

async function placeBets(markets, funds) {
	const marketsWithAllocatedFunds = helpers.allocateFundsPerRunner(markets, funds);
	const params = {
		marketId: marketsWithAllocatedFunds[0].marketId,
		instructions: [{
			orderType: OrderType.LIMIT.val,
			selectionId: String(marketsWithAllocatedFunds[0].runnerToBack.selectionId),
			side: Side.BACK.val,
			limitOrder: {
				size: Number(marketsWithAllocatedFunds[0].runnerToBack.priceToBet),
				price: marketsWithAllocatedFunds[0].runnerToBack.lowestPrice, // 20% of the current market price...
				persistenceType: PersistenceType.PERSIST.val // No going back...
			}
		}],
		async: false
	};

	let response;

	try {
		response = await bettingApi.placeOrders(params);

		checkForException(response, BettingOperations.PLACE_ORDERS, Betting);
		return response.data.result;
	} catch (err) {
		throw getException(err, params, Betting);
	}
}

function resolveScheduledJob(fired) {

}

function setupScheduleJobs() {
	let dateToSchedule;
	let eventLength;

	forOwn(betfairConfig.schedules, (schedules, key) => {
		schedules.forEach(schedule => {
			eventLength = EventTypes[key.toUpperCase()].eventLength;
			dateToSchedule = moment(schedule).add(eventLength, "m").toDate();

			scheduler.scheduleJob(dateToSchedule, resolveScheduledJob);
		});
	});
}

function getEventTypeIds(eventTypes) {
	const sportsToUse = betfairConfig.sportsToUse;

	return eventTypes.filter(event => {
		return (sportsToUse.indexOf(event.eventType.name) > -1)
	})
		.map(event => event.eventType.id);
}

function eventNameIsSet(event) {
	return event.event.name === "Set 01"
		|| event.event.name === "Set 02"
		|| event.event.name === "Set 03"
		|| event.event.name === "Set 04"
		|| event.event.name === "Set 05";
}

// For some reason, Betfair returns the sets for a tennis match as events
// This is a function to remove the,
function removeBogusTennisEvents(events) {
	return events.filter(event => {
		return !eventNameIsSet(event);
	});
}

export async function setupDayBetting() {
	let eventTypes;
	let eventTypeIds;
	let eventIds;
	let events;
	let trueEvents;

	try {
		// TODO: Renaming needed. This initial invocation cycles through all functions 1 after another
		// Did it this way so that if there is an error, it will be able to be rectified and continue on from where left off
		await getAccountFunds();
		eventTypes = await getEventTypes();
		eventTypeIds = getEventTypeIds(eventTypes);

		events = await getEvents(eventTypeIds);
		trueEvents = removeBogusTennisEvents(events);
		fs.writeFileSync("betfair_events.json", JSON.stringify(trueEvents));
		console.log("::: number of events: ", trueEvents.length);
		eventIds = trueEvents.map(event => event.event.id);

		marketCatalogues = await getMarketCatalogues(eventIds);

		// marketIds = getMarketIdsFromCatalogues(marketCatalogues);
		// marketBooks = await getMarketBooks(marketIds);

		// completeMarkets = buildCompleteMarkets(marketCatalogues, marketBooks);

		// betfairConfig.schedules = extractSchedules(completeMarkets);

		// return completeMarkets;
	} catch (err) {
		handleApiException(err);
	}
}

// export async function initMatchOddsScalping() {
// 	try {
// 		await setupDayBetting();
// 		setupScheduleJobs();
// 	} catch(err) {
// 		console.error(err);
// 	}
// }

export async function init() {
	let markets;
	let marketsWithBestOdds;
	let marketsWithBackers;
	let marketsToPlaceOrders;

	betfairConfig = new BetfairConfig();

	betfairConfig.initAxios();
	await betfairConfig.login();

	bettingApi = new BettingApi();
	accountApi = new AccountsApi();

	try {
		markets = await setupDayBetting();

		marketsWithBestOdds = helpers.getMarketsWithBackRunnerBelowThreshold(markets, 2);
		marketsWithBackers = helpers.findBackerForEachMarket(marketsWithBestOdds);
		marketsToPlaceOrders = helpers.determineMarketsToPlaceOrder(marketsWithBackers, betfairConfig.fundsAllowedToBet, 2);

		await placeBets(marketsToPlaceOrders, betfairConfig.fundsAllowedToBet);
	} catch (err) {
		handleApiException(err);
	}
}