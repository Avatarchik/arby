const { findBestMatch } = require("string-similarity")

function getTrueEventMatch(eventCheck, matches) {
	console.log("here")
}

function countryMatch(eventToCheck, eventToCompare) {
	// The results returned for countries are not reliable so, unless both exchanges have a country code linked to the event, check them
	if (eventToCheck.country !== "-" && eventToCompare.country !== "-") {
		if (!eventToCheck.country || !eventToCompare.country) {
			console.log("debug")
		}
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

function getExchangesToCompare_findEvents(exchanges, exchangeBeingChecked) {
	return exchanges.filter(ex => {
		return ex.exchange !== exchangeBeingChecked.exchange
	})
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

function getMarketsOfSameType(exchangeToCompare, market) {
	return exchangeToCompare.markets.filter(marketToCompare => {
		return market.type === marketToCompare.type && market.runners.length === marketToCompare.runners.length
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

exports.findSameEvents = function(exchanges) {
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
							exchange: exchangeToCheck.exchange,
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
										exchange: exchangeToCompare.exchange,
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

exports.findSameMarkets = function(markets) {
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
