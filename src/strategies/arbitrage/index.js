const { findBestMatch } = require("string-similarity")
const { MongoClient } = require("mongodb")
const schedule = require("node-schedule")
const cluster = require("cluster")

const BettingApi = require("../../exchanges/betfair/apis/betting")
const AccountsApi = require("../../exchanges/betfair/apis/account")
const { getConfig } = require("../../db/helpers")
const { checkForException, getException } = require("../../exchanges/betfair/exceptions")
const {
	MarketProjection,
	PriceData,
	OrderType,
	Side,
	PersistenceType,
	OrderProjection,
	EventTypes,
	BettingOperations,
	MarketBettingType,
	MatchProjection
} = require("../../../lib/enums/exchanges/betfair/betting")
const { AccountOperations } = require("../../../lib/enums/exchanges/betfair/account")

const BETTING = "Betting"
const ACCOUNT = "Account"

const ArbTable = require("../../../lib/arb-table")

function getExchangesToCompare_findEvents(exchanges, exchangeBeingChecked) {
	return exchanges.filter(exchange => {
		return exchange.name !== exchangeBeingChecked.name
	})
}
function getExchangesToCompare_findMarkets(matchedEvent, exCheckName) {
	return Object.keys(matchedEvent).reduce((acc, exCompareName) => {
		if (exCompareName !== exCheckName) {
			acc[exCompareName] = matchedEvent[exCompareName]
		}
		return acc
	}, {})
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

function startTimeMatch(eventToCheck, eventToCompare) {
	return eventToCheck.startTime === eventToCompare.startTime
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
	let compareMarkets
	let bestMatchedMarket
	let matchingMarket
	let sameHandicap
	let sameNumber

	if (!potentialMarkets.length) {
		// No match :(
		return
	}
	compareMarkets = potentialMarkets.map(compareMarket => compareMarket.name.toUpperCase())
	bestMatchedMarket = findBestMatch(market.name.toUpperCase(), compareMarkets)

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

function getMarketsOfSameType(exchangeToCompare, market) {
	return exchangeToCompare.markets.filter(marketToCompare => {
		return market.type === marketToCompare.type && market.runners.length === marketToCompare.runners.length
	})
}

function findSameMarkets(matchedEvent, similarityThreshold) {
	let marketsOfSameType
	let sameMarket
	let exchangesToCompare
	let marketMatch

	return Object.keys(matchedEvent).reduce((matches, exCheckName) => {
		for (let exCheckMarket of matchedEvent[exCheckName].markets) {
			marketMatch = {
				[exCheckName]: exCheckMarket
			}
			exchangesToCompare = getExchangesToCompare_findMarkets(matchedEvent, exCheckName)

			if (Object.keys(exchangesToCompare).length) {
				for (let exCompare in exchangesToCompare) {
					marketsOfSameType = getMarketsOfSameType(exchangesToCompare[exCompare], exCheckMarket)

					if (marketsOfSameType.length) {
						if (exCheckMarket.name === "Set Betting" || exCheckMarket.name === "WIN" || exCheckMarket.name === "Series Winner") {
							console.log("debug")
						}
						sameMarket = findSameMarket(marketsOfSameType, exCheckMarket, similarityThreshold)

						if (sameMarket) {
							marketMatch[exCompare] = sameMarket

							matchedEvent[exCheckName].markets = matchedEvent[exCheckName].markets.filter(market => {
								return market.id !== exCheckMarket.id
							})
							matchedEvent[exCompare].markets = matchedEvent[exCompare].markets.filter(market => {
								return market.id !== sameMarket.id
							})
						}
					}
				}
				if (Object.keys(marketMatch).length > 1) {
					matches.push(marketMatch)
				}
			}
		}
		return matches
	}, [])
}

// function checkQualifictionEvents(exchangesToCompare) {
// 	return exchangesToCompare.filter(exchange => {
// 		return exchange.events.filter(event => {
// 			return event.name.indexOf("To Qualify") > -1;
// 		}).length;
// 	});
// }

function filterEventsMatchingCriteria(compareEx, eventToCheck) {
	return compareEx.events
		.filter(eventToCompare => {
			return (
				countryMatch(eventToCheck, eventToCompare) &&
				eventTypeMatch(eventToCheck, eventToCompare) &&
				startTimeMatch(eventToCheck, eventToCompare)
			)
		})
		.map(event => event.name)
}

function getTrueEventMatch(eventCheck, matches) {
	console.log("here")
}

function findSameEvents(exchanges) {
	let exchangesToCompare
	let eventRatings
	let eventsMatchingCriteria
	let matchingEvent
	let alternateMatches
	let trueEventMatch
	let eventMatch = []

	try {
		console.time("findSameEvents")
		return exchanges.reduce((matches, exchangeToCheck) => {
			exchangesToCompare = getExchangesToCompare_findEvents(exchanges, exchangeToCheck)

			if (exchangesToCompare.length) {
				for (let eventToCheck of exchangeToCheck.events) {
					eventMatch = [
						{
							exchange: exchangeToCheck.name,
							event: eventToCheck
						}
					]

					if (!eventToCheck.name.includes("(Best of 7)")) {
						for (let exchangeToCompare of exchangesToCompare) {
							eventsMatchingCriteria = filterEventsMatchingCriteria(exchangeToCompare, eventToCheck)

							if (eventsMatchingCriteria && eventsMatchingCriteria.length) {
								eventRatings = findBestMatch(eventToCheck.name, eventsMatchingCriteria)

								if (eventRatings.bestMatch.rating >= 0.3) {
									alternateMatches = eventRatings.ratings.filter(rating => {
										const lowerBoundary = eventRatings.bestMatch.rating - eventRatings.bestMatch.rating / 10

										return rating.rating > lowerBoundary && rating.target !== eventRatings.bestMatch.target
									})
									if (alternateMatches.length) {
										trueEventMatch = getTrueEventMatch(eventToCheck.name, [...alternateMatches, eventRatings.bestMatch.target])
									}
									matchingEvent = exchangeToCompare.events.find(event => {
										return event.name === (trueEventMatch || eventRatings.bestMatch.target)
									})

									eventMatch.push({
										exchange: exchangeToCompare.name,
										event: matchingEvent
									})
									exchangeToCompare.events = exchangeToCompare.events.filter(event => event.id !== matchingEvent.id)
									exchangeToCheck.events = exchangeToCheck.events.filter(event => event.id !== eventToCheck.id)
								} else {
									console.log(
										`"${eventToCheck.name}" DID NOT MATCH WITH "${eventRatings.bestMatch.target}" @ ${
											eventRatings.bestMatch.rating
										}`
									)
								}
							}
						}
						if (eventMatch.length > 1) {
							matches.push(eventMatch)
						}
					}
				}
				return matches
			}
		}, [])
	} catch (err) {
		console.error(err)
	}
}

function getSameRunner(marketCompare, runnerName) {
	const match = findBestMatch(
		runnerName.toUpperCase(),
		marketCompare.runners.map(runner => {
			return runner.name.toUpperCase()
		})
	)

	return marketCompare.runners.find(runner => {
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

function getPotentialArb(market, runners) {
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

function buildBackLayArb(market, runners, layMarketExchange) {
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
	return smallestLayPrice < largestBackPrice
		? {
				difference: largestBackPrice - smallestLayPrice,
				outcome2: {
					runner: {
						id: layRunner.id,
						name: layRunner.name,
						...(layRunner.handicap && { handicap: layRunner.handicap }),
						price: Math.min(...layRunner.prices.lay)
					},
					market: market[layMarketExchange].id,
					ex: layMarketExchange
				},
				outcome1: {
					runner: {
						id: backRunner.id,
						name: backRunner.name,
						...(backRunner.handicap && { handicap: backRunner.handicap }),
						price: Math.max(...backRunner.prices.back)
					},
					market: market[layMarketExchange].id,
					ex: layMarketExchange
				}
		  }
		: undefined
}

function getBestBackLayArb(exchangesToCompare, market, runner, exName, competingArbs) {
	const exCompareName = Object.keys(exchangesToCompare)[0]
	const compareRunner = getSameRunner(market[exCompareName], runner.name)

	let runnerSmallestLay
	let compareRunnerSmallestLay
	let backLayArb
	let remainingArbs

	// TODO: Because I am betting on an exchange, I can choose the price to buy/sell at
	// The obvious idea would be to set prices giving me a best arb with higher differences between the runners
	// Therefore increasing my income
	// However, betters will probably not bite at this so there needs to be some cool stuff to watch the markets
	// Yay... this is going to be hella fun!!!!
	if (runner.prices.back.length && compareRunner.prices.lay.length && runner.prices.lay.length && compareRunner.prices.back.length) {
		runnerSmallestLay = Math.min(...runner.prices.lay)
		compareRunnerSmallestLay = Math.min(...compareRunner.prices.lay)

		backLayArb =
			runnerSmallestLay <= compareRunnerSmallestLay
				? buildBackLayArb(market, [runner, compareRunner], exName)
				: buildBackLayArb(market, [compareRunner, runner], exCompareName)

		remainingArbs = Object.keys(exchangesToCompare).reduce((acc, exCompare) => {
			if (exCompare !== exCompareName) {
				acc[exCompare] = exchangesToCompare[exCompare]
			}
			return acc
		}, {})

		if (backLayArb) {
			competingArbs.push(backLayArb)
		}

		if (Object.keys(remainingArbs).length) {
			getBestBackLayArb(remainingArbs, market, runner, [...competingArbs, backLayArb])
		}

		if (competingArbs.length) {
			return competingArbs.length > 1 ? competingArbs.sort((a, b) => b.difference - a.difference)[0] : competingArbs[0]
		}
		// No arb :(
	}
}

function findArbs_BackLay(market) {
	let exchangesToCompare
	let bestBackLayArb

	return Object.keys(market).reduce((backLayArbs, exName) => {
		exchangesToCompare = getExchangesToCompare_findMarkets(market, exName)

		if (Object.keys(exchangesToCompare).length) {
			if (market[exName].runners.length) {
				for (let runner of market[exName].runners) {
					bestBackLayArb = getBestBackLayArb(exchangesToCompare, market, runner, exName, [])

					if (bestBackLayArb) {
						backLayArbs.push(bestBackLayArb)
					}
				}
			}
		}
		return backLayArbs
	}, [])
}

function findArbs_BackBack(market, runners, foundArbs) {
	let market1Runner
	let market2Runner
	let potentialArb

	if (runners.length) {
		market1Runner = runners[0]
		market2Runner = getOpposingRunner(market1Runner.name, market.market2.runners)

		// Again...there are no prices already so pointless going further than this
		// Worth investigating whether I could set the 1st price? Probably...
		if (market1Runner.prices.back.length && market2Runner.prices.back.length) {
			potentialArb = getPotentialArb(market, [market1Runner, market2Runner])

			if (potentialArb) {
				if (!potentialArb.arb) {
					return findArbs_BackBack(market, runners, foundArbs)
				}
				foundArbs.push(buildBackBackArb(potentialArb))
			}
		}
		runners.splice(market1Runner, 1)

		return findArbs_BackBack(market, runners, foundArbs, [])
	}
	return foundArbs && foundArbs.length ? foundArbs : []
}

function findArbs(market) {
	const isTwoRunnerMarket = Object.keys(market).every(m => {
		return market[m].runners.length === 2
	})

	if (isTwoRunnerMarket) {
		return {
			BackBack: findArbs_BackBack(market, [])
		}
	}
	return {
		BackLay: findArbs_BackLay(market, [])
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

function setUpSchedules(matchedEvents) {
	let worker

	for (let matchedEvent of matchedEvents) {
		schedule.scheduleJob(new Date(matchedEvent.startTime), () => {
			worker = cluster.fork({
				workerId: matchedEvent._id.toString(),
				country: matchedEvent.country,
				eventType: matchedEvent.eventType,
				exchanges: JSON.stringify(matchedEvent.exchanges),
				startTime: matchedEvent.startTime
			})
		})
	}
}

exports.initArbitrage = async function(exchangesEvents) {
	const matchedEvents = findSameEvents(exchangesEvents)

	let eventsWithMatchedMarkets
	let eventsWithArbs
	let nonConflictingArbs
	let foundArbs
	let marketArbType
	let fundsPerArb
	let allMarketsHaveRunners
	let hasTwoOrLessRunners
	let formattedMatchedEvents
	let storedEvents

	try {
		if (matchedEvents.length) {
			formattedMatchedEvents = matchedEvents.map(matchedEvent => {
				return {
					startTime: matchedEvent[0].event.startTime,
					eventType: matchedEvent[0].event.eventType,
					country: matchedEvent.find(exEvent => exEvent.event.country !== "-").event.country,
					exchanges: matchedEvent.map(exEvent => {
						return {
							exchange: exEvent.exchange,
							eventId: exEvent.event.id
						}
					})
				}
			})

			storedEvents = await storeMatchedEvents(formattedMatchedEvents)
			return storedEvents

			// eventsWithMatchedMarkets = matchedEvents
			// 	.map(event => {
			// 		// This threshold (0.6) is quite high considering am also taking the market type into account
			// 		// This is because any lower and Asian Single Lines matched with Asian Double Lines
			// 		// In the future, I could split these into 2 separate market types but for now...no
			// 		return {
			// 			...event,
			// 			matchedMarkets: findSameMarkets(event, 0.6)
			// 		}
			// 	})

			// if (eventsWithMatchedMarkets.length) {
			// 	eventsWithArbs = flattenDeep(
			// 		eventsWithMatchedMarkets
			// 			.map(event => {
			// 				return event.matchedMarkets
			// 					.map(market => {
			// 						allMarketsHaveRunners = Object.keys(market).every(m => {
			// 							return market[m].runners.length
			// 						})

			// 						if (allMarketsHaveRunners) {
			// 							hasTwoOrLessRunners = Object.keys(market).every(m => {
			// 								return market[m].runners.length <= 2
			// 							})
			// 							foundArbs = findArbs(market, Object.keys(market))
			// 							marketArbType = hasTwoOrLessRunners ? "BackBack" : "BackLay"

			// 							if (foundArbs[marketArbType].length) {
			// 								return foundArbs[marketArbType].map(arb => {
			// 									return `${marketArbType}||${arb.difference}||${arb.outcome1.ex}||${arb.outcome1.market}||${
			// 										arb.outcome1.runner.id
			// 										}||${arb.outcome1.runner.name}||${arb.outcome2.ex}||${arb.outcome2.market}||${arb.outcome2.runner.id}||${
			// 										arb.outcome2.runner.name
			// 										}`
			// 								})
			// 							}
			// 						}
			// 					})
			// 					.filter(market => market && market.length)
			// 			})
			// 			.filter(event => event && event.length)
			// 	)

			// 	if (eventsWithArbs.length) {
			// 		nonConflictingArbs = removeContradictingArbs(eventsWithArbs)

			// 		fundsPerArb = await allocateFundsPerArb(nonConflictingArbs)

			// 		eventsWithArbs.forEach(event => {
			// 			placeArbs(event)
			// 		})
			// }
		}
	} catch (err) {
		console.error(err)
	}
}

async function getMarketCatalogues(db, bettingApi) {
	const type = BETTING
	const funcName = getMarketCatalogues.name

	let params = {
		filter: {
			eventIds: [
				JSON.parse(process.env.EXCHANGES)
					.find(exchange => {
						return exchange.name === "betfair"
					})
					.id.toString()
			]
		},
		marketProjection: [
			MarketProjection.EVENT_TYPE.val,
			MarketProjection.EVENT.val,
			MarketProjection.MARKET_START_TIME.val,
			MarketProjection.MARKET_DESCRIPTION.val,
			MarketProjection.RUNNER_DESCRIPTION.val
		],
		maxResults: 1000
	}
	let response
	let config

	try {
		config = await getConfig(db)
		params.filter.marketBettingTypes = [
			...(config[0].betOnOdds ? [MarketBettingType.ODDS.val] : []),
			...(config[0].betOnSpread ? [MarketBettingType.LINE.val] : []),
			...(config[0].betOnAsianHandicapSingleLine ? [MarketBettingType.ASIAN_HANDICAP_SINGLE_LINE.val] : []),
			...(config[0].betOnAsianHandicapDoubleLine ? [MarketBettingType.ASIAN_HANDICAP_DOUBLE_LINE.val] : [])
		]

		response = await bettingApi.listMarketCatalogue(params)

		checkForException(response, BettingOperations.LIST_MARKET_CATALOGUE, type)

		return response.data.result
	} catch (err) {
		switch (err.code) {
			case "TOO_MUCH_DATA":
				return getMarketCatalogues(db)
			default:
				throw getException({
					err,
					params,
					type,
					funcName
				})
		}
	}
}

async function getMarketBooks(db, catalogues, bettingApi) {
	const type = BETTING
	const funcName = getMarketBooks.name

	const params = {
		marketIds: catalogues.map(catalogue => catalogue.marketId),
		priceProjection: {
			priceData: [PriceData.EX_BEST_OFFERS.val]
		},
		orderProjection: OrderProjection.EXECUTABLE.val,
		matchProjection: MatchProjection.ROLLED_UP_BY_AVG_PRICE.val
	}
	let response

	try {
		response = await bettingApi.listMarketBook(params)

		checkForException(response, BettingOperations.LIST_MARKET_BOOK, type)
		return response.data.result
	} catch (err) {
		throw getException({
			err,
			params,
			type,
			funcName
		})
	}
}

const getMarketFuncs = {
	getMarkets_matchbook,
	getMarkets_betfair
}

async function getMarkets_betfair(db) {
	const bettingApi = new BettingApi()
	const marketCatalogues = await getMarketCatalogues(db, bettingApi)
	const marketBooks = await getMarketBooks(db, marketCatalogues, bettingApi)
}

async function getMarkets_matchbook() {
	console.log("here")
}

async function initInterval(exchanges, db) {
	await Promise.all(
		exchanges.map(async exchangeName => {
			await getMarketFuncs[`getMarkets_${exchangeName}`](db)
		}, this)
	)
}

exports.watchEvent = function(db) {
	const exchangesInvolved = JSON.parse(process.env.EXCHANGES).map(ex => ex.exchange)

	setInterval(initInterval.bind(this)(exchangesInvolved, db), 300000) // Poll the exchanges every 5 minutes
}
