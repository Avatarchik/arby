import { flattenDeep } from "lodash";
import moment from "moment";

import { EventTypeIds } from "../betfair/apis/betting/config";

function calculateSideAndAvgPrice(runner) {
	const backPrices = runner.exchangePrices.availableToBack.map(back => back.price);
	const layPrices = runner.exchangePrices.availableToLay.map(lay => lay.price);
	const averageBack = (Math.max(...backPrices) + Math.min(...backPrices)) / 2;
	const averageLay = (Math.max(...layPrices) + Math.min(...layPrices)) / 2;

	return {
		side: (averageBack < averageLay) ? "BACK" : "LAY",
		averagePrice: (averageBack < averageLay) ? averageBack : averageLay
	};
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

export function allocateFundsPerRunner(markets, funds) {
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

export function getSideAndAvgPriceForMarkets(markets) {
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

export function getFundsToSpend(overallFunds) {
    return (overallFunds * 0.25);
}

export function calculateBestOdds(markets, priceLimit) {
	let backers;
	let layers;
	// In match odds, there are 3 runners, you can ONLY back 1 but you are able to lay 2...
	let backed;
	let laid = [];

	return markets.map(market => {
		return {
			...market,
			runners: market.runners.filter(runner => {
				backers = (!backed) ? runner.exchangePrices.availableToBack.filter(back => back.price < priceLimit) : [];
				layers = runner.exchangePrices.availableToLay.filter(lay => lay.price < priceLimit);
	
				if (backers.length || layers.length) {
					if (backers.length) {
						backed = runner.runnerName;
					}
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

export function buildMarkets(catalogues, books) {
	let marketBook;
	let marketBookRunner;

	return catalogues.map(catalogue => {
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
					exchangePrices: marketBookRunner.ex
				}
			})
		}
	});
}

export function getMarketIdsFromCatalogues(catalogues) {
	return catalogues.map(market => market.marketId);
}

export function getFullMarketFilter(events) {
	let baseMarketFilter = {
		eventTypeIds: [
			EventTypeIds.SOCCER
		],
		eventIds: events.map(event => {
			return event.event.id;
		}),
		marketStateTime: {
			from: moment().startOf("day").format(),
			to: moment().endOf("day").format()
		},
		marketBettingTypes: [
			"ODDS"
		]
	};
	console.log("::: getFullMarketFilter :::");
	console.log("::: events: ", events);
	return {
		eventTypeIds: [
			EventTypeIds.SOCCER
		],
		eventIds: events.map(event => {
			return event.event.id;
		}),
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
		],
		marketTypeCodes: [
			"MATCH_ODDS"
		]
	}
}
