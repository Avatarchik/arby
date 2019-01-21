import moment from "moment";
import chalk from "chalk";

import BettingApi from "./apis/betting/betting";
import AccountsApi from "./apis/accounts/accounts";
import Api from "./api";
import { EventTypeIds, MarketProjections, MarketSort } from "./apis/betting/config";
import { APINGException as BettingAPINGException, PlaceExecutionReport } from "./apis/betting/exceptions";
import { APINGException as AccountAPINGException } from "./apis/accounts/exceptions";
import { Operations as BettingOperations } from "./apis/betting/config";
import { Operations as AccountOperations } from "./apis/accounts/config";
import MarketFilter from "./apis/betting/marketFilter";

import {
	getMarketIdsFromCatalogues,
	buildMarkets as buildCompleteMarkets,
	getMarketsWithBackRunnerBelowThreshold,
	getFundsToSpend,
	getSideAndAvgPriceForMarkets,
	allocateFundsPerRunner,
	findRunnersToBack,
	findRunnersToLay,
	findBackerForEachMarket
} from "../../lib/helpers";

const log = console.log;
const error = chalk.bold.red;
const warning = chalk.keyword("orange");
const info = chalk.bold.blueBright;

let bettingApi;
let accountApi;
let api;
let marketFilter;

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

// async function getMarketTypes() {
// 	let response;

// 	try {
// 		response = await bettingApi.listMarketTypes({
// 			filter: {
// 				eventTypeIds: [
// 					EventTypeIds.HORSE_RACING
// 				]
// 			}
// 		});

// 		if (response.data.error) {
// 			throw new BettingAPINGException(response.data.error, BettingOperations.LIST_MARKET_TYPES);
// 		}
// 		return response.data.result;
// 	} catch(err) {
// 		throw {
// 			...err,
// 			stack: console.trace()
// 		};
// 	}
// }

// async function getEventTypes() {
// 	let response;

//     try {
// 		response = await bettingApi.listEventTypes({
// 			filter: {
// 				eventTypeIds: [
// 					EventTypeIds.SOCCER
// 				]
// 			}
// 		});

// 		if (response.data.error) {
// 			throw new BettingAPINGException(response.data.error, BettingOperations.LIST_EVENT_TYPES);
// 		}
// 		return response.data.result;
// 	} catch(err) {
// 		throw {
// 			...err,
// 			stack: trace()
// 		};
// 	}
// }

async function getEvents() {
	let response;

    try {
		response = await bettingApi.listEvents({
			filter: {
				eventTypeIds: [
					EventTypeIds.SOCCER
				]
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

// async function getRunnerBooks(marketBooks) {
//     let response;

//     try {
// 		response = await bettingApi.listRunnerBook({
// 			marketId: marketBooks[0].marketId,
// 			selectionId: String(marketBooks[0].runners[0].selectionId)
// 		});

// 		checkForError(response, BettingOperations.LIST_RUNNER_BOOK, BettingAPINGException);
// 		return response.data.result;
// 	} catch(err) {
// 		throw err;
// 	}
// }

async function placeBets(markets, funds) {
	const fakeFunds = 100;

	let response;
	let fundsToSpends = getFundsToSpend(fakeFunds);
	let sideAndAvgPriceForMarkets = getSideAndAvgPriceForMarkets(markets, fakeFunds);
	let allocatedFunds = allocateFundsPerRunner(sideAndAvgPriceForMarkets, fundsToSpends);
	let theRunner;

	try {
		response = await bettingApi.placeOrders({
			marketId: sideAndAvgPriceForMarkets[0].marketId,
			instructions: sideAndAvgPriceForMarkets[0].runners.map(runner => {
				theRunner = allocatedFunds.find(funds => {
					return (String(funds.marketId) === String(sideAndAvgPriceForMarkets[0].marketId))
						&& (String(funds.selectionId) === String(runner.selectionId));
				});

				return {
					orderType: "LIMIT",
					selectionId: runner.selectionId,
					side: runner.side,
					limitOrder: {
						size: theRunner.toBet,
						price: (theRunner.avgPrice + (theRunner.avgPrice * 0.2)),		// 20% of the current market price...
						persistenceType: "PERSIST"										// No going back...
					}
				}
			}),
			async: false
		});
		// sideAndAvgPriceForMarkets.forEach(async (sidePriceMarket) => {
		// 	response = await bettingApi.placeOrders({
		// 		marketId: sidePriceMarket.marketId,
		// 		instructions: sidePriceMarket.runners.map(runner => {
		// 			theRunner = allocatedFunds.find(funds => {
		// 				return (String(funds.marketId) === String(sidePriceMarket.marketId))
		// 					&& (String(funds.selectionId) === String(runner.selectionId));
		// 			});

		// 			return {
		// 				orderType: "LIMIT",
		// 				selectionId: runner.selectionId,
		// 				side: runner.side,
		// 				limitOrder: {
		// 					size: theRunner.toBet,
		// 					price: (theRunner.avgPrice + (theRunner.avgPrice * 0.2)),		// 20% of the current market price...
		// 					persistenceType: "PERSIST"										// No going back...
		// 				}
		// 			}
		// 		}),
		// 		async: false
		// 	});
		// });

		checkForError(response, BettingOperations.PLACE_ORDERS, BettingAPINGException);
		return response.data.result;
	} catch(err) {
		throw err;
	}
}

async function fixApiCall(error) {
	try {
		switch (error.code) {
			// MarketFilter has too little restrictions
			case "TOO_MUCH_DATA":
				// console.log(error);
				// marketFilter.addFilter(bettingApi);
				// await placeBets()
				break;
			case "INSUFFICIENT_FUNDS":
				// Inform user...AWS SES?
				break;
			default:
				break;
		}
	} catch(err) {
		fixApiCall(err);
	}
}

export async function init() {
	let accountFundsToBet;
	let eventTypeIds;
	let eventIds;
	let marketCatalogues;
	let marketIds;
	let marketBooks;
	let runners;
	let completeMarkets;
	let backPriceLimit = 2;
	let layPriceLimit = 6;
	let marketsWithBestOdds;
	let events;
	let eventTypes;
	let marketTypes;
	let testMarkets;
	let marketsWithBackers;


    api = new Api();
    api.initAxios();
    
    bettingApi = new BettingApi();
    accountApi = new AccountsApi();

    try {
		// Account
		accountFundsToBet = await getAccountFunds();

		// marketTypes = await getMarketTypes();
		events = await getEvents();
		eventIds = events.map(event => event.event.id);

		// marketFilter = getFullMarketFilter(events);
		marketFilter = new MarketFilter([
			EventTypeIds.SOCCER
		], eventIds);
		marketCatalogues = await getMarketCatalogues(marketFilter.filter);

		marketIds = getMarketIdsFromCatalogues(marketCatalogues);

        marketBooks = await getMarketBooks(marketIds);
		// runners = await getRunnerBooks(marketBooks);
		
		completeMarkets = buildCompleteMarkets(marketCatalogues, marketBooks);
		marketsWithBestOdds = getMarketsWithBackRunnerBelowThreshold(completeMarkets, 2);
		marketsWithBackers = findBackerForEachMarket(marketsWithBestOdds);

		await placeBets(marketsWithBestOdds, accountFundsToBet);
    } catch(err) {
		fixApiCall(err);
		console.error(err);
		// console.error(err);
        // log(error(err.message));
    }
}