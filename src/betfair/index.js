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
import {
	getMarketIdsFromCatalogues,
	buildCompleteMarkets,
	getMarketsWithBackRunnerBelowThreshold,
	allocateFundsPerRunner,
	findBackerForEachMarket,
	determineMarketsToPlaceOrder,
	extractSchedules
} from "../../lib/helpers";

let bettingApi;
let accountApi;
let marketFilter;
let betfairConfig;

async function getAccountFunds() {
	const params = {
		filter: {}
	};
	const type = "account";

	let response;
    
    try {
		response = await accountApi.getAccountFunds(params);

		checkForException(response, AccountOperations.GET_ACCOUNT_FUNDS, type);
		return response.data.result;
	} catch(err) {
		throw getException(err, params, type);
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
	const type = "betting";

	let response;

    try {
		response = await bettingApi.listEvents(params);

		checkForException(response, BettingOperations.LIST_EVENTS, type);
		return response.data.result;
	} catch(err) {
		throw getException(err, params, type);
	}
}

async function getMarketCatalogues(filter) {
	const params = {
		filter,
		marketProjection: [
			MarketProjection.EVENT_TYPE.val,
			MarketProjection.EVENT.val,
			MarketProjection.MARKET_START_TIME.val,
			MarketProjection.MARKET_DESCRIPTION.val,
			MarketProjection.RUNNER_DESCRIPTION.val,
		],
		maxResults: 100
	};
	const type = "betting";

	let response;

    try {
		response = await bettingApi.listMarketCatalogue(params);

		checkForException(response, BettingOperations.LIST_MARKET_CATALOGUE, type);
		return response.data.result;
	} catch(err) {
		throw getException(err, params, type);
	}
}

async function getMarketBooks(marketIds) {
	const params = {
		marketIds,
		priceProjection: {
			priceData: [
				PriceData.EX_BEST_OFFERS.val
			]
		}
		//orderProjection: "ALL"
	};
	const type = "betting";

	let response;

    try {
		response = await bettingApi.listMarketBook(params);

		checkForException(response, BettingOperations.LIST_MARKET_BOOK, type);
		return response.data.result;
	} catch(err) {
		throw getException(err, params, type);
	}
}

async function placeBets(markets, funds) {
	const marketsWithAllocatedFunds = allocateFundsPerRunner(markets, funds);
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
	const type = "betting";

	let response;

	try {
		response = await bettingApi.placeOrders(params);

		checkForException(response, BettingOperations.PLACE_ORDERS, type);
		return response.data.result;
	} catch(err) {
		throw getException(err, params, type);
	}
}

function resolveScheduledJob(fired) {
	
}

function setupScheduleJobs() {
	const betfairConfig = new BetfairConfig();

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
	const betfairConfig = new BetfairConfig();
	const eventTypes = [
		EventTypes.SOCCER.id
	];

	let eventIds;
	let marketCatalogues;
	let marketIds;
	let marketBooks;
	let completeMarkets;
	let events;

    try {
		accountFunds = await getAccountFunds();

		betfairConfig.fundsAvailableToBet = 100;
		// betfairConfig.fundsAvailableToBet = accountFunds.availableToBetBalance;
		betfairConfig.percentOfFundsToSave = 0.35;

		events = await getEvents(eventTypes);
		eventIds = events.map(event => event.event.id);

		marketFilter = new MarketFilter(eventIds);
		marketCatalogues = await getMarketCatalogues(marketFilter.filter);

		marketIds = getMarketIdsFromCatalogues(marketCatalogues);
		marketBooks = await getMarketBooks(marketIds);
		
		completeMarkets = buildCompleteMarkets(marketCatalogues, marketBooks);

		betfairConfig.schedules = extractSchedules(completeMarkets);

		return completeMarkets;
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
	betfairConfig = new BetfairConfig();

	let markets;
	let marketsWithBestOdds;
	let marketsWithBackers;
	let marketsToPlaceOrders;

    betfairConfig.initApis();
    
    bettingApi = new BettingApi();
    accountApi = new AccountsApi();

    try {
		markets = await setupDayBetting();

		marketsWithBestOdds = getMarketsWithBackRunnerBelowThreshold(markets, 2);
		marketsWithBackers = findBackerForEachMarket(marketsWithBestOdds);
		marketsToPlaceOrders = determineMarketsToPlaceOrder(marketsWithBackers, betfairConfig.fundsAllowedToBet, 2);

		await placeBets(marketsToPlaceOrders, betfairConfig.fundsAllowedToBet);
    } catch(err) {
		handleApiException(err);
    }
}