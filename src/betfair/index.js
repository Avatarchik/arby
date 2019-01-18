import moment from "moment";
import chalk from "chalk";

import BettingApi from "./apis/betting/betting";
import AccountsApi from "./apis/accounts/accounts";
import Api from "./api";
import { EventTypeIds } from "./apis/betting/config";
import { APINGException as BettingAPINGException, PlaceExecutionReport } from "./apis/betting/exceptions";
import { APINGException as AccountAPINGException } from "./apis/accounts/exceptions";
import { Operations as BettingOperations } from "./apis/betting/config";
import { Operations as AccountOperations } from "./apis/accounts/config";

import {
	getMarketIdsFromCatalogues,
	buildMarkets,
	calculateBestOdds,
	getFundsToSpend,
	getSideAndAvgPriceForMarkets,
	allocateFundsPerRunner,
	getFullMarketFilter
} from "../lib/helpers";

const log = console.log;
const error = chalk.bold.red;
const warning = chalk.keyword("orange");
const info = chalk.bold.blueBright;

let bettingApi;
let accountApi;
let api;

async function getAccountFunds() {
    let response;
    
    try {
		response = await accountApi.getAccountFunds({
			filter: {}
		});

		if (response.data.error) {
			throw new AccountAPINGException(response.data.error, AccountOperations.GET_ACCOUNT_FUNDS);
		}
		return response.data.result;
	} catch(err) {
		throw {
			...err,
			stack: console.trace()
		};
	}
}

async function getMarketTypes() {
	let response;
	let stack;

	try {
		response = await bettingApi.listMarketTypes({
			filter: {
				eventTypeIds: [
					EventTypeIds.SOCCER
				]
			}
		});

		if (response.data.error) {
			throw new BettingAPINGException(response.data.error, BettingOperations.LIST_MARKET_TYPES);
		}
		return response.data.result;
	} catch(err) {
		throw {
			...err,
			stack: console.trace()
		};
	}
}

async function getEventTypes() {
	let response;

    try {
		response = await bettingApi.listEventTypes({
			filter: {
				eventTypeIds: [
					EventTypeIds.SOCCER
				]
			}
		});

		if (response.data.error) {
			throw new BettingAPINGException(response.data.error, BettingOperations.LIST_EVENT_TYPES);
		}
		return response.data.result;
	} catch(err) {
		throw {
			...err,
			stack: trace()
		};
	}
}

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

		if (response.data.error) {
			throw new BettingAPINGException(response.data.error, BettingOperations.LIST_EVENTS);
		}
		return response.data.result;
	} catch(err) {
		throw {
			...err,
			stack: trace()
		};
	}
}

async function getMarketCatalogues(filter) {
	let response;

    try {
		response = await bettingApi.listMarketCatalogue({
			filter,
			marketProjection: [
				"EVENT",
				"MARKET_START_TIME",
				"MARKET_DESCRIPTION",
				"RUNNER_DESCRIPTION",
			],
			maxResults: 100
		});

		if (response.data.error) {
			throw new BettingAPINGException(response.data.error, BettingOperations.LIST_MARKET_CATALOGUE);
		}
		return response.data.result;
	} catch(err) {
		throw {
			...err,
			stack: trace()
		};
	}
}

async function getMarketBooks(marketIds) {
	let response;
	let stack;

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

		if (response.data.error) {
			throw new BettingAPINGException(response.data.error, BettingOperations.LIST_MARKET_BOOK);
		}
		return response.data.result;
	} catch(err) {
		throw {
			...err,
			stack: console.trace()
		};
	}
}

async function getRunnerBooks(marketBooks) {
    let response;

    try {
		response = await bettingApi.listRunnerBook({
			marketId: marketBooks[0].marketId,
			selectionId: String(marketBooks[0].runners[0].selectionId)
		});
		// do not let the name fool you... what is returned is actually a MarketBook but just with the 1 runner specified

		if (response.data.error) {
			throw new BettingAPINGException(response.data.error, BettingOperations.LIST_RUNNER_BOOK);
		}
		return response.data.result;
	} catch(err) {
		throw {
			...err,
			stack: trace()
		};
	}
}

async function placeBets(markets, funds) {
	const fakeFunds = 100;

	let response;
	let fundsToSpends = getFundsToSpend(fakeFunds);
	let sideAndAvgPriceForMarkets = getSideAndAvgPriceForMarkets(markets);
	let allocatedFunds = allocateFundsPerRunner(sideAndAvgPriceForMarkets, fundsToSpends);
	let theRunner;
	let placeOrder;

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

		if (response.data.error) {
			throw new BettingAPINGException(response.data.error, BettingOperations.PLACE_ORDERS);
		}
		if (response.data.result.status === "FAILURE") {
			throw new PlaceExecutionReport(response.data.result, BettingOperations.PLACE_ORDERS);
		}
		return response.data.result;
	} catch(err) {
		throw {
			...err,
			stack: trace()
		};
	}
}

function fixApiCall(error) {
	switch (error.code) {
		// MarketFilter has too little restrictions
		case "TOO_MUCH_DATA":
			console.log(error);
			break;
		case "INSUFFICIENT_FUNDS":
			// Inform user...AWS SES?
			break;
		default:
			break;
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
	let matchOddsMarkets;

	// Lay price will be higher (worse chances...better payouts) than back price
	let backPriceLimit = 2;
	let layPriceLimit = 6;
	let marketsWithBestOdds;
	let events;
	let eventTypes;
	let marketTypes;
	let marketFilter;

    api = new Api();
    api.initAxios();
    
    bettingApi = new BettingApi();
    accountApi = new AccountsApi();

    try {
		// Account
		accountFundsToBet = await getAccountFunds();

		// marketTypes = await getMarketTypes();
		events = await getEvents();

		marketFilter = getFullMarketFilter(events);
		marketCatalogues = await getMarketCatalogues(marketFilter);

		marketIds = getMarketIdsFromCatalogues(marketCatalogues);

        marketBooks = await getMarketBooks(marketIds);
		runners = await getRunnerBooks(marketBooks);
		
		matchOddsMarkets = buildMarkets(marketCatalogues, marketBooks);

		marketsWithBestOdds = calculateBestOdds(matchOddsMarkets, 2);

		await placeBets(marketsWithBestOdds, accountFundsToBet);
    } catch(err) {
		fixApiCall(err);
		console.error(err);
		// console.error(err);
        // log(error(err.message));
    }
}