import moment from "moment";
import scheduler from "node-schedule";
import { forOwn } from "lodash";

import BettingApi from "./betting/betting";
import AccountsApi from "./accounts/accounts";
import MarketFilter from "./betting/marketFilter";
import BetfairConfig from "./config";
import { handleApiException, checkForException, getException } from "./exceptions";
import {
	MarketProjection,
	PriceData,
	OrderType,
	Side,
	PersistenceType,
	EventTypes,
	Operations as BettingOperations
} from "../../lib/enums/betting";
import { Operations as AccountOperations } from "../../lib/enums/account";
import * as helpers from "../../lib/helpers";

const eventTypes = [
	EventTypes.SOCCER.id
];
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

		betfairConfig.fundsAvailableToBet = 100;
		// betfairConfig.fundsAvailableToBet = accountFunds.availableToBetBalance;
		betfairConfig.percentOfFundsToSave = 0.35;

		getEvents(eventTypes);
	} catch(err) {
		throw getException(err, params, Account, funcName, args);
	}
}

async function getEvents(...args) {
	const params = {
		filter: {
			eventTypeIds: args[0],
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
		getMarketCatalogues(response.data.result);
	} catch(err) {
		throw getException(err, params, Betting, funcName, args);
	}
}

async function getMarketCatalogues(...args) {
	const events = args[0];
	const eventIds = events.map(event => event.event.id);
	const marketFilter = new MarketFilter(eventIds);
	const params = {
		filter: marketFilter.filter,
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
	} catch(err) {
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
	} catch(err) {
		throw getException(err, params, Betting);
	}
}

async function placeBets(markets, funds) {
	const marketsWithAllocatedFunds = helpers.allocateFundsPerRunner(markets, funds);
	const params = {
		marketId: marketsWithAllocatedFunds[0].marketId,
		instructions: [
			{
				orderType: OrderType.LIMIT.val,
				selectionId: String(marketsWithAllocatedFunds[0].runnerToBack.selectionId),
				side: Side.BACK.val,
				limitOrder: {
					size: Number(marketsWithAllocatedFunds[0].runnerToBack.priceToBet),
					price: marketsWithAllocatedFunds[0].runnerToBack.lowestPrice,		// 20% of the current market price...
					persistenceType: PersistenceType.PERSIST.val						// No going back...
				}
			}
		],
		async: false
	};

	let response;

	try {
		response = await bettingApi.placeOrders(params);

		checkForException(response, BettingOperations.PLACE_ORDERS, Betting);
		return response.data.result;
	} catch(err) {
		throw getException(err, params, Betting);
	}
}

function resolveScheduledJob(fired) {
	
}

function setupScheduleJobs() {
	let dateToSchedule;
	let eventLength;

	forOwn(betfairConfig.schedules, (schedules, key) => {
		schedules.forEach(schedule => {
			eventLength = EventTypes[key.toUpperCase()].eventLength;
			dateToSchedule = moment(schedule).add(eventLength, "m").toDate();

			scheduler.scheduleJob(dateToSchedule, resolveScheduledJob);
		});
	});
}

export async function setupDayBetting() {
	const fakeFunds = 100;

    try {
		// TODO: Renaming needed. This initial invocation cycles through all functions 1 after another
		// Did it this way so that if there is an error, it will be able to be rectified and continue on from where left off
		await getAccountFunds();

		// events = await getEvents(eventTypes);
		// eventIds = events.map(event => event.event.id);

		// marketFilter = new MarketFilter(eventIds);
		// marketCatalogues = await getMarketCatalogues(marketFilter.filter);

		// marketIds = getMarketIdsFromCatalogues(marketCatalogues);
		// marketBooks = await getMarketBooks(marketIds);
		
		// completeMarkets = buildCompleteMarkets(marketCatalogues, marketBooks);

		// betfairConfig.schedules = extractSchedules(completeMarkets);

		// return completeMarkets;
    } catch(err) {
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

	await betfairConfig.login();
    betfairConfig.initApis();
    
    bettingApi = new BettingApi();
    accountApi = new AccountsApi();

    try {
		markets = await setupDayBetting();

		marketsWithBestOdds = helpers.getMarketsWithBackRunnerBelowThreshold(markets, 2);
		marketsWithBackers = helpers.findBackerForEachMarket(marketsWithBestOdds);
		marketsToPlaceOrders = helpers.determineMarketsToPlaceOrder(marketsWithBackers, betfairConfig.fundsAllowedToBet, 2);

		await placeBets(marketsToPlaceOrders, betfairConfig.fundsAllowedToBet);
    } catch(err) {
		handleApiException(err);
    }
}