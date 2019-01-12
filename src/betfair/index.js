import moment from "moment";
import chalk from "chalk";
import { flattenDeep } from "lodash";

import BettingApi from "./apis/betting/betting";
import AccountsApi from "./apis/accounts/accounts";
import Api from "./api";
import { EventTypeIds } from "./apis/betting/config";

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

		return response.data.result.availableToBetBalance;
	} catch(err) {
		log(error(err));
	}
}

async function getEventTypeIds() {
	let response;
	let eventTypes;

    try {
		response = await bettingApi.listEventTypes({
			filter: {
				eventTypeIds: [
					EventTypeIds.SOCCER
				]
			}
		});
		eventTypes = response.data.result;

		return eventTypes.map(eT => eT.eventType.id);
	} catch(err) {
		log(error(err));
	}
}

async function getEventIds(eventTypeIds) {
	let response;
	let events;

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
		events = response.data.result;

		return events.map(e => e.event.id);
	} catch(err) {
		log(error(err));
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
				"RUNNER_DESCRIPTION"
			],
			maxResults: 100
		});

		return response.data.result;
	} catch(err) {
		log(error(err));
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

		return response.data.result;
	} catch(err) {
		log(error(err));
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
		return response.data.result;
	} catch(err) {
		log(error(err));
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
		});

		return response.data.result;
	} catch(err) {
		log(error(err));
	}
}

function getIndividualRunners(markets) {
	return flattenDeep(markets.map(market => {
		return market.runners.map(runner => {
			return {
				marketId: market.marketId,
				marketName: market.marketName,
				runner
			}
		})
	}));
}

function getAveragePrices(runners) {
	let aAvgPrice;
	let bAvgPrice;

	return runners.reduce((acc, market) => {
		return acc.concat(`${market.marketId}|${market.runner.selectionId}|${market.runner.avgPrice}`);
	}, []).sort((a, b) => {
		aAvgPrice = a.split("|")[2];		
		bAvgPrice = b.split("|")[2];

		return Number(aAvgPrice) - Number(bAvgPrice);
	});
}

function getSumOfAveragePrices(prices) {
	let avgPrice;

	return prices.reduce((acc, price) => {
		avgPrice = price.split("|")[2];

		return acc + Number(avgPrice);
	}, 0);
}

function allocateFundsPerRunner(markets, funds) {
	const individualRunners = getIndividualRunners(markets);
	const averagePrices = getAveragePrices(individualRunners);
	const sum = getSumOfAveragePrices(averagePrices);

	let percentage;
	let priceToBet;
	let pricesToBet = [];
	let amountsToBet;
	let runners = [];
	let arr;

	for (let i = 0; i < averagePrices.length; i++) {
		percentage = Math.round((Number(averagePrices[i].split("|")[2]) / sum) * 100);
		priceToBet = (funds * (percentage / 100)).toFixed(2);

		pricesToBet.push(priceToBet);
	}
	amountsToBet = pricesToBet.reverse();

	for (let i = 0; i < averagePrices.length; i++) {
		arr = averagePrices[i].split("|");

		runners.push({
			marketId: String(arr[0]),
			selectionId: String(arr[1]),
			avgPrice: Number(arr[2]),
			toBet: Number(amountsToBet[i])
		});
	}
	return runners;
}

function getSideAndAvgPriceForMarkets(markets) {
	let sideAndAvgPrice;

	return markets.map(market => {
		return {
			marketId: String(market.marketId),
			marketName: market.marketName,
			runners: market.runners.map(runner => {
				sideAndAvgPrice = calculateSideAndAvgPrice(runner);

				return {
					runnerName: runner.runnerName,
					selectionId: String(runner.selectionId),
					side: sideAndAvgPrice.side,
					avgPrice: sideAndAvgPrice.averagePrice
				}
			})
		}
	});
}

function calculateSideAndAvgPrice(runner) {
	const backPrices = runner.ex.availableToBack.map(back => back.price);
	const layPrices = runner.ex.availableToLay.map(lay => lay.price);
	const averageBack = (Math.max(...backPrices) + Math.min(...backPrices)) / 2;
	const averageLay = (Math.max(...layPrices) + Math.min(...layPrices)) / 2;

	return {
		side: (averageBack < averageLay) ? "BACK" : "LAY",
		averagePrice: (averageBack < averageLay) ? averageBack : averageLay
	};
}

function getFundsToSpend(funds) {
	// 25%
	return (funds * 0.25);
}

function getMarketIdsFromCatalogues(catalogues) {
	return catalogues.filter(catalogue => catalogue.marketName === "Match Odds")
		.map(market => market.marketId);
}

function buildMarkets(catalogues, books) {
	const matchOddsCatalogue = catalogues.filter(catalogue => catalogue.marketName === "Match Odds");

	let marketBook;
	let marketBookRunner;

	return matchOddsCatalogue.map(catalogue => {
		marketBook = books.find(book => book.marketId === catalogue.marketId);

		return {
			eventId: catalogue.event.id,
			eventName: catalogue.event.name,
			marketId: catalogue.marketId,
			marketName: catalogue.marketName,
			marketStartTime: catalogue.marketStartTime,
			marketBettingType: catalogue.description.bettingType,
			marketSuspendTime: catalogue.description.suspendTime,
			marketSettleTime: (catalogue.description.settleTime || "N/A"),
			inPlay: marketBook.inplay,									// For scalping the market, want to get games that are inplay
			isOpen: (marketBook.status === "OPEN"),
			runners: catalogue.runners.map(runner => {
				marketBookRunner = marketBook.runners.find(mbRunner => mbRunner.selectionId === runner.selectionId);

				return {
					selectionId: runner.selectionId,
					runnerName: runner.runnerName,
					ex: marketBookRunner.ex
				}
			})
		}
	});
}

function calculateBestOdds(markets, priceLimit) {
	let backers;
	let layers;

	return markets.map(market => {
		return {
			...market,
			runners: market.runners.filter(runner => {
				backers = runner.ex.availableToBack.filter(back => back.price < priceLimit);
				layers = runner.ex.availableToLay.filter(lay => lay.price < priceLimit);
	
				if (backers.length || layers.length) {
					return {
						backers,
						layers
					};
				}
			})
		};
	})
		.filter(market => market.runners.length);
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

    api = new Api();
    api.initAxios();
    
    bettingApi = new BettingApi();
    accountApi = new AccountsApi();

    try {
        accountFundsToBet = await getAccountFunds();
        eventTypeIds = await getEventTypeIds();
        eventIds = await getEventIds(eventTypeIds);
		marketCatalogues = await getMarketCatalogues(eventIds);

		marketIds = getMarketIdsFromCatalogues(marketCatalogues);

        marketBooks = await getMarketBooks(marketIds);
		runners = await getRunnerBooks(marketBooks);
		
		matchOddsMarkets = buildMarkets(marketCatalogues, marketBooks);

		marketsWithBestOdds = calculateBestOdds(matchOddsMarkets, priceLimit);

		await placeBets(marketsWithBestOdds, accountFundsToBet);

		console.log(marketsWithBestOdds);
    } catch(err) {
        log(error(err));
    }
}