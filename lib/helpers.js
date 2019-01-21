import { flattenDeep } from "lodash";
import moment from "moment";

import { EventTypeIds } from "../src/betfair/apis/betting/config";

function checkIfAbleToLay(funds, layPrice) {
	return (getLiability(1, layPrice) < funds);
}

function getLiability(amountStaked, odds) {
	return (amountStaked * (odds - 1));
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

// export function allocateFundsPerRunner(markets, funds) {
// 	const individualRunners = getIndividualRunners(markets);
// 	const averagePrices = getAveragePrices(individualRunners);
// 	const sum = getSumOfAveragePrices(averagePrices);

// 	let percentage;
// 	let priceToBet;
// 	let pricesToBet = [];
// 	let amountsToBet;
// 	let runners = [];
// 	let arr;

// 	for (let i = 0; i < averagePrices.length; i++) {
// 		percentage = Math.round((Number(averagePrices[i].split("|")[2]) / sum) * 100);
// 		priceToBet = (funds * (percentage / 100)).toFixed(2);

// 		pricesToBet.push(priceToBet);
// 	}
// 	amountsToBet = pricesToBet.reverse();

// 	for (let i = 0; i < averagePrices.length; i++) {
// 		arr = averagePrices[i].split("|");

// 		runners.push({
// 			marketId: String(arr[0]),
// 			selectionId: String(arr[1]),
// 			avgPrice: Number(arr[2]),
// 			toBet: Number(amountsToBet[i])
// 		});
// 	}
// 	return runners;
// }

// export function findRunnersToLay(runners, backer) {
// 	let runnersAvailableToLay = runners;
// 	let layers;
// 	let layPrices;

// 	if (backer) {
// 		runnersAvailableToLay = runners.filter(runner => (String(runner.selectionId) !== String(backer.selectionId)));
// 	}

// 	layPrices = runnersAvailableToLay.map(runner => {
// 		return {
// 			selectionId: runner.selectionId,
// 			prices: runner.exchangePrices.availableToLay.map(lay => lay.price)
// 		}
// 	});
// }

export function getFundsToSpend(overallFunds) {
    return (overallFunds * 0.25);
}

function getRunnerSmallestBackPrice(runners) {
	// TODO: Set this to the price limit threshold I set
	let smallestPrice = 2;
	let smallestPriceOfCurrentRunner;
	let backPricesOfCurrentRunner;
	let runnerToBack;

	runners.forEach(runner => {
		backPricesOfCurrentRunner = runner.exchangePrices.availableToBack.map(back => back.price);
		smallestPriceOfCurrentRunner = Math.min(...backPricesOfCurrentRunner);

		if (smallestPriceOfCurrentRunner < smallestPrice) {
			smallestPrice = smallestPriceOfCurrentRunner;
			runnerToBack = runner;
		}
	});

	return runnerToBack;
}

export function findBackerForEachMarket(markets) {
	return markets.map(market => {
		return {
			...market,
			runnerToBack: getRunnerSmallestBackPrice(market.runners)
		}
	});
}

export function getMarketsWithBackRunnerBelowThreshold(markets, priceLimit) {
	// Get markets where the 1 of the prices to back for 1 of the runners is LOWER than the price I have set.
	// This works out that backing this runner has the greatest chance of coming in
	//
	// In every market, regardless of the amount of runners, you can ONLY back 1 of them!

	return markets.map(market => {
		return {
			...market,
			runners: market.runners.map(runner => {
				return {
					...runner,
					exchangePrices: {
						...runner.exchangePrices,
						availableToBack: runner.exchangePrices.availableToBack.filter(back => {
							return (back.price < priceLimit);
						})
					}
				}
			})
		};
	});
}

export function buildCompleteMarkets(catalogues, books) {
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
			numberOfWinners: marketBook.numberOfWinners,
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
