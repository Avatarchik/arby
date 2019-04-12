import { flattenDeep, uniq, mapValues, groupBy, values, flatten } from "lodash"
import { getCode, overwrite } from "country-list"
import MarketTypes from "../lib/enums/marketTypes"
import { parse } from "querystring"

// Some bookies (Matchbook especially) give country codes that this library does not map correctly
// So these are overrides for those names
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
	},
	{
		code: "-",
		name: "U.A.E."
	},
	{
		code: "RU",
		name: "Russia"
	},
	{
		code: "-",
		name: "Asia"
	}
])

function checkIfAbleToLay(funds, layPrice) {
	return getLiability(1, layPrice) < funds
}

/**
 * The following 2 functions were calulated by: https://help.smarkets.com/hc/en-gb/articles/115001199231-Back-to-Lay-betting-strategy-
 */
function getProfitForBack(odds, stake) {
	return (odds.back - 1) * stake.back - (odds.lay - 1) * stake.lay
}

function getProfitForLay(stake, commission) {
	return stake.lay * (1 - commission) - stake.back
}

function getStakeForLay(backPrice, backStake, layOdds, commission) {
	return (backPrice * backStake) / (layOdds - commission)
}

function getLiability(stake, odds) {
	return stake * (odds - 1)
}

function getIndividualRunners(markets) {
	return flattenDeep(
		markets.map(market => {
			return market.runners.map(runner => {
				return {
					marketId: market.marketId,
					marketName: market.marketName,
					runner
				}
			})
		})
	)
}

function getSumOfPrices(markets) {
	let backPrices

	return markets.reduce((mAcc, mCurr) => {
		backPrices = getArrOfPricesFromRunner(mCurr.runnerToBack).back

		return mAcc + Math.min(...backPrices)
	}, 0)
}

// function getArrOfPricesFromRunner(runner) {
// 	return {
// 		back: runner.exchangePrices.availableToBack.map(back => back.price),
// 		lay: runner.exchangePrices.availableToLay.map(lay => lay.price)
// 	};
// }

/**
 * @param {Array} markets - An array of markets
 * @param {Number} funds - Number representing the funds available to spend
 * @returns {Array} Same markets with added property of 'priceToBet' based on a percentage value of how much the individual price is to the overall sum
 * 					In theory, this should allocates larger amounts of funds to runners with LOWER prices so have a HIGHER chance of being successful
 */
export function allocateFundsPerRunner(markets, funds) {
	const sumOfLowestPricesBackRunners = getSumOfPrices(markets)

	let percentage
	let priceToBet
	let pricesOfRunnerToBack
	let lowestPriceOfRunnerToBack

	markets.forEach(market => {
		pricesOfRunnerToBack = getArrOfPricesFromRunner(market.runnerToBack).back
		lowestPriceOfRunnerToBack = Math.min(...pricesOfRunnerToBack)
		percentage = Math.round((lowestPriceOfRunnerToBack / sumOfLowestPricesBackRunners) * 100)
		priceToBet = (funds * (percentage / 100)).toFixed(2)

		market.runnerToBack.priceToBet = priceToBet
		market.runnerToBack.lowestPrice = lowestPriceOfRunnerToBack
	})

	return markets
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
			}
		})
		.sort((a, b) => a.lowestPrice - b.lowestPrice)
	const maximumNumberOfRunnersAllowed = funds / minimumToBet

	let marketsAllowed = []

	for (let i = 0; i < maximumNumberOfRunnersAllowed - 1; i++) {
		marketsAllowed.push(marketsRunnersToBack[i])
	}

	return markets.filter(market => {
		return marketsAllowed.find(mainMarket => {
			return mainMarket.marketId === market.marketId
		})
	})
}

function removeDuplicateSchedules(schedule) {
	return uniq(schedule)
}

/**
 * @param {Array} markets - An array of markets
 * @returns {Object} Constructed object with event types holding an array of unique market start times
 */
export function extractSchedules(markets) {
	let sortedSchedules = {}

	markets.forEach(market => {
		if (!sortedSchedules[market.eventType.name]) {
			sortedSchedules[market.eventType.name] = []
		}

		sortedSchedules[market.eventType.name].push(market.marketStartTime)
	})
	return mapValues(sortedSchedules, removeDuplicateSchedules)
}

export function determineMarketsToPlaceOrder(markets, funds) {
	const maxMarkets = getMaximumMarketsToBet(markets, funds, 2)
	const spreadBetting = 0.5
	const numberOfMarketsToGet = Math.ceil(maxMarkets.length * spreadBetting)

	return maxMarkets.splice(0, numberOfMarketsToGet)
}

/**
 * @param {Array} runners - An array of runners
 * @return {Object} Single runner which has the SMALLEST available price to back
 */
// function getRunnerSmallestBackPrice(runners) {
// 	// TODO: Set this to the price limit threshold I set
// 	let smallestPrice = 2;
// 	let smallestPriceOfCurrentRunner;
// 	let backPricesOfCurrentRunner;
// 	let runnerToBack;

// 	runners.forEach(runner => {
// 		backPricesOfCurrentRunner = runner.exchangePrices.availableToBack.map(back => back.price);
// 		smallestPriceOfCurrentRunner = Math.min(...backPricesOfCurrentRunner);

// 		if (smallestPriceOfCurrentRunner < smallestPrice) {
// 			smallestPrice = smallestPriceOfCurrentRunner;
// 			runnerToBack = runner;
// 		}
// 	});

// 	return runnerToBack;
// }

/**
 * @param {Array} markets - An array of markets
 * @returns {Array} Same markets with a 'runnerToBack' property calculated by the runner with the SMALLEST possible price to back
 */
// export function findBackerForEachMarket(markets) {
// 	return markets
// 		.map(market => {
// 			return {
// 				...market,
// 				runnerToBack: getRunnerSmallestBackPrice(market.runners)
// 			};
// 		})
// 		.filter(market => market.runnerToBack);
// }

/**
 *
 * @param {Array} markets - An array of markets
 * @param {Number} priceLimit - Threshold price limit that I have set in the config
 * @returns {Array} Markets whereby at least 1 runner has a price to back which is LOWER than the price threshold set
 * 					This will grab markets with runners that have the highest chance of coming in
 */
// export function getMarketsWithBackRunnerBelowThreshold(markets, priceLimit) {
// 	return markets.map(market => {
// 		return {
// 			...market,
// 			runners: market.runners.map(runner => {
// 				return {
// 					...runner,
// 					exchangePrices: {
// 						...runner.exchangePrices,
// 						availableToBack: runner.exchangePrices.availableToBack.filter(back => {
// 							return back.price < priceLimit;
// 						})
// 					}
// 				};
// 			})
// 		};
// 	});
// }

/**
 *
 * @param {Array} catalogues - An array of MarketCatalogues
 * @param {Array} books - An array of MarketBooks
 * @returns {Array} A list of readable markets constructed by combining the MarketCatalogue with the corresponding MarketBook
 */
export function betfair_buildCompleteMarkets(catalogues, books) {
	let marketBook
	let marketBookRunner

	return catalogues.map(catalogue => {
		marketBook = books.find(book => book.marketId === catalogue.marketId)

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
				marketBookRunner = marketBook.runners.find(mbRunner => mbRunner.selectionId === runner.selectionId)

				return {
					selectionId: runner.selectionId,
					runnerName: runner.runnerName,
					exchangePrices: marketBookRunner.ex
				}
			})
		}
	})
}

function getFormattedHandicapMarket(market, runners, mainMarketName) {
	// The reason 'eventType' & 'description' are how they are is because I need to structure of the market to be the same as
	// markets that have not been altered as I want to access these properties the same way
	function getHandicapMarketName() {
		const r0Handicap = parseFloat(runners[0].handicap)
		const r1Handicap = parseFloat(runners[1].handicap)
		const handicapMod = parseFloat(runners[0].handicap) % 1
		const posR0 = r0Handicap > 0
		const posR1 = r1Handicap > 0
		const r0name = runners[0].runnerName
		const r1name = runners[1].runnerName
		const r0Lower = r0Handicap - 0.25
		const r0Upper = r0Handicap + 0.25
		const r1Lower = r1Handicap - 0.25
		const r1Upper = r1Handicap + 0.25

		let r0HandicapName = ""
		let r1HandicapName = ""

		// Quarter line
		// For my benefit, want to format this name so that it is understandable that the stake will be split
		if (handicapMod === 0.25 || handicapMod === -0.25 || handicapMod === 0.75 || handicapMod === -0.75) {
			if (market.description.marketType.indexOf("OVER_UNDER") > -1) {
				if (market.marketName.toUpperCase().indexOf("CORNERS") > -1) {
					return `Over/Under (${r0Lower.toFixed(1)}/${r0Upper.toFixed(1)}) - Corners`
				}
				if (market.marketName.toUpperCase().indexOf("CARDS") > -1) {
					return `Over/Under (${r0Lower.toFixed(1)}/${r0Upper.toFixed(1)}) - Cards`
				}
				if (market.marketName.toUpperCase().indexOf("GOALS") > -1) {
					return `Over/Under (${r0Lower.toFixed(1)}/${r0Upper.toFixed(1)}) - Goals`
				}
				console.log("don't know what this is...")
			}
			if (market.description.marketType === "ALT_TOTAL_GOALS") {
				return `Over/Under (${r0Lower.toFixed(1)}/${r0Upper.toFixed(1)}) - Goals`
			}

			r0HandicapName = posR0
				? `(+${r0Lower.toFixed(1)}/${r0Upper.toFixed(1)})`
				: `(-${!r0Handicap || !r0Upper ? r0Upper.toFixed(1) : r0Upper.toFixed(1).substr(1)}/${r0Lower.toFixed(1).substr(1)})`
			r1HandicapName = posR1
				? `(+${r1Lower.toFixed(1)}/${r1Upper.toFixed(1)})`
				: `(-${!r1Handicap || !r1Upper ? r1Upper.toFixed(1) : r1Upper.toFixed(1).substr(1)}/${r1Lower.toFixed(1).substr(1)})`

			if (r0name === "Under" && r1name === "Over") {
				console.log("debug")
			}

			return `${r0name} ${r0HandicapName}/${r1name} ${r1HandicapName}`
		}
		if (market.marketName !== mainMarketName) {
			// For any sport, the mainMarketName is NOT the handicap market that Betfair gives us
			// Therefore, this condition is truthy for handicap markets
			if (r0name === "Under" && r1name === "Over") {
				console.log("debug")
			}

			return `${r0name} ${posR0 ? "+" : ""}${r0Handicap.toFixed(1)}/${r1name} ${posR1 ? "+" : ""}${r1Handicap.toFixed(1)}`
		}
		return `${r0name}/${r1name} ${r0Handicap.toFixed(1)}`
	}

	return {
		marketId: market.marketId,
		marketName: getHandicapMarketName(),
		eventType: {
			name: market.eventType.name
		},
		description: {
			bettingType: market.description.bettingType,
			marketType: market.description.marketType
		},
		runners: runners.map(runner => runner)
	}
}

function formatBetfairAsianHandicapMarkets_soccer(market, aRunner) {
	// There are only 2 markets in football that are of market type Asian Handicap Double Line
	// - Goal Lines		- ALT_TOTAL_GOALS
	// - Asian Handicap	- ASIAN_HANDICAP
	let bRunner

	bRunner = market.runners.find(runner => {
		return market.description.marketType === "ALT_TOTAL_GOALS"
			? runner.handicap === aRunner.handicap && runner.selectionId !== aRunner.selectionId
			: runner.handicap === -aRunner.handicap && runner.selectionId !== aRunner.selectionId
	})

	if (bRunner) {
		// Removed from the array so there are no duplicate entries of markets
		market.runners.splice(market.runners.indexOf(bRunner), 1)

		return getFormattedHandicapMarket(market, [aRunner, bRunner], "Goal Lines")
	} else {
		console.log("elsing")
		// TODO: Should never get here but do need to have exception handling here
	}
}

function formatBetfairAsianHandicapMarkets_basketball(market, aRunner) {
	// There are only 2 markets in football that are of market type Asian Handicap Double Line
	// - Total Points
	// - Handicap
	let bRunner

	if (market.marketName === "Total Points") {
		bRunner = market.runners.find(runner => {
			return runner.handicap === aRunner.handicap && runner.selectionId !== aRunner.selectionId
		})
	} else if (market.marketName === "Handicap") {
		bRunner = market.runners.find(runner => runner.handicap === -aRunner.handicap)
	}

	if (bRunner) {
		// Removed from the array so there are no duplicate entries of markets
		market.runners.splice(market.runners.indexOf(bRunner), 1)

		return getFormattedHandicapMarket(market, [aRunner, bRunner], "Total Points")
	} else {
		// TODO: Should never get here but do need to have exception handling here
	}
}

function formatBetfairAsianHandicapMarkets_tennis(market, aRunner) {
	// There are only 2 markets in football that are of market type Asian Handicap Double Line
	// - Total Games
	// - Handicap
	let bRunner

	if (market.marketName === "Total Games") {
		bRunner = market.runners.find(runner => {
			return runner.handicap === aRunner.handicap && runner.selectionId !== aRunner.selectionId
		})
	} else if (market.marketName === "Handicap") {
		bRunner = market.runners.find(runner => runner.handicap === -aRunner.handicap)
	}

	if (bRunner) {
		// Removed from the array so there are no duplicate entries of markets
		market.runners.splice(market.runners.indexOf(bRunner), 1)

		return getFormattedHandicapMarket(market, [aRunner, bRunner], "Total Games")
	} else {
		console.log("why you here?!")
		// TODO: Should never get here but do need to have exception handling here
	}
}

// function sortSingleDoubleLineRunners(runners) {
// 	// TODO: Find the runners with same selectionId and combine them to be a double line
// 	const groupedSelections = groupBy(runners, 'selectionId')

// 	console.log(groupedSelections)

// 	Object.keys(groupedSelections).map((acc, group) => {
// 		if (group.handicap % 0.5 === 0) {

// 		}
// 	})
// }

function formatBetfairAsianHandicapMarkets(market) {
	return market.runners
		.map(runner => {
			switch (market.eventType.name) {
				case "Soccer":
					return formatBetfairAsianHandicapMarkets_soccer(market, runner)
				case "Tennis":
					return formatBetfairAsianHandicapMarkets_tennis(market, runner)
				case "Basketball":
					return formatBetfairAsianHandicapMarkets_basketball(market, runner)
				default:
					return "Oh no!"
			}
		})
		.filter(market => {
			if (market) {
				return market
			}
		})
}

function getMarketsOnlyTwoRunners(markets, exchange) {
	return markets.filter(market => {
		// Betfair gives back all (asian) handicap markets under 1 market and the handicaps as runners so we do not want to filter these out
		// Instead, we want to filter the Asian Handicaps into separate markets
		switch (exchange) {
			case "betfair":
				return market.description.bettingType.includes("ASIAN") || market.runners.length === 2
			case "matchbook":
				return market["market-type"] || market.runners.length === 2
		}
	})
}

function formatMarkets(markets, exchange) {
	return flatten(
		markets.map(market => {
			switch (exchange) {
				case "betfair":
					if (market.description.bettingType === "ASIAN_HANDICAP_DOUBLE_LINE") {
						return formatBetfairAsianHandicapMarkets(market)
					} else {
						return [market]
					}
				case "matchbook":
					switch (market["market-type"]) {
						case "total":
							if (isUnderOverMarket(market)) {
								// The line below is bloody dreadful...
								// If was a quarter line, the RegExp removed the leading '(' so put it back in...
								return {
									...market,
									name: `Over/Under ${isAsianQuarterLine(market.runners[0].name) ? "(" : ""}${market.runners[0].name.replace(
										/^\D+/g,
										""
									)}`
								}
							} else {
								console.log("debug")
							}
							break
						case "handicap":
							return {
								...market,
								name: market.runners.map(runner => runner.name).join("/")
							}
						default:
							return market
					}
			}
		})
	)
}

// - (+1)
// - -2.0
// - +3
function isAsianFullLine(name) {
	return new RegExp(/(\(?[+-]?\d\.?[0-0]{1}?\)?)/).test(name)
}

function getAsianFullLineHandicap(name) {
	const match = name.match(/(\(?[+-]?\d\.?[0-0]{1}?\)?)/)

	if (match && match.length) {
		return parseFloat(match[0])
	}
	return "Something is wrong..."
}

// (.5/.75)
// (1.5/2.0)
// (+.75/1.0)
export function isAsianQuarterLine(name) {
	return new RegExp(/\([+-]?\d?\.\d{1,2}\/[+-]?\d?\.\d{1,2}\)/).test(name)
}

function getAsianQuarterLineHandicap(name) {
	const match = name.match(/\([+-]?\d?\.\d{1,2}\/[+-]?\d?\.\d{1,2}\)/)

	let handicaps
	let parsedHandicaps

	if (match && match.length) {
		handicaps = match[0].substring(1, match[0].indexOf(")")).split("/")
		parsedHandicaps = handicaps.map(handicap => parseFloat(handicap))
		parsedHandicaps[1] = parsedHandicaps[0] < 0 ? -parsedHandicaps[1] : parsedHandicaps[1]

		return (parsedHandicaps[0] + parsedHandicaps[1]) / 2
	}
	return "Something went wrong..."
}

// (+1.5)
// .5
// -1.5
export function isAsianHalfLine(name, isRunner) {
	const match = name.match(/(\(?[+-]?\d?\.[5-5]\)?)/g)

	// An Asian Double Line market would match twice...
	// A runner will only have the handicap for 1 team whereas a
	// market name (which can also be passed), has the handicap
	// for both teams so have to increment the number of matches to suit
	if (isRunner) {
		return match ? match.length === 1 : false
	} else {
		return match ? match.length === 2 : false
	}
}

function getAsianHalfLineHandicap(name) {
	const match = name.match(/(\(?[+-]?\d?\.[5-5]\)?)/g)

	if (match && match.length) {
		return parseFloat(match[0])
	}
	return "Something is wrong..."
}

function isUnderOverMarket(market) {
	const runner0Name = market.runners[0].name || market.runners[0].runnerName
	const runner1Name = market.runners[1].name || market.runners[1].runnerName

	return (
		(runner0Name.toUpperCase().includes("OVER") || runner0Name.toUpperCase().includes("UNDER")) &&
		(runner1Name.toUpperCase().includes("OVER") || runner1Name.toUpperCase().includes("UNDER"))
	)
}

function getMarketType(market, exchange) {
	let actual
	let runnerToTest
	let handicapMod

	switch (exchange) {
		case "matchbook":
			runnerToTest = market.runners[0].name

			if (market.runners.length === 2) {
				if (isAsianQuarterLine(runnerToTest)) {
					return "QUARTER_LINE_ASIAN_HANDICAP"
				}

				if (isAsianFullLine(runnerToTest)) {
					return "FULL_LINE_ASIAN_HANDICAP"
				}

				if (isAsianHalfLine(runnerToTest, true)) {
					// Under/Over markets don't have half lines, they sub that for TOTAL_SCORE in my case
					// I guess this could change...
					return isUnderOverMarket(market) ? "TOTAL_SCORE" : "HALF_LINE_ASIAN_HANDICAP"
				}
			}
			actual = MarketTypes.find(type => market["market-type"].toUpperCase() === type.actualType)

			if (actual) {
				return actual.actualType
			}

			actual = MarketTypes.find(type => {
				return type.potentialTypes.indexOf(market["market-type"].toUpperCase()) > -1
			})

			if (actual) {
				return actual.actualType
			}
			return market["market-type"] ? market["market-type"].toUpperCase() : "-"
		case "betfair":
			if (market.description.bettingType === "ASIAN_HANDICAP_DOUBLE_LINE") {
				handicapMod = parseFloat(market.runners[0].handicap) % 1

				if (handicapMod === 0.25 || handicapMod === -0.25 || handicapMod === 0.75 || handicapMod === -0.75) {
					return "QUARTER_LINE_ASIAN_HANDICAP"
				} else if (handicapMod === -0.5 || handicapMod === 0.5) {
					return "HALF_LINE_ASIAN_HANDICAP"
				} else if (handicapMod === -0 || handicapMod === 0) {
					return "FULL_LINE_ASIAN_HANDICAP"
				}
			}
			actual = MarketTypes.find(type => market.description.marketType === type.actualType)

			if (actual) {
				return actual.actualType
			}

			actual = MarketTypes.find(type => {
				if (market.description.marketType === "MATCH_ODDS") {
					return market.eventType.name === "Soccer" || market.eventType.name === "Rugby Union" || market.eventType.name === "Rugby League"
						? "ONE_X_TWO"
						: "ONE_TWO"
				}
				return type.potentialTypes.indexOf(market.description.marketType) > -1
			})

			if (actual) {
				return actual.actualType
			}
			return market.description.marketType || "-"
		default:
			return "Oh no!"
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

function getRunnerHandicap(market, name) {
	if (market.runners.length === 2) {
		if (isAsianQuarterLine(name)) {
			return getAsianQuarterLineHandicap(name)
		}
		if (isAsianFullLine(name)) {
			return getAsianFullLineHandicap(name)
		}

		if (isAsianHalfLine(name, true)) {
			return isUnderOverMarket(market) ? 0 : getAsianHalfLineHandicap(name)
		}
	}
	return 0
}

function getMarketName(market, exchange) {
	let nameToUse
	let typeToUse

	switch (exchange) {
		case "matchbook":
			typeToUse = market.type
			nameToUse = market.name

			if (typeToUse.toUpperCase() === "BINARY" && isUnderOverMarket(market)) {
				// Matchbook don't seem to give any other over/under markets other than for goals...
				return `${nameToUse} - Goals`
			}
			return nameToUse
		case "betfair":
			typeToUse = market.description.marketType
			nameToUse = market.marketName

			if (typeToUse.indexOf("OVER_UNDER") > -1) {
				if (nameToUse.toUpperCase().indexOf("CORNERS") > -1) {
					return `${nameToUse.substring(nameToUse.indexOf("Corners ") + 8, nameToUse.length)} - Corners`
				}
				if (nameToUse.toUpperCase().indexOf("CARDS") > -1) {
					return `${nameToUse.substring(nameToUse.indexOf("Cards ") + 6, nameToUse.length)} - Cards`
				}
				if (nameToUse.toUpperCase().indexOf("GOALS") > -1) {
					return `${nameToUse.substring(0, nameToUse.indexOf(" Goals"))} - Goals`
				}
				console.log("don't know what this is...")
			}
			return nameToUse
		default:
			return market.name
	}
}

export function matchbook_buildFullEvents(events) {
	return events
		.map(event => {
			const metaTags = event["meta-tags"]
			const countryTag = metaTags.find(tag => tag.type === "COUNTRY")
			const eventTypeTag = metaTags.find(tag => tag.type === "SPORT")

			if (countryTag && getCode(countryTag.name) === undefined) {
				console.log(countryTag.name)
			}
			if (!countryTag) {
				console.log(event)
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
						name: getMarketName(market, "matchbook"),
						type: getMarketType(market, "matchbook"),
						runners: market.runners.map(runner => {
							return {
								id: runner.id || "-",
								name: runner.name || "-",
								handicap: getRunnerHandicap(market, runner.name),
								prices: {
									back: runner.prices.filter(price => price.side === "back").map(price => price.odds),
									lay: runner.prices.filter(price => price.side === "lay").map(price => price.odds)
								}
							}
						})
					}
				})
			}
		})
		.filter(event => event.markets.length)
}

export function betfair_buildFullEvents(marketCatalogues, marketBooks) {
	const groupByEventId = groupBy(marketCatalogues, catalogue => catalogue.event.id)

	let marketBook
	let marketBookRunner

	return values(
		mapValues(groupByEventId, markets => {
			return {
				id: markets[0].event.id || "-",
				name: markets[0].event.name || "-",
				eventType: markets[0].eventType.name || "-",
				// competitors: getCompetitors(markets[0].eventType.name, markets, "betfair"),
				country: markets[0].event.countryCode || "-",
				markets: formatMarkets(markets, "betfair").map(market => {
					// console.log(market.marketId)
					marketBook = marketBooks.find(book => book.marketId === market.marketId)

					// TODO: Sometimes the 'marketBook' will be undefined as the 'marketId' can sometimes
					// not match due to formatting of handicap markets
					// console.log("Market ID: ", market.marketId);
					// console.log("Market Name: ", market.marketName);
					// console.log("Market book found: ", marketBook)
					// console.log("\n")

					return {
						id: market.marketId || "-",
						name: getMarketName(market, "betfair"),
						type: getMarketType(market, "betfair"),
						runners: market.runners.map(runner => {
							if (!marketBook) {
								console.log(marketBooks)
								console.log(market.marketId)
							}
							marketBookRunner = marketBook.runners.find(mRunner => {
								return String(mRunner.selectionId) === String(runner.selectionId) && runner.handicap === mRunner.handicap
							})

							return {
								id: runner.selectionId || "-",
								name: runner.runnerName,
								handicap: runner.handicap,
								prices: {
									back: marketBookRunner ? marketBookRunner.ex.availableToBack.map(ex => ex.price) : [],
									lay: marketBookRunner ? marketBookRunner.ex.availableToLay.map(ex => ex.price) : []
								}
							}
						})
					}
				})
			}
		})
	).filter(event => event.markets.length)
}
