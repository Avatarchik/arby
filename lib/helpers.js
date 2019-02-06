import {
	flattenDeep,
	uniq,
	mapValues,
	groupBy,
	values
} from "lodash";

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

function getSumOfPrices(markets) {
	let backPrices;

	return markets.reduce((mAcc, mCurr) => {
		backPrices = getArrOfPricesFromRunner(mCurr.runnerToBack).back;

		return mAcc + Math.min(...backPrices);
	}, 0)
}

function getArrOfPricesFromRunner(runner) {
	return {
		back: runner.exchangePrices.availableToBack.map(back => back.price),
		lay: runner.exchangePrices.availableToLay.map(lay => lay.price)
	};
}

/**
 * @param {Array} markets - An array of markets 
 * @param {Number} funds - Number representing the funds available to spend
 * @returns {Array} Same markets with added property of 'priceToBet' based on a percentage value of how much the individual price is to the overall sum
 * 					In theory, this should allocates larger amounts of funds to runners with LOWER prices so have a HIGHER chance of being successful
 */
export function allocateFundsPerRunner(markets, funds) {
	const sumOfLowestPricesBackRunners = getSumOfPrices(markets);

	let percentage;
	let priceToBet;
	let pricesOfRunnerToBack;
	let lowestPriceOfRunnerToBack;

	markets.forEach(market => {
		pricesOfRunnerToBack = getArrOfPricesFromRunner(market.runnerToBack).back;
		lowestPriceOfRunnerToBack = Math.min(...pricesOfRunnerToBack);
		percentage = Math.round((lowestPriceOfRunnerToBack / sumOfLowestPricesBackRunners) * 100);
		priceToBet = (funds * (percentage / 100)).toFixed(2);

		market.runnerToBack.priceToBet = priceToBet;
		market.runnerToBack.lowestPrice = lowestPriceOfRunnerToBack;
	});

	return markets;
}

/**
 * @param {Array} markets - An array of markets
 * @param {Number} funds - Number representing the funds available to bet
 * @param {Number} minimumToBet - Number representing minimum allowed to bet on the exchange
 * @returns {Array} Returns markets with LOWEST prices to back. Number of markets returned depends on how many am allowed to bet based on the minimum stake the exchange requires
 * 					For example, there are 10 possible markets and I only have £10. This will return 5 markets as the minimum bet is £2
 */
function getMaximumMarketsToBet(markets, funds, minimumToBet) {
	const marketsRunnersToBack = markets.map(market => {
		return {
			marketId: market.marketId,
			selectionId: market.runnerToBack.selectionId,
			lowestPrice: Math.min(...getArrOfPricesFromRunner(market.runnerToBack).back)
		};
	}).sort((a, b) => a.lowestPrice - b.lowestPrice);
	const maximumNumberOfRunnersAllowed = (funds / minimumToBet);

	let marketsAllowed = [];

	for (let i = 0; i < (maximumNumberOfRunnersAllowed - 1); i++) {
		marketsAllowed.push(marketsRunnersToBack[i]);
	}

	return markets.filter(market => {
		return marketsAllowed.find(mainMarket => {
			return (mainMarket.marketId === market.marketId);
		});
	});
}

function removeDuplicateSchedules(schedule) {
	return uniq(schedule);
}

/**
 * @param {Array} markets - An array of markets
 * @returns {Object} Constructed object with event types holding an array of unique market start times 
 */
export function extractSchedules(markets) {
	let sortedSchedules = {};

	markets.forEach(market => {
		if (!sortedSchedules[market.eventType.name]) {
			sortedSchedules[market.eventType.name] = [];
		}

		sortedSchedules[market.eventType.name].push(market.marketStartTime);
	});
	return mapValues(sortedSchedules, removeDuplicateSchedules);
}

export function determineMarketsToPlaceOrder(markets, funds) {
	const maxMarkets = getMaximumMarketsToBet(markets, funds, 2);
	const spreadBetting = 0.5;
	const numberOfMarketsToGet = Math.ceil(maxMarkets.length * spreadBetting);

	return maxMarkets.splice(0, numberOfMarketsToGet);
}

/**
 * @param {Array} runners - An array of runners
 * @return {Object} Single runner which has the SMALLEST available price to back
 */
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

/**
 * @param {Array} markets - An array of markets
 * @returns {Array} Same markets with a 'runnerToBack' property calculated by the runner with the SMALLEST possible price to back
 */
export function findBackerForEachMarket(markets) {
	return markets.map(market => {
		return {
			...market,
			runnerToBack: getRunnerSmallestBackPrice(market.runners)
		}
	}).filter(market => market.runnerToBack);
}

/**
 * 
 * @param {Array} markets - An array of markets 
 * @param {Number} priceLimit - Threshold price limit that I have set in the config
 * @returns {Array} Markets whereby at least 1 runner has a price to back which is LOWER than the price threshold set
 * 					This will grab markets with runners that have the highest chance of coming in
 */
export function getMarketsWithBackRunnerBelowThreshold(markets, priceLimit) {
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

/**
 * 
 * @param {Array} catalogues - An array of MarketCatalogues
 * @param {Array} books - An array of MarketBooks
 * @returns {Array} A list of readable markets constructed by combining the MarketCatalogue with the corresponding MarketBook
 */
export function betfair_buildCompleteMarkets(catalogues, books) {
	let marketBook;
	let marketBookRunner;

	return catalogues.map(catalogue => {
		marketBook = books.find(book => book.marketId === catalogue.marketId);

		return {
			eventId: catalogue.event.id,
			eventName: catalogue.event.name,
			eventType: catalogue.eventType,
			marketId: catalogue.marketId,
			marketName: catalogue.marketName,
			marketStartTime: catalogue.marketStartTime,
			marketBettingType: catalogue.description.bettingType,
			marketSuspendTime: catalogue.description.suspendTime,
			marketSettleTime: (catalogue.description.settleTime || "N/A"),
			numberOfWinners: marketBook.numberOfWinners,
			inPlay: marketBook.inplay, // For scalping the market, want to get games that are inplay
			isOpen: (marketBook.status === "OPEN"),
			runners: catalogue.runners.map(runner => {
				// TODO: Filter these on ones that are 'ACTIVE'
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

function getMarketsOnlyTwoRunners(markets) {
	return markets.filter(market => {
		return (market.runners.length === 2);
	});
}

export function matchbook_buildFullEvents(events) {
	return events.map(event => {
		return {
			id: event.id,
			name: event.name,
			country: event["meta-tags"].find(tag => tag.type === "COUNTRY").name,
			markets: getMarketsOnlyTwoRunners(event.markets)
				.map(market => {
					return {
						id: market.id,
						name: market.name,
						runners: market.runners.map(runner => {
							return {
								id: runner.id,
								name: runner.name,
								prices: runner.prices.map(price => {
									return {
										odds: price.odds
									};
								})
							};
						})
					};
			})
		};
	});
};

export function betfair_buildFullEvents(marketCatalogues, marketBooks) {
	const groupByEventId = groupBy(marketCatalogues, (catalogue) => catalogue.event.id);

	let marketBook;

	return values(mapValues(groupByEventId, (markets) => {
		return {
			id: marketsOnlyTwoRunners[0].event.id,
			name: marketsOnlyTwoRunners[0].event.name,
			country: marketsOnlyTwoRunners[0].event.countryCode,
			markets: getMarketsOnlyTwoRunners(markets)
				.map(market => {
					marketBook = marketBooks.find((book) => book.marketId === market.marketId);

					return {
						id: market.marketId,
						name: market.marketName,
						runners: marketBook.runners.map(runner => {
							return {
								id: runner.selectionId,
								name: runner.runnerName,
								prices: runner.ex.availableToBack.map(ex => ex.price)
							};
						})
					};
			})
		};
	}));
};