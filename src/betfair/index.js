import moment from "moment";
import chalk from "chalk";

import BettingApi from "./apis/betting/betting";
import AccountsApi from "./apis/accounts/accounts";
import Api from "./api";
import { EventTypeIds } from "./apis/betting/config";
import { APINGException as BettingAPINGException } from "./apis/betting/exceptions";
import { APINGException as AccountAPINGException } from "./apis/accounts/exceptions";
import { Operations as BettingOperations } from "./apis/betting/config";
import { Operations as AccountOperations } from "./apis/accounts/config";

import {
	getMarketIdsFromCatalogues,
	buildMarkets,
	calculateBestOdds,
	getFundsToSpend,
	getSideAndAvgPriceForMarkets,
	allocateFundsPerRunner
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
		throw err;
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
		throw error;
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
				marketCountries: [
					"GB"
				],
				turnInPlayEnabled: true,
				// inPlayOnly: true,
				marketBettingTypes: [
					"ODDS"
				]
			}
		});

		if (response.data.error) {
			throw new BettingAPINGException(response.data.error, BettingOperations.LIST_EVENTS);
		}
		return response.data.result;
	} catch(err) {
		throw err;
	}
}

async function getMarketCatalogues(eventIds) {
	let response;

    try {
		response = await bettingApi.listMarketCatalogue({
			filter: {
				eventIds
			},
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

		if (response.data.error) {
			throw new BettingAPINGException(response.data.error, BettingOperations.LIST_MARKET_BOOK);
		}
		return response.data.result;
	} catch(err) {
		throw err;
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
		throw err;
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
		sideAndAvgPriceForMarkets.forEach(async (sidePriceMarket) => {
			placeOrder = {
				marketId: sidePriceMarket.marketId,
				instructions: sidePriceMarket.runners.map(runner => {
					theRunner = allocatedFunds.find(funds => {
						return (String(funds.marketId) === String(sidePriceMarket.marketId))
							&& (String(funds.selectionId) === String(runner.selectionId));
					});

					return {
						orderType: "LIMIT",
						selectionId: runner.selectionId,
						side: runner.side,
						limitOrder: {
							size: theRunner.toBet,
							price: (theRunner.toBet + (theRunner.toBet * 0.2)),		// 20% of the current market price...
							persistenceType: "PERSIST"								// No going back...
						}
					}
				}),
				async: false
			};

			console.log("------------------");
			console.log("::: placeOrder :::");
			console.log(placeOrder);
			console.log("------------------");
		});

		// if (response.data.error) {
		// 	throw new BettingAPINGException(response.data.error, BettingOperations.PLACE_ORDERS);
		// }
		// return response.data.result;
	} catch(err) {
		throw err;
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
	let priceLimit = 2;
	let marketsWithBestOdds;
	let events;
	let eventTypes;

    api = new Api();
    api.initAxios();
    
    bettingApi = new BettingApi();
    accountApi = new AccountsApi();

    try {
        accountFundsToBet = await getAccountFunds();
		eventTypes = await getEventTypes();
		eventTypeIds = eventTypes.map(eventType => eventType.eventType.id);
		events = await getEvents(eventTypeIds);
		eventIds = events.map(event => event.event.id);
		marketCatalogues = await getMarketCatalogues(eventIds);

		marketIds = getMarketIdsFromCatalogues(marketCatalogues);

        marketBooks = await getMarketBooks(marketIds);
		runners = await getRunnerBooks(marketBooks);
		
		matchOddsMarkets = buildMarkets(marketCatalogues, marketBooks);

		marketsWithBestOdds = calculateBestOdds(matchOddsMarkets, priceLimit);

		await placeBets(marketsWithBestOdds, accountFundsToBet);

		console.log(marketsWithBestOdds);
    } catch(err) {
        log(error(err.message));
    }
}