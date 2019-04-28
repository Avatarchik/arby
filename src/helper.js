const { findBestMatch } = require("string-similarity")

function getTrueEventMatch(eventCheck, matches) {
	console.log("here")
}

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
	return exchanges.filter(exchange => {
		return exchange.name !== exchangeBeingChecked.name
	})
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
