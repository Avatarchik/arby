import { filter, uniq, flattenDeep, uniqBy } from "lodash"
import { findBestMatch } from "string-similarity"
import { MongoClient } from "mongodb"

import ArbTable from "../../../lib/arb-table"

function getExchangesToCompare(exchanges, exchangeBeingChecked, exchangesChecked) {
	return filter(exchanges, exchange => {
		return exchange.name !== exchangeBeingChecked.name && !exchangesChecked.includes(exchange.name)
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
	// I did it this way to guarentee iteration order although you may find better ways down the line I assume...
	for (let i = 0; i < market1.runners.length; i++) {
		if (market1.runners[i].handicap !== market2.runners[i].handicap) {
			return false
		}
	}
	return true
}

function checkNumberAreSame(market1Name, market2Name) {
	return parseInt(market1Name.replace(/[^0-9\.]+/g, "")) === parseInt(market2Name.replace(/[^0-9\.]+/g, ""))
}

function findSameMarket(potentialMarkets, market, threshold) {
	let ex2MarketNames
	let bestMatchedMarket
	let matchingMarket
	let sameHandicap
	let sameNumber

	if (!potentialMarkets.length) {
		// No match :(
		return
	}
	ex2MarketNames = potentialMarkets.map(ex2Market => ex2Market.name.toUpperCase())
	bestMatchedMarket = findBestMatch(market.name.toUpperCase(), ex2MarketNames)

	if (bestMatchedMarket.bestMatch.rating <= threshold) {
		return findSameMarket(
			potentialMarkets.filter(market => {
				return market.name.toUpperCase() !== bestMatchedMarket.bestMatch.target.toUpperCase()
			}),
			market,
			threshold
		)
	}
	matchingMarket = potentialMarkets.find(market => market.name.toUpperCase() === bestMatchedMarket.bestMatch.target)

	if (market.type.includes("ASIAN_HANDICAP")) {
		sameHandicap = checkHandicapsAreSame(market, matchingMarket)
	} else if (market.name.toUpperCase().includes("OVER/UNDER")) {
		sameNumber = checkNumberAreSame(market.name, matchingMarket.name)
	}

	if (sameNumber === false || sameHandicap === false) {
		return findSameMarket(
			potentialMarkets.filter(market => {
				return market.name.toUpperCase() !== matchingMarket.name.toUpperCase()
			}),
			market,
			threshold
		)
	}
	// console.log(`"${market.name}" matched with "${bestMatchedMarket.bestMatch.target}" @ ${bestMatchedMarket.bestMatch.rating}`)
	return matchingMarket
}

function findSameMarkets(matchedEvent, similarityThreshold) {
	let marketsOfSameType
	let matchedMarkets = []
	let sameMarket

	matchedEvent.event1.markets.forEach(ex1Market => {
		marketsOfSameType = matchedEvent.event2.markets.filter(ex2Market => {
			return ex2Market.type === ex1Market.type && ex1Market.runners.length === ex2Market.runners.length
		})

		if (marketsOfSameType.length) {
			if (ex1Market.name === "Set Betting" || ex1Market.name === "WIN" || ex1Market.name === "Series Winner") {
				console.log("debug")
			}
			sameMarket = findSameMarket(marketsOfSameType, ex1Market, similarityThreshold)

			if (sameMarket) {
				matchedMarkets.push({
					market1: ex1Market,
					market2: sameMarket
				})
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

	try {
		console.time("findSameEvents")
		for (let i = 0; i < exchanges.length; i++) {
			exchangesToCompare = getExchangesToCompare(exchanges, exchanges[i], exchangesChecked)
			exchangesChecked.push(exchanges[i].name)
			exchangeToCheck = exchanges[i]

			if (exchangesToCompare.length) {
				// Iterate the events of the exchange you are checking
				for (let j = 0; j < exchanges[i].events.length; j++) {
					eventToCheck = exchanges[i].events[j]

					// if (eventToCheck.name.indexOf("To Qualify") > -1) {
					//     console.log("don't think we care about this anymore as not doing anything with competitors")
					// } else {
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
							} else {
								console.log("debug")
							}
						}
					}
					// }
				}
			}
		}
		console.timeEnd("findSameEvents")
		return uniq(matches)
	} catch (err) {
		console.error(err)
	}
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

// function getBestArb(potentialArbs) {
// 	const numberOfPotentialArbs = potentialArbs.length

// 	let matchbookBalance
// 	let betfairBalance

// 	potentialArbs.forEach(arb => {
// 		switch (arb.backExchange) {
// 			case "matchbook":
// 				matchbookBalance = matchbookConfig.balance
// 				break
// 			case "betfair":
// 				betfairBalance = betfairConfig.balance
// 				break
// 			case "betdaq":
// 				break
// 			default:
// 				return "Oh no...exchange not supported"
// 		}
// 	})
// 	/**
// 	 * 1. Get the balances of both markets in question
// 	 * 2. Calculate the best odds based on this information...
// 	 */
// }

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
			ex: arb.opposingEx
		}
	}
}

function buildBackLayArb(market, exchanges, runners, layMarketExchange) {
	const layRunner = runners[0]
	const backRunner = runners[1]

	// if (!backRunner.prices.back.length) {
	// 	console.log('here we are')
	// }
	const largestBackPrice = Math.max(...backRunner.prices.back)
	const smallestLayPrice = Math.min(...layRunner.prices.lay)

	// Even though these outcomes should be named 'back' and 'lay' and will be in a bit
	// They are called this way at the moment so is easier to filter through them when
	// checking for contradictory arbs
	if (smallestLayPrice < largestBackPrice) {
		return {
			difference: largestBackPrice - smallestLayPrice,
			outcome2: {
				runner: {
					id: layRunner.id,
					name: layRunner.name,
					...(layRunner.handicap && { handicap: layRunner.handicap }),
					price: Math.min(...layRunner.prices.lay)
				},
				market: layMarketExchange === 1 ? market.market1.id : market.market2.id,
				ex: layMarketExchange === 1 ? exchanges.ex1 : exchanges.ex2
			},
			outcome1: {
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

function findArbs_BackLay(market, runners, foundArbs, exchanges) {
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
			market1Runner.prices.back.length &&
			market2Runner.prices.lay.length &&
			market1Runner.prices.lay.length &&
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

			return findArbs_BackLay(market, runners, foundArbs, exchanges)
		}

		// TODO: When figure out if can make own prices or not, uncomment this
		// if (
		// 	(market1Runner.prices.back.length &&
		// 	market2Runner.prices.lay.length) ||
		// 	(market1Runner.prices.lay.length &&
		// 	market2Runner.prices.back.length)
		// ) {
		// 	if (market1Runner.prices.lay.length) {
		// 		runner1SmallestLay = Math.min(...market1Runner.prices.lay)
		// 	}
		// 	if (market2Runner.prices.lay.length) {
		// 		runner2SmallestLay = Math.min(...market2Runner.prices.lay)
		// 	}

		// 	if (runner1SmallestLay && runner2SmallestLay) {
		// 		if (runner1SmallestLay <= runner2SmallestLay) {
		// 			backLayArb = buildBackLayArb(market, exchanges, [market1Runner, market2Runner], 1)

		// 			if (backLayArb) {
		// 				foundArbs.push(backLayArb)
		// 			}
		// 		} else {
		// 			backLayArb = buildBackLayArb(market, exchanges, [market2Runner, market1Runner], 2)

		// 		if (backLayArb) {
		// 			foundArbs.push(backLayArb)
		// 		}
		// 		}
		// 	} else if (runner1SmallestLay) {
		// 		backLayArb = buildBackLayArb(market, exchanges, [market1Runner, market2Runner], 1)

		// 		if (backLayArb) {
		// 			foundArbs.push(backLayArb)
		// 		}
		// 	} else if (runner2SmallestLay) {
		// 		backLayArb = buildBackLayArb(market, exchanges, [market2Runner, market1Runner], 2)

		// 		if (backLayArb) {
		// 			foundArbs.push(backLayArb)
		// 		}
		// 	}
		// 	runners.splice(market1Runner, 1)

		// 	return findBackLayArbs(market, runners, foundArbs, exchanges)
		// }
	}
	return foundArbs && foundArbs.length ? foundArbs : []
}

function findArbs_BackBack(market, runners, foundArbs, exchanges) {
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
					return findArbs_BackBack(market, runners, foundArbs, exchanges)
				}
				foundArbs.push(buildBackBackArb(potentialArb))
			}
		}
		runners.splice(market1Runner, 1)

		return findArbs_BackBack(market, runners, foundArbs, exchanges, [])
	}
	return foundArbs && foundArbs.length ? foundArbs : []
}

function findArbs(market, ex1, ex2) {
	if (market.market1.runners.length === 2) {
		return {
			BackBack: findArbs_BackBack(market, market.market1.runners, [], {
				ex1,
				ex2
			})
		}
	}
	return {
		BackLay: findArbs_BackLay(market, market.market1.runners, [], {
			ex1,
			ex2
		})
	}
}

function placeArbs(event) {
	console.log("placeArbs")
}

async function allocateFundsPerArb(arbs) {
	const client = await MongoClient.connect(process.env.DB_URL, {
		useNewUrlParser: true
	})
	const db = client.db(process.env.DB_NAME)
	const config = await db
		.collection("config")
		.find(
			{
				betfairBalance: {
					$exists: true
				}
			},
			{
				betfairBalance: 1,
				matchbookBalance: 1
			}
		)
		.toArray()
	const { betfairBalance, matchbookBalance } = config[0]
	const numberOfArbs = arbs.length
	const sumOfDifferences = arbs.reduce((diff, arb) => {
		return diff + parseFloat(arb.split("||")[1])
	}, 0)
	const arbsWithPercentages = arbs.map(arb => {
		return `${arb}||${(parseFloat(arb.split("||")[1]) / sumOfDifferences) * 100}`
	})
	const sortedArbs = arbsWithPercentages.sort((a, b) => {
		return parseFloat(b.split("||")[10]) - parseFloat(a.split("||")[10])
	})

	/**
	 * 1. Sum up all the differences from all arbs 					DONE
	 * 2. Work out each arb on a percentage basis					DONE
	 * 3. Allocate largest amount of funds to highest percentage
	 */
	console.log("allocatingFunds")
}

// function getArbsInSameMarket(arbs) {
// 	let remainingArbs
// 	let sameMarkets

// 	return arbs.reduce((acc, val) => {
// 		remainingArbs = arbs.filter(arb => {
// 			// These differences are to about 10 decimal places
// 			// Extremely unlikely that 2 arbs will ever have the exact same difference
// 			return arb.difference !== val.difference
// 		})

// 		if (remainingArbs.length) {
// 			sameMarkets = remainingArbs.filter(backLayArb => {
// 				return val.outcome1.market === backLayArb.outcome1.market && val.outcome2.market === backLayArb.outcome2.market
// 			})

// 			if (sameMarkets.length) {
// 				acc.push(sameMarkets)
// 			}
// 		}
// 		return acc
// 	}, [])
// }

/**
 * Okay this seems like a horrible piece of dog poo but is actually very simple...
 * It checks whether the initial arb (arb1) is a BackBack or BackLay
 * That's the initial condition
 * After checking, will check the other arb to see what it is
 * The massive ternary just checks whether the runners (outcome1/outcome2/lay/back) of the initial arb
 * Are present in that of the other arb
 */
// function findArbsInSameMarket(arbs) {
// 	const { BackBack, BackLay } = arbs

// 	let inSameMarket = []
// 	let remainingBackBackArbs

// 	if (BackBack.length) {
// 		inSameMarket = getArbsInSameMarket(BackBack)
// 	}

// 	remainingBackBackArbs = inSameMarket.length
// 		? BackBack.filter(arb => {
// 				return !inSameMarket.includes(arb)
// 		  })
// 		: BackBack

// 	if (BackLay.length) {
// 		inSameMarket = getArbsInSameMarket([...BackLay, ...remainingBackBackArbs])
// 	}
// 	return inSameMarket
// }

function removeContradictingArbs(eventsWithArbs) {
	let arbsInSameMarket
	let splitArb
	let _splitArb
	let arbLargestDifference

	return eventsWithArbs.filter(arb => {
		splitArb = arb.split("||")

		arbsInSameMarket = eventsWithArbs.filter(_arb => {
			_splitArb = _arb.split("||")

			return arb !== _arb && splitArb[3] === _splitArb[3] && splitArb[7] === _splitArb[7]
		})

		if (arbsInSameMarket.length) {
			arbLargestDifference = [...arbsInSameMarket, arb].sort((a, b) => {
				return b.difference - a.difference
			})[0]

			return arbLargestDifference === arb
		}
		return true
	})
}

export async function initArbitrage(exchangesEvents) {
	const matchedEvents = findSameEvents(exchangesEvents)

	let eventsWithMatchedMarkets
	let eventsWithArbs
	let nonConflictingArbs
	let foundArbs
	let marketArbType
	let fundsPerArb

	if (matchedEvents.length) {
		eventsWithMatchedMarkets = matchedEvents
			.map(event => {
				// This threshold (0.6) is quite high considering am also taking the market type into account
				// This is because any lower and Asian Single Lines matched with Asian Double Lines
				// In the future, I could split these into 2 separate market types but for now...no
				return {
					...event,
					matchedMarkets: findSameMarkets(event, 0.6)
				}
			})
			.filter(event => event.matchedMarkets.length)

		if (eventsWithMatchedMarkets.length) {
			eventsWithArbs = flattenDeep(
				eventsWithMatchedMarkets
					.map(event => {
						return event.matchedMarkets
							.map(market => {
								if (market.market1.runners.length) {
									foundArbs = findArbs(market, event.ex1, event.ex2)
									marketArbType = market.market1.runners.length <= 2 && market.market2.runners.length <= 2 ? "BackBack" : "BackLay"

									if (foundArbs[marketArbType].length) {
										return foundArbs[marketArbType].map(arb => {
											return `${marketArbType}||${arb.difference}||${arb.outcome1.ex}||${arb.outcome1.market}||${
												arb.outcome1.runner.id
											}||${arb.outcome1.runner.name}||${arb.outcome2.ex}||${arb.outcome2.market}||${arb.outcome2.runner.id}||${
												arb.outcome2.runner.name
											}`
										})
									}
								}
							})
							.filter(market => market && market.length)
					})
					.filter(event => event && event.length)
			)

			if (eventsWithArbs.length) {
				nonConflictingArbs = removeContradictingArbs(eventsWithArbs)

				fundsPerArb = await allocateFundsPerArb(nonConflictingArbs)

				eventsWithArbs.forEach(event => {
					placeArbs(event)
				})
			}
		}
	}
}
