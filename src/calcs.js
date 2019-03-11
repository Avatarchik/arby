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

function getSameRunner(runnerName, otherRunners) {
	const match = findBestMatch(
		runnerName.toUpperCase(),
		otherRunners.map(runner => {
			return runner.name.toUpperCase()
		})
	)

	return otherRunners.find(runner => {
		return runner.name.toUpperCase() === match.bestMatch.target
	})
}

function getOpposingRunner(runnerName, otherRunners) {
	const match = findBestMatch(
		runnerName.toUpperCase(),
		otherRunners.map(runner => {
			return runner.name.toUpperCase()
		})
	)

	// Since there are only 2 runners in this scenario, this is a safe calculation
	// to get the runner that does not equal the best match
	return otherRunners.find(runner => {
		return runner.name.toUpperCase() !== match.bestMatch.target
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

function findArb(runner, opposingRunner) {
	let potentialArb

	for (const price of runner.prices.back) {
		if (price <= 2 && price >= 1.2) {
			potentialArb = ArbTable.find(arb => {
				return price >= arb.outcome1 && price < arb.outcome1 + 0.1 && Math.max(...opposingRunner.prices.back) > arb.outcome2
			})

			if (potentialArb) {
				return {
					outcome1Price: price,
					runner,
					opposingRunner,
					arb: potentialArb
				}
			}
		}
	}
}

function getPotentialArb(market, exchanges, runners) {
	let potentialArb

	for (let i = 0; i < runners.length; i++) {
		potentialArb = findArb(runners[i], runners[!!i ? 0 : 1])

		if (potentialArb) {
			return {
				...potentialArb,
				ex: !!i ? exchanges.ex2 : exchanges.ex1,
				opposingEx: !!i ? exchanges.ex1 : exchanges.ex2,
				market: !!i ? market.market2.id : market.market1.id,
				opposingMarket: !!i ? market.market1.id : market.market2.id
			}
		}
	}
}

function buildBackBackArb(arb) {
	const largestOpposingRunnerBack = Math.max(...arb.opposingRunner.prices.back)

	return {
		slot: arb.arb,
		difference: largestOpposingRunnerBack - arb.outcome1Price,
		outcome1: {
			runner: {
				id: arb.runner.id,
				name: arb.runner.name,
				...(arb.runner.handicap && { handicap: arb.runner.handicap }),
				price: arb.outcome1Price
			},
			market: arb.market,
			ex: arb.ex
		},
		outcome2: {
			runner: {
				id: arb.opposingRunner.id,
				name: arb.opposingRunner.name,
				...(arb.opposingRunner.handicap && { handicap: arb.opposingRunner.handicap }),
				price: largestOpposingRunnerBack
			},
			market: arb.opposingMarket,
			ex: arb.opposingRunner
		}
	}
}

function buildBackLayArb(market, exchanges, runners, layMarketExchange) {
	const layRunner = runners[0]
	const backRunner = runners[1]
	const largestBackPrice = Math.max(...backRunner.prices.back)
	const smallestLayPrice = Math.min(...layRunner.prices.lay)

	if (smallestLayPrice < largestBackPrice) {
		return {
			difference: largestBackPrice - smallestLayPrice,
			lay: {
				runner: {
					id: layRunner.id,
					name: layRunner.name,
					...(layRunner.handicap && { handicap: layRunner.handicap }),
					price: Math.min(...layRunner.prices.lay)
				},
				market: layMarketExchange === 1 ? market.market1.id : market.market2.id,
				ex: layMarketExchange === 1 ? exchanges.ex1 : exchanges.ex2
			},
			back: {
				runner: {
					id: backRunner.id,
					name: backRunner.name,
					...(backRunner.handicap && { handicap: backRunner.handicap }),
					price: Math.max(...backRunner.prices.back)
				},
				market: layMarketExchange === 1 ? market.market2.id : market.market1.id,
				ex: layMarketExchange === 1 ? exchanges.ex2 : exchanges.ex1
			}
		}
	}
}

function findBackLayArbs(market, runners, foundArbs, exchanges) {
	let market2Runner
	let market1Runner
	let backLayArb
	let runner1SmallestLay
	let runner2SmallestLay

	if (runners.length) {
		market1Runner = runners[0]
		market2Runner = getSameRunner(market1Runner.name, market.market2.runners)

		// Again...there are no prices already so pointless going further than this
		// Worth investigating whether I could set the 1st price? Probably...
		if (
			market1Runner.prices.lay.length &&
			market2Runner.prices.lay.length &&
			market1Runner.prices.back.length &&
			market2Runner.prices.back.length
		) {
			runner1SmallestLay = Math.min(...market1Runner.prices.lay)
			runner2SmallestLay = Math.min(...market2Runner.prices.lay)

			if (runner1SmallestLay <= runner2SmallestLay) {
				backLayArb = buildBackLayArb(market, exchanges, [market1Runner, market2Runner], 1)

				if (backLayArb) {
					foundArbs.push(backLayArb)
				}
			} else {
				backLayArb = buildBackLayArb(market, exchanges, [market2Runner, market1Runner], 2)

				if (backLayArb) {
					foundArbs.push(backLayArb)
				}
			}
			runners.splice(market1Runner, 1)

			return findBackLayArbs(market, runners, foundArbs, exchanges)
		}
	}
	return foundArbs && foundArbs.length ? foundArbs : []
}

function findBackBackArbs(market, runners, foundArbs, exchanges) {
	let market1Runner
	let market2Runner
	let potentialArb

	if (runners.length) {
		market1Runner = runners[0]
		market2Runner = getOpposingRunner(market1Runner.name, market.market2.runners)

		// Again...there are no prices already so pointless going further than this
		// Worth investigating whether I could set the 1st price? Probably...
		if (market1Runner.prices.back.length && market2Runner.prices.back.length) {
			potentialArb = getPotentialArb(market, exchanges, [market1Runner, market2Runner])

			if (potentialArb) {
				if (!potentialArb.arb) {
					return findBackBackArbs(market, runners, foundArbs, exchanges)
				}
				foundArbs.push(buildBackBackArb(potentialArb))
			}
		}
		runners.splice(market1Runner, 1)

		return findBackBackArbs(market, runners, foundArbs, exchanges, [])
	}
	return foundArbs && foundArbs.length ? foundArbs : []
}

function findArbs(event) {
	return event.matchedMarkets
		.map(market => {
			if (market.market1.runners.length) {
				if (market.market1.runners.length === 2) {
					return {
						type: "BackBack",
						arbs: findBackBackArbs(market, market.market1.runners, [], {
							ex1: event.ex1,
							ex2: event.ex2
						})
					}
				} else {
					return {
						type: "BackLay",
						arbs: findBackLayArbs(market, market.market1.runners, [], {
							ex1: event.ex1,
							ex2: event.ex2
						})
					}
				}
			}
		})
		.filter(arb => arb.arbs && arb.arbs.length)
}

function placeArbs(event) {}

function allocateFundsPerArb(eventsWithArbs) {}

/**
 * Okay this seems like a horrible piece of dog poo but is actually very simple...
 * It checks whether the initial arb (arb1) is a BackBack or BackLay
 * That's the initial condition
 * After checking, will check the other arb to see what it is
 * The massive ternary just checks whether the runners (outcome1/outcome2/lay/back) of the initial arb
 * Are present in that of the other arb
 */
function findArbInSameMarket(arb1, arb2) {
	if (arb1.outcome1 && arb1.outcome2) {
		// Is a BackBack
		return arb2.outcome1 && arb2.outcome2
			? (arb1.outcome1.market === arb2.outcome1.market && arb1.outcome1.ex === arb2.outcome1.ex) ||
					(arb1.outcome1.market === arb2.outcome2.market && arb1.outcome1.ex === arb2.outcome2.ex) ||
					(arb1.outcome2.market === arb2.outcome1.market && arb1.outcome2.ex === arb2.outcome1.ex) ||
					(arb1.outcome2.market === arb2.outcome2.market && arb1.outcome2.ex === arb2.outcome2.ex)
			: (arb1.outcome1.market === arb2.lay.market && arb1.outcome1.ex === arb2.lay.ex) ||
					(arb1.outcome1.market === arb2.back.market && arb1.outcome1.ex === arb2.back.ex) ||
					(arb1.outcome2.market === arb2.lay.market && arb1.outcome2.ex === arb2.lay.ex) ||
					(arb1.outcome2.market === arb2.back.market && arb1.outcome2.ex === arb2.back.ex)
	} else {
		// Is a BackLay
		return arb2.outcome1 && arb2.outcome2
			? (arb1.lay.market === arb2.outcome1.market && arb1.lay.ex === arb2.outcome1.ex) ||
					(arb1.lay.market === arb2.outcome2.market && arb1.lay.ex === arb2.outcome2.ex) ||
					(arb1.back.market === arb2.outcome1.market && arb1.back.ex === arb2.outcome1.ex) ||
					(arb1.back.market === arb2.outcome2.market && arb1.back.ex === arb2.outcome2.ex)
			: (arb1.lay.market === arb2.lay.market && arb1.lay.ex === arb2.lay.ex) ||
					(arb1.lay.market === arb2.back.market && arb1.lay.ex === arb2.back.ex) ||
					(arb1.back.market === arb2.lay.market && arb1.back.ex === arb2.lay.ex) ||
					(arb1.back.market === arb2.back.market && arb1.back.ex === arb2.back.ex)
	}
}

function removeContradictingArbs(eventsWithArbs) {
	let totalArbs
	let arbInSameMarket

	return eventsWithArbs.map(event => {
		totalArbs = [...event.arbs.BackBack, ...event.arbs.BackLay]

		if (totalArbs.length === 1) {
			return event
		}

		totalArbs.map(arb1 => {
			arbInSameMarket = totalArbs.find(arb2 => {
				return findArbInSameMarket(arb1, arb2) && arb1 !== arb2
			})

			if (arbInSameMarket) {
				totalArbs.splice(arbInSameMarket, 1)

				return arb1.difference > arbInSameMarket.difference ? arb1 : arbInSameMarket
			}
			return arb1
		})
	})
	console.log(eventsWithArbs)
}

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
				const backBack = arbs.filter(arb => arb.type === "BackBack")
				const backLay = arbs.filter(arb => arb.type === "BackLay")

				if (arbs && arbs.length) {
					return {
						...event,
						arbs: {
							BackBack: (backBack.length && backBack.arbs) || [],
							BackLay: (backLay.length && backLay.arbs) || []
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

	removeContradictingArbs(eventsWithArbs)
	// allocateFundsPerArb(eventsWithArbs)
	// eventsWithArbs.forEach(event => {
	// 	placeArbs(event);
	// });
}
