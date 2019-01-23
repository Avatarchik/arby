import moment from "moment";
import chalk from "chalk";
import scheduler from "node-schedule";
import { forOwn } from "lodash";

import BettingApi from "./betting/betting";
import AccountsApi from "./accounts/accounts";
import { EventTypeIds, MarketProjections, MarketSort } from "./betting/config";
import { APINGException as BettingAPINGException, PlaceExecutionReport } from "./betting/exceptions";
import { APINGException as AccountAPINGException } from "./accounts/exceptions";
import { Operations as BettingOperations } from "./betting/config";
import { Operations as AccountOperations } from "./accounts/config";
import MarketFilter from "./betting/marketFilter";
import BetfairConfig from "./config";
import { handleApiException } from "./exceptions";

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

function checkForError(resp, operation, apiException) {
	if (resp.data.error) {
		throw new apiException(resp.data.error, operation);
	}
	if ((resp.data.result instanceof Array && !resp.data.result.length)
		|| (resp.data.result instanceof Object && !Object.keys(resp.data.result).length)) {
		throw {
			code: "NO_DATA",
			operation,
			message: "There were no results retrieved from this operation",
			stack: new Error().stack
		}
	}
	if (resp.data.result.status === "FAILURE") {
		throw new PlaceExecutionReport(resp.data.result, operation)
	}
}

async function getAccountFunds() {
    let response;
    
    try {
		response = await accountApi.getAccountFunds({
			filter: {}
		});

		checkForError(response, AccountOperations.GET_ACCOUNT_FUNDS, AccountAPINGException);
		return response.data.result;
	} catch(err) {
		throw err;
	}
}

async function getEvents(eventTypeIds) {
	let response;

    try {
		response = await bettingApi.listEvents({
			filter: {
				eventTypeIds,
				marketStartTime: {
					from: moment().startOf("day").format(),
					to: moment().endOf("day").format()
				},
			}
		});

		checkForError(response, BettingOperations.LIST_EVENTS, BettingAPINGException);
		return response.data.result;
	} catch(err) {
		throw err;
	}
}

async function getMarketCatalogues(filter) {
	let response;

    try {
		response = await bettingApi.listMarketCatalogue({
			filter,
			marketProjection: [
				MarketProjections.EVENT_TYPE,
				MarketProjections.EVENT,
				MarketProjections.MARKET_START_TIME,
				MarketProjections.MARKET_DESCRIPTION,
				MarketProjections.RUNNER_DESCRIPTION,
			],
			maxResults: 100
		});

		checkForError(response, BettingOperations.LIST_MARKET_CATALOGUE, BettingAPINGException);
		return response.data.result;
	} catch(err) {
		throw err;
	}
}

async function getMarketBooks(marketIds) {
	let response;

    try {
		response = await bettingApi.listMarketBook({
			marketIds,
			priceProjection: {
				priceData: [
					"EX_BEST_OFFERS"
				]
			}
			//orderProjection: "ALL"
		});

		checkForError(response, BettingOperations.LIST_MARKET_BOOK, BettingAPINGException);
		return response.data.result;
	} catch(err) {
		throw err;
	}
}

async function placeBets(markets, funds) {
	const marketsWithAllocatedFunds = allocateFundsPerRunner(markets, funds);

	let response;

	try {
		response = await bettingApi.placeOrders({
			marketId: marketsWithAllocatedFunds[0].marketId,
			instructions: [
				{
					orderType: "LIMIT",
					selectionId: String(marketsWithAllocatedFunds[0].runnerToBack.selectionId),
					side: "BACK",
					limitOrder: {
						size: Number(marketsWithAllocatedFunds[0].runnerToBack.priceToBet),
						price: marketsWithAllocatedFunds[0].runnerToBack.lowestPrice,		// 20% of the current market price...
						persistenceType: "PERSIST"										// No going back...
					}
				}
			],
			async: false
		});

		checkForError(response, BettingOperations.PLACE_ORDERS, BettingAPINGException);
		return response.data.result;
	} catch(err) {
		throw err;
	}
}

function resolveScheduledJob(fired) {
	
}

function setupScheduleJobs() {
	const betfairConfig = new BetfairConfig();

	let dateToSchedule;

	forOwn(betfairConfig.schedules, (schedules, key) => {
		schedules.forEach(schedule => {
			dateToSchedule = new Date(schedule);

			scheduler.scheduleJob(dateToSchedule, resolveScheduledJob);
		});
	});
}

export async function setupDayBetting() {
	const fakeFunds = 100;
	const betfairConfig = new BetfairConfig();
	const eventTypes = [
		EventTypeIds.SOCCER
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
		// fixApiCall(err);
		// console.error(err);
    }
}

export async function initMatchOddsScalping() {
	try {
		await setupDayBetting();
		setupScheduleJobs();
	} catch(err) {
		console.error(err);
	}
}

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
		fixApiCall(err);
		console.error(err);
		// console.error(err);
        // log(error(err.message));
    }
}

export default class Betfair {
	constructor() {

	}
}