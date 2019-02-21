import { flattenDeep, uniq, mapValues, groupBy, values, flatten } from "lodash";
import { getCode, overwrite } from "country-list";
import MarketTypes from "./enums/marketTypes";

console.log(flattenDeep([{ name: "Will" }]));
console.log(flatten([{ name: "Will" }]));

overwrite([
	{
		code: "GB",
		name: "Scotland"
	},
	{
		code: "GB",
		name: "Wales"
	},
	{
		code: "GB",
		name: "England"
	},
	{
		code: "US",
		name: "United States of America"
	},
	{
		code: "-",
		name: "World"
	},
	{
		code: "-",
		name: "Europe"
	}
]);

function checkIfAbleToLay(funds, layPrice) {
	return getLiability(1, layPrice) < funds;
}

function getLiability(amountStaked, odds) {
	return amountStaked * (odds - 1);
}

function getIndividualRunners(markets) {
	return flattenDeep(
		markets.map(market => {
			return market.runners.map(runner => {
				return {
					marketId: market.marketId,
					marketName: market.marketName,
					runner
				};
			});
		})
	);
}

function getSumOfPrices(markets) {
	let backPrices;

	return markets.reduce((mAcc, mCurr) => {
		backPrices = getArrOfPricesFromRunner(mCurr.runnerToBack).back;

		return mAcc + Math.min(...backPrices);
	}, 0);
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
	const marketsRunnersToBack = markets
		.map(market => {
			return {
				marketId: market.marketId,
				selectionId: market.runnerToBack.selectionId,
				lowestPrice: Math.min(...getArrOfPricesFromRunner(market.runnerToBack).back)
			};
		})
		.sort((a, b) => a.lowestPrice - b.lowestPrice);
	const maximumNumberOfRunnersAllowed = funds / minimumToBet;

	let marketsAllowed = [];

	for (let i = 0; i < maximumNumberOfRunnersAllowed - 1; i++) {
		marketsAllowed.push(marketsRunnersToBack[i]);
	}

	return markets.filter(market => {
		return marketsAllowed.find(mainMarket => {
			return mainMarket.marketId === market.marketId;
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
	return markets
		.map(market => {
			return {
				...market,
				runnerToBack: getRunnerSmallestBackPrice(market.runners)
			};
		})
		.filter(market => market.runnerToBack);
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
							return back.price < priceLimit;
						})
					}
				};
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
			marketSettleTime: catalogue.description.settleTime || "N/A",
			numberOfWinners: marketBook.numberOfWinners,
			inPlay: marketBook.inplay, // For scalping the market, want to get games that are inplay
			isOpen: marketBook.status === "OPEN",
			runners: catalogue.runners.map(runner => {
				// TODO: Filter these on ones that are 'ACTIVE'
				marketBookRunner = marketBook.runners.find(mbRunner => mbRunner.selectionId === runner.selectionId);

				return {
					selectionId: runner.selectionId,
					runnerName: runner.runnerName,
					exchangePrices: marketBookRunner.ex
				};
			})
		};
	});
}

function isUnderOverMarket(runnerName) {
	const containsNumberRegexp = /\d/g;

	return runnerName.indexOf("OVER") || (runnerName.indexOf("UNDER") && containsNumberRegexp.test(runnerName));
}

function getFormattedMarket(market, runners, mainMarketName) {
	// The reason 'eventType' & 'description' are how they are is because I need to structure of the market to be the same as
	// markets that have not been altered as I want to access these properties the same way
	return {
		marketId: market.marketId,
		marketName:
			market.marketName === mainMarketName
				? `${runners[0].runnerName}/${runners[1].runnerName} ${runners[0].handicap}`
				: `${runners[0].runnerName} ${runners[0].handicap}/${runners[1].runnerName} ${runners[1].handicap}`,
		eventType: {
			name: market.eventType.name
		},
		description: {
			bettingType: market.description.bettingType,
			marketType: market.description.marketType
		},
		runners: runners.map(runner => {
			return {
				selectionId: runner.selectionId,
				runnerName: runner.runnerName,
				handicap: runner.handicap > 0 ? `+${runner.handicap}` : runner.handicap
			};
		})
	};
}

function formatBetfairAsianHandicapMarkets_soccer(market, aRunner) {
	// There are only 2 markets in football that are of market type Asian Handicap Double Line
	// - Goal Lines
	// - Asian Handicap
	let bRunner;

	if (market.marketName === "Goal Lines") {
		bRunner = market.runners.find(runner => {
			return runner.handicap === aRunner.handicap && runner.selectionId !== aRunner.selectionId;
		});
	} else if (market.marketName === "Asian Handicap") {
		bRunner = market.runners.find(runner => runner.handicap === -aRunner.handicap);
	}

	if (bRunner) {
		// Removed from the array so there are no duplicate entries of markets
		market.runners.splice(market.runners.indexOf(bRunner), 1);

		return getFormattedMarket(market, [aRunner, bRunner], "Goal Lines");
	} else {
		// TODO: Should never get here but do need to have exception handling here
	}
}

function formatBetfairAsianHandicapMarkets_basketball(market, aRunner) {
	// There are only 2 markets in football that are of market type Asian Handicap Double Line
	// - Total Points
	// - Handicap
	let bRunner;

	if (market.marketName === "Total Points") {
		bRunner = market.runners.find(runner => {
			return runner.handicap === aRunner.handicap && runner.selectionId !== aRunner.selectionId;
		});
	} else if (market.marketName === "Handicap") {
		bRunner = market.runners.find(runner => runner.handicap === -aRunner.handicap);
	}

	if (bRunner) {
		// Removed from the array so there are no duplicate entries of markets
		market.runners.splice(market.runners.indexOf(bRunner), 1);

		return getFormattedMarket(market, [aRunner, bRunner], "Total Points");
	} else {
		// TODO: Should never get here but do need to have exception handling here
	}
}

function formatBetfairAsianHandicapMarkets_tennis(market, aRunner) {
	// There are only 2 markets in football that are of market type Asian Handicap Double Line
	// - Total Games
	// - Handicap
	let bRunner;

	if (market.marketName === "Total Games") {
		bRunner = market.runners.find(runner => {
			return runner.handicap === aRunner.handicap && runner.selectionId !== aRunner.selectionId;
		});
	} else if (market.marketName === "Handicap") {
		bRunner = market.runners.find(runner => runner.handicap === -aRunner.handicap);
	}

	if (bRunner) {
		// Removed from the array so there are no duplicate entries of markets
		market.runners.splice(market.runners.indexOf(bRunner), 1);

		return getFormattedMarket(market, [aRunner, bRunner], "Total Games");
	} else {
		// TODO: Should never get here but do need to have exception handling here
	}
}

function formatBetfairAsianHandicapMarkets(market) {
	return market.runners
		.map(runner => {
			switch (market.eventType.name) {
				case "Soccer":
					return formatBetfairAsianHandicapMarkets_soccer(market, runner);
				case "Tennis":
					return formatBetfairAsianHandicapMarkets_tennis(market, runner);
				case "Basketball":
					return formatBetfairAsianHandicapMarkets_basketball(market, runner);
				default:
					return "Oh no!";
			}
		})
		.filter(market => market);
}

function getMarketsOnlyTwoRunners(markets, exchange) {
	return markets.filter(market => {
		// Betfair gives back all (asian) handicap markets under 1 market and the handicaps as runners so we do not want to filter these out
		// Instead, we want to filter the Asian Handicaps into separate markets
		switch (exchange) {
			case "betfair":
				return market.description.bettingType.includes("ASIAN") || market.runners.length === 2;
			case "matchbook":
				return market["market-type"] || market.runners.length === 2;
		}
	});
}

function formatMarkets(markets, exchange) {
	const marketsOnlyTwoRunners = getMarketsOnlyTwoRunners(markets, exchange);

	return flatten(
		marketsOnlyTwoRunners.map(market => {
			switch (exchange) {
				case "betfair":
					if (market.description.bettingType === "ASIAN_HANDICAP_DOUBLE_LINE") {
						return formatBetfairAsianHandicapMarkets(market);
					} else {
						return [market];
					}
				case "matchbook":
					switch (market["market-type"]) {
						case "total":
							if (isUnderOverMarket(market.runners[0].name)) {
								return {
									...market,
									name: `Over/Under ${market.runners[0].name.replace(/^\D+/g, "")}`
								};
							} else {
								console.log("debug");
							}
							break;
						case "handicap":
							return {
								...market,
								name: market.runners.map(runner => runner.name).join("/")
							};
						default:
							return market;
					}
			}
		})
	);
}

function getMarketType(market, exchange) {
	let actual;

	switch (exchange) {
		case "matchbook":
			if (market.name === "Match Odds") {
				return "MATCH_ODDS";
			}
			if (market["market-type"] === "money_line") {
				return "MONEYLINE";
			}
			return market["market-type"].toUpperCase();
		case "betfair":
			actual = MarketTypes.find(type => market.description.marketType === type.actualType);

			if (actual) {
				return actual.actualType;
			}

			actual = MarketTypes.find(type => {
				if (market.description.marketType === "MATCH_ODDS") {
					return market.eventType.name === "Soccer" || market.eventType.name === "Rugby Union" || market.eventType.name === "Rugby League"
						? "ONE_X_TWO"
						: "ONE_TWO";
				}
				return type.potentialTypes.indexOf(market.description.marketType) > -1;
			});

			if (actual) {
				return actual.actualType;
			}
			return market.description.marketType || "-";
		default:
			return "Oh no!";
	}
}

// function getCompetitors(eventType, markets, exchange) {
// 	let marketToUse;
// 	let competitors;

// 	if (exchange === "betfair") {
// 		marketToUse = markets.find(market => market.marketName === "Match Odds");

// 		competitors = marketToUse
// 			? marketToUse.runners
// 				.filter(runner => {
// 					return runner.runnerName.toUpperCase().indexOf("DRAW") <= -1;
// 				})
// 				.map(runner => runner.runnerName)
// 			: [];
// 	} else {
// 		switch (eventType) {
// 			case "Soccer":
// 				marketToUse = markets.find(market => market.name === "Match Odds");
// 				break;
// 			case "Tennis":
// 			case "Basketball":
// 				marketToUse = markets.find(market => market.name === "Moneyline");
// 				break;
// 			default:
// 				console.log("Dunno...");
// 		}

// 		competitors = marketToUse
// 			? marketToUse.runners
// 				.filter(runner => {
// 					return runner.name.toUpperCase().indexOf("DRAW") <= -1;
// 				})
// 				.map(runner => runner.name)
// 			: [];
// 	}
// 	return competitors;
// }

export function matchbook_buildFullEvents(events) {
	return events
		.map(event => {
			const metaTags = event["meta-tags"];
			const countryTag = metaTags.find(tag => tag.type === "COUNTRY");
			const eventTypeTag = metaTags.find(tag => tag.type === "SPORT");

			if (countryTag && getCode(countryTag.name) === undefined) {
				console.log(countryTag.name);
			}
			if (!countryTag) {
				console.log(event);
			}

			return {
				id: event.id || "-",
				name: event.name || "-",
				// competitors: getCompetitors(eventTypeTag.name, event.markets, "matchbook"),
				eventType: eventTypeTag ? eventTypeTag.name : "-",
				country: countryTag ? getCode(countryTag.name) : "-",
				markets: formatMarkets(event.markets, "matchbook").map(market => {
					return {
						id: market.id || "-",
						name: market.name || "-",
						type: getMarketType(market, "matchbook"),
						runners: market.runners.map(runner => {
							return {
								id: runner.id || "-",
								name: runner.name || "-",
								prices: runner.prices.map(price => price.odds)
							};
						})
					};
				})
			};
		})
		.filter(event => event.markets.length);
}

export function betfair_buildFullEvents(marketCatalogues, marketBooks) {
	const groupByEventId = groupBy(marketCatalogues, catalogue => catalogue.event.id);

	let marketBook;
	let marketBookRunner;

	return values(
		mapValues(groupByEventId, markets => {
			return {
				id: markets[0].event.id || "-",
				name: markets[0].event.name || "-",
				eventType: markets[0].eventType.name || "-",
				// competitors: getCompetitors(markets[0].eventType.name, markets, "betfair"),
				country: markets[0].event.countryCode || "-",
				markets: formatMarkets(markets, "betfair").map(market => {
					marketBook = marketBooks.find(book => book.marketId === market.marketId);

					return {
						id: market.marketId || "-",
						name: market.marketName || "-",
						type: getMarketType(market, "betfair"),
						runners: market.runners.map(runner => {
							marketBookRunner = marketBook.runners.find(mRunner => {
								return String(mRunner.selectionId) === String(runner.selectionId) && runner.handicap === mRunner.handicap;
							});

							return {
								id: runner.selectionId || "-",
								name: runner.runnerName,
								handicap: runner.handicap,
								prices: marketBookRunner ? marketBookRunner.ex.availableToBack.map(ex => ex.price) : []
							};
						})
					};
				})
			};
		})
	).filter(event => event.markets.length);
}
