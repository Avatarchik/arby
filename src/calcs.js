import { filter, uniq } from "lodash"
import { findBestMatch } from "string-similarity"
import ArbTable from "../lib/arb-table"
import { isAsianDoubleLine, isAsianSingleLine } from "./helpers"
import BetfairConfig from "./exchanges/betfair/config"
import MatchbookConfig from "./exchanges/matchbook/config"

function getExchangesToCompare(exchanges, exchangeBeingChecked, exchangesChecked) {
	return filter(exchanges, exchange => {
		return exchange.name !== exchangeBeingChecked.name && exchangesChecked.indexOf(exchange.name) <= -1
	})
}

// function teamMatch(eventToCheck, eventToCompare, similarityThreshold) {
// 	let bestMatchedTeam;

// 	try {
// 		return eventToCheck.competitors.every(competitorToCheck => {
// 			bestMatchedTeam = findBestMatch(competitorToCheck, eventToCompare.competitors);

// 			return bestMatchedTeam.bestMatch.rating >= similarityThreshold;
// 		});
// 	} catch (err) {
// 		console.error(err);
// 	}
// }

function countryMatch(eventToCheck, eventToCompare) {
	// The results returned for countries are not reliable so, unless both exchanges have a country code linked to the event, check them
	if (eventToCheck.country !== "-" && eventToCompare.country !== "-") {
		return eventToCompare.country.toUpperCase() === eventToCheck.country.toUpperCase()
	}
	return true
}

function eventTypeMatch(eventToCheck, eventToCompare) {
	return eventToCheck.eventType.toUpperCase() === eventToCompare.eventType.toUpperCase()
}

function checkHandicapsAreSame(market1, market2) {
	let market1Handicap
	let market2Handicap

	if (isAsianDoubleLine(market1.name) && isAsianDoubleLine(market2.name)) {
		market1Handicap = market1.name.match(/\(\d?\.\d{1,2}\/[+-]?\d?\.\d{1,2}\)/g)
		market2Handicap = market2.name.match(/\(\d?\.\d{1,2}\/[+-]?\d?\.\d{1,2}\)/g)

		return market1Handicap === market2Handicap
	} else if (isAsianSingleLine(market1.name, false) && isAsianSingleLine(market2.name, false)) {
		market1Handicap = market1.name.match(/(\(?\d?\.\d{1,2}\)?)/g)
		market2Handicap = market2.name.match(/(\(?\d?\.\d{1,2}\)?)/g)

		return Number(market1Handicap[0]) === Number(market2Handicap[0])
	}
}

function findSameMarkets(matchedEvent, similarityThreshold) {
	let bestMatchedMarket
	let marketsOfSameType
	let matchingMarket
	let matchedMarkets = []
	let sameHandicap

	matchedEvent.event1.markets.forEach(ex1Market => {
		marketsOfSameType = matchedEvent.event2.markets.filter(ex2Market => ex2Market.type === ex1Market.type)

		if (marketsOfSameType.length) {
			bestMatchedMarket = findBestMatch(ex1Market.name.toUpperCase(), marketsOfSameType.map(ex2Market => ex2Market.name.toUpperCase()))

			if (bestMatchedMarket.bestMatch.rating >= similarityThreshold) {
				console.log(`"${ex1Market.name}" matched with "${bestMatchedMarket.bestMatch.target}" @ ${bestMatchedMarket.bestMatch.rating}`)

				matchingMarket = marketsOfSameType.find(market => market.name.toUpperCase() === bestMatchedMarket.bestMatch.target)

				if (ex1Market.type === "HANDICAP" || ex1Market.type === "ASIAN_HANDICAP") {
					sameHandicap = checkHandicapsAreSame(ex1Market, matchingMarket)
				}

				// Would be undefined if not a handicap market so the condition above has not been truthy
				if (sameHandicap === undefined || sameHandicap) {
					matchedMarkets.push({
						market1: ex1Market,
						market2: matchingMarket
					})
				}
				sameHandicap = undefined
			}
		}
	})
	return matchedMarkets
}

// function checkQualifictionEvents(exchangesToCompare) {
// 	return exchangesToCompare.filter(exchange => {
// 		return exchange.events.filter(event => {
// 			return event.name.indexOf("To Qualify") > -1;
// 		}).length;
// 	});
// }

function findSameEvents(exchanges) {
	let exchangesToCompare
	let exchangeToCheck
	let exchangeToCompare
	let eventToCheck
	let matches = []
	let exchangesChecked = []
	let eventBestMatch
	let eventsMatchingCountryAndType
	let matchingEvent

	console.time("findSameEvents")
	for (let i = 0; i < exchanges.length; i++) {
		exchangesToCompare = getExchangesToCompare(exchanges, exchanges[i], exchangesChecked)
		exchangesChecked.push(exchanges[i].name)
		exchangeToCheck = exchanges[i]

		if (exchangesToCompare.length) {
			// Iterate the events of the exchange you are checking
			for (let j = 0; j < exchanges[i].events.length; j++) {
				eventToCheck = exchanges[i].events[j]

				if (eventToCheck.name.indexOf("To Qualify") > -1) {
					console.log("don't think we care about this anymore as not doing anything with competitors")
				} else {
					// Iterate the exchanges that are not this one
					// (This and the iteration above could be swapped around but don't think it makes that much difference to performance)
					for (let k = 0; k < exchangesToCompare.length; k++) {
						exchangeToCompare = exchangesToCompare[k]

						eventsMatchingCountryAndType = exchangeToCompare.events
							.filter(eventToCompare => {
								return countryMatch(eventToCheck, eventToCompare) && eventTypeMatch(eventToCheck, eventToCompare)
							})
							.map(event => event.name)

						if (eventsMatchingCountryAndType && eventsMatchingCountryAndType.length) {
							eventBestMatch = findBestMatch(eventToCheck.name, eventsMatchingCountryAndType)

							if (eventBestMatch.bestMatch.rating >= 0.5) {
								matchingEvent = exchangeToCompare.events.find(event => event.name === eventBestMatch.bestMatch.target)

								matches.push({
									ex1: exchangeToCheck.name,
									event1: eventToCheck,
									ex2: exchangeToCompare.name,
									event2: matchingEvent
								})
							}
						}
					}
				}
			}
		}
	}
	console.timeEnd("findSameEvents")
	return uniq(matches)
}

function getSameRunner(runnerToMatch, otherRunners) {
	const match = findBestMatch(runnerToMatch.name, otherRunners.map(runner => runner.name))

	return otherRunners.find(runner => runner.name === match.bestMatch.target)
}

function getPotentialArb(prices, prioritiesTried, exchanges) {
	const runner1 = prices[0]
	const runner2 = prices[1]

	if (runner1.smallest < runner2.smallest && runner1.smallest <= 2) {
		return {
			ex: exchanges.ex1,
			runner: runner1,
			opposingRunner: runner2,
			opposingEx: exchanges.ex2,
			arb: ArbTable.find(arb => {
				if (prioritiesTried && prioritiesTried.length) {
					return prioritiesTried.indexOf(arb.priority) <= -1 && runner1.smallest <= arb.outcome1
				}
				return runner1.smallest <= arb.outcome1
			})
		}
	} else if (runner2.smallest < runner1.smallest && runner2.smallest <= 2) {
		return {
			ex: exchanges.ex2,
			runner: runner2,
			opposingRunner: runner1,
			opposingEx: exchanges.ex1,
			arb: ArbTable.find(arb => {
				if (prioritiesTried && prioritiesTried.length) {
					return prioritiesTried.indexOf(arb.priority) <= -1 && runner1.smallest <= arb.outcome1
				}
				return runner1.smallest <= arb.outcome1
			})
		}
	}
}

function getSmallestLayPrices(runner1, runner2) {
	return [
		{
			id: runner1.id,
			name: runner1.name,
			market: 1,
			smallest: Math.min(...runner1.prices.lay)
		},
		{
			id: runner2.id,
			name: runner2.name,
			market: 2,
			smallest: Math.min(...runner2.prices.lay)
		}
	]
}

function getSmallestBackPrices(runner1, runner2) {
	return [
		{
			id: runner1.id,
			name: runner1.name,
			market: 1,
			smallest: Math.min(...runner1.prices.back)
		},
		{
			id: runner2.id,
			name: runner2.name,
			market: 2,
			smallest: Math.min(...runner2.prices.back)
		}
	]
}

function getOpposingRunner(opposingMarket, runnerName) {
	const match = findBestMatch(runnerName, opposingMarket.runners.map(runner => runner.name))

	// Since there are only 2 runners in this scenario, this is a safe calculation
	// to get the runner that does not equal the best match
	return opposingMarket.runners.find(runner => {
		return runner.name !== match.bestMatch.target
	})
}

function getBestArb(potentialArbs) {
	const betfairConfig = new BetfairConfig()
	const matchbookConfig = new MatchbookConfig()
	const numberOfPotentialArbs = potentialArbs.length

	let matchbookBalance
	let betfairBalance

	potentialArbs.forEach(arb => {
		switch (arb.backExchange) {
			case "matchbook":
				matchbookBalance = matchbookConfig.balance
				break
			case "betfair":
				betfairBalance = betfairConfig.balance
				break
			case "betdaq":
				break
			default:
				return "Oh no...exchange not supported"
		}
	})
	/**
	 * 1. Get the balances of both markets in question
	 * 2. Calculate the best odds based on this information...
	 */
}

function findBackLayArb(market, runners, possibleArbs, exchanges) {
	let largestBackPrice
	let market2Runner
	let market1Runner
	let smallestLayPrices

	if (runners.length) {
		market1Runner = runners[0]
		market2Runner = getSameRunner(market1Runner, market.market2.runners)
		smallestLayPrices = getSmallestLayPrices(market1Runner, market2Runner)

		// Again...there are no prices already so pointless going further than this
		// Worth investigating whether I could set the 1st price? Probably...
		if (
			market1Runner.prices.lay.length &&
			market2Runner.prices.lay.length &&
			market1Runner.prices.back.length &&
			market2Runner.prices.back.length
		) {
			if (smallestLayPrices[0].smallest <= smallestLayPrices[1].smallest) {
				largestBackPrice = Math.max(...market2Runner.prices.back)

				if (smallestLayPrices[0].smallest < largestBackPrice) {
					possibleArbs.push({
						difference: largestBackPrice - smallestLayPrices[0].smallest,
						layRunner: market1Runner,
						layExchange: exchanges.ex1,
						backRunner: market2Runner,
						backExchange: exchanges.ex2
					})
				}
			} else {
				largestBackPrice = Math.max(...market1Runner.prices.back)

				if (smallestLayPrices[1].smallest < largestBackPrice) {
					possibleArbs.push({
						difference: largestBackPrice - smallestLayPrices[1].smallest,
						layRunner: market2Runner,
						layExchange: exchanges.ex2,
						backRunner: market1Runner,
						backExchange: exchanges.ex1
					})
				}
			}
			runners.splice(market1Runner, 1)

			return findBackLayArb(market, runners, possibleArbs, exchanges)
		}
	}

	if (possibleArbs.length) {
		return possibleArbs
	}
	// No arbs found at all :(
}

function findBackBackArb(backPrices, market, exchanges, arbPrioritiesTried) {
	// Tested all potential arb outcomes so quit as no arb :(
	if (arbPrioritiesTried && arbPrioritiesTried.length === 9) {
		return {}
	}

	let potentialArb = getPotentialArb(backPrices, arbPrioritiesTried, exchanges)
	let runnerNameUsed
	let opposingMarket
	let opposingRunner

	if (potentialArb && potentialArb.arb) {
		runnerNameUsed = potentialArb.runner.name
		opposingMarket = potentialArb.runner.market === 1 ? market.market2 : market.market1
		opposingRunner = getOpposingRunner(opposingMarket, runnerNameUsed)

		if (opposingRunner.prices.back && opposingRunner.prices.back.length) {
			if (Math.max(...opposingRunner.prices.back) > potentialArb.arb.outcome2) {
				return potentialArb
			} else {
				if (arbPrioritiesTried && arbPrioritiesTried.length) {
					return findBackBackArb(backPrices, market, exchanges, [...arbPrioritiesTried, potentialArb.arb.priority])
				} else {
					return findBackBackArb(backPrices, market, exchanges, [potentialArb.arb.priority])
				}
			}
		}
		// There are no prices (yet) for the opposing runner so may as well quit
		// Is it possible for me to become the 1st price and set the threshold?
		return {}
	}
}

function findArbs(event) {
	let smallestBackPrices
	let market2Runner
	let market1Runner

	return event.matchedMarkets
		.map(market => {
			if (market.market1.runners.length) {
				if (market.market1.runners.length === 2) {
					market1Runner = market.market1.runners[0]
					market2Runner = getSameRunner(market1Runner, market.market2.runners)
					smallestBackPrices = getSmallestBackPrices(market1Runner, market2Runner)

					// Hmmm...a check for now but is it possible for me to be the 1st price?
					if (
						market1Runner.prices.back &&
						market1Runner.prices.back.length &&
						market2Runner.prices.back &&
						market2Runner.prices.back.length
					) {
						return {
							type: "BackBack",
							arbs: findBackBackArb(smallestBackPrices, market, {
								ex1: event.ex1,
								ex2: event.ex2
							})
						}
					}
					return {}
				} else {
					return {
						type: "BackLay",
						arbs: findBackLayArb(market, market.market1.runners, [], {
							ex1: event.ex1,
							ex2: event.ex2
						})
					}
				}
			}
		})
		.filter(arb => {
			if (arb && arb.arbs) {
				return arb.arbs instanceof Array ? arb.arbs.length : Object.keys(arb.arbs).length
			}
		})
}

function placeArbs(event) {}

function allocateFundsPerArb(eventsWithArbs) {}

export function matchMarkets(exchangesEvents) {
	const sameEvents = findSameEvents(exchangesEvents)
	const eventsWithMatchedMarkets = sameEvents.map(event => {
		// This threshold (0.6) is quite high considering am also taking the market type into account
		// This is because any lower and Asian Single Lines matched with Asian Double Lines
		// In the future, I could split these into 2 separate market types but for now...no
		return {
			...event,
			matchedMarkets: findSameMarkets(event, 0.6)
		}
	})
	const eventsWithArbs = eventsWithMatchedMarkets
		.map(event => {
			if (event.matchedMarkets.length) {
				const arbs = findArbs(event)
				const backBack = arbs.find(arb => arb.type === "BackBack")
				const backLay = arbs.find(arb => arb.type === "BackLay")

				if (arbs && arbs.length) {
					return {
						...event,
						arbs: {
							BackBack: (backBack && backBack.arbs) || {}, // The reason this is an Object over an array is that there can only ever be 1 BackBack arb per market
							BackLay: (backLay && backLay.arbs) || []
						}
					}
				}
			}
			return event
		})
		.filter(event => {
			return (
				event.arbs && ((event.arbs.BackBack && Object.keys(event.arbs.BackBack).length) || (event.arbs.BackLay && event.arbs.BackLay.length))
			)
		})

	allocateFundsPerArb(eventsWithArbs)
	// eventsWithArbs.forEach(event => {
	// 	placeArbs(event);
	// });
}
