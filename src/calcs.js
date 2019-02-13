import { forEach, clone, find, filter, uniq } from "lodash";
import { compareTwoStrings, findBestMatch } from "string-similarity";
import fs from "fs";

/**
 * As this has 4 iterations it can be confusing...
 *
 * Iteration 1 = Iterate all the exchange events (call this 'exchangeChecking')
 * Iteration 2 = Iterate the events of the exchange you are checking
 * Iteration 3 = Iterate the exchanges that are not the one currently being checked (call this 'exchangeComparing')
 * Iteration 4 = Iterate the events of the exchange you are comparing
 *
 * The result is the you iterate over ONE exchange. Per exchange, you iterate over all the events. Per event, you iterate over the other exchanges
 * and per exchange, you iterate over all of those events
 * @param {*} exchangesEvents
 */

function getExchangesToCompare(exchanges, exchangeBeingChecked, exchangesChecked) {
	return filter(exchanges, exchange => {
		return exchange.name !== exchangeBeingChecked.name && exchangesChecked.indexOf(exchange.name) <= -1;
	});
}

function teamMatch(eventToCheck, eventToCompare, similarityThreshold) {
	let bestMatchedTeam;

	try {
		return eventToCheck.competitors.every(competitorToCheck => {
			bestMatchedTeam = findBestMatch(competitorToCheck, eventToCompare.competitors);

			return bestMatchedTeam.bestMatch.rating >= similarityThreshold;
		});
	} catch (err) {
		console.error(err);
	}
}

function countryMatch(eventToCheck, eventToCompare) {
	// The results returned for countries are not reliable so, unless both exchanges have a country code linked to the event, check them
	if (eventToCheck.country !== "-" && eventToCompare.country !== "-") {
		return eventToCompare.country.toUpperCase() === eventToCheck.country.toUpperCase();
	}
	return true;
}

function eventTypeMatch(eventToCheck, eventToCompare) {
	return eventToCheck.eventType.toUpperCase() === eventToCompare.eventType.toUpperCase();
}

function teamMatch(eventToCheck, eventToCompare, similarityThreshold) {
	let bestMatchedTeam;

	try {
		return eventToCheck.competitors.every(competitorToCheck => {
			bestMatchedTeam = findBestMatch(competitorToCheck, eventToCompare.competitors);

			return bestMatchedTeam.bestMatch.rating >= similarityThreshold;
		});
	} catch (err) {
		console.error(err);
	}
}

function findSameMarkets(matchedEvent, exchanges, similarityThreshold) {
	const eventSections = matchedEvent.split("|");
	const exchange1 = exchanges.find(exchange => exchange.name === eventSections[0]);
	const exchange1event = exchange1.events.find(event => {
		return event.name === eventSections[1] && String(event.id) === eventSections[2];
	});
	const exchange2 = exchanges.find(exchange => exchange.name === eventSections[3]);
	const exchange2event = exchange2.events.find(event => {
		return event.name === eventSections[4] && event.id === eventSections[5];
	});

	let bestMatchedMarket;

	exchange1event.markets.forEach(ex1Market => {
		bestMatchedMarket = findBestMatch(ex1Market.name, exchange2event.markets.map(ex2Market => ex2Market.name));

		if (bestMatchedTeam.bestMatch.rating >= similarityThreshold) {
			console.log(`${ex1Market.name} matched with ${bestMatchedMarket.bestMatch.target} with a score of ${bestMatchedMarket.bestMatch.rating}`);
		}

		// return (bestMatchedTeam.bestMatch.rating >= similarityThreshold);
	});
}

function checkQualifictionEvents(exchangesToCompare) {
	return exchangesToCompare.filter(exchange => {
		return exchange.events.filter(event => {
			return event.name.indexOf("To Qualify") > -1;
		}).length;
	});
}

function findSameEvents(exchanges) {
	let exchangesToCompare;
	let exchangeToCheck;
	let exchangeToCompare;
	let eventToCheck;
	let eventToCompare;
	let matches = [];
	let match;
	let exchangesChecked = [];

	console.time("findSameEvents");
	for (let i = 0; i < exchanges.length; i++) {
		exchangesToCompare = getExchangesToCompare(exchanges, exchanges[i], exchangesChecked);
		exchangesChecked.push(exchanges[i].name);
		exchangeToCheck = exchanges[i];

		if (exchangesToCompare.length) {
			// Iterate the events of the exchange you are checking
			for (let j = 0; j < exchanges[i].events.length; j++) {
				eventToCheck = exchanges[i].events[j];

				if (eventToCheck.name.indexOf("To Qualify") > -1) {
					// checkQualifictionEvents(exchangesToCompare);
				} else {
					// Iterate the exchanges that are not this one
					// (This and the iteration above could be swapped around but don't think it makes that much difference to performance)
					for (let k = 0; k < exchangesToCompare.length; k++) {
						exchangeToCompare = exchangesToCompare[k];

						// Iterate the events of the exchange you are comparing

						for (let l = 0; l < exchangesToCompare[k].events.length; l++) {
							eventToCompare = exchangesToCompare[k].events[l];

							if (countryMatch(eventToCheck, eventToCompare) && eventTypeMatch(eventToCheck, eventToCompare)) {
								switch (eventToCheck.eventType) {
									case "Soccer":
									case "Tennis":
									case "Basketball":
										if (eventToCheck.competitors.length && eventToCompare.competitors.length) {
											match = teamMatch(eventToCheck, eventToCompare, 0.2);
										}
								}

								if (match) {
									matches.push(
										`${exchangeToCheck.name}|${eventToCheck.name}|${eventToCheck.id}|${exchangeToCompare.name}|${
											eventToCompare.name
										}|${eventToCompare.id}`
									);
								}
								match = false;
							}
						}
					}
				}
			}
		}
	}
	console.timeEnd("findSameEvents");
	return uniq(matches);
}

export function matchMarkets(exchangesEvents) {
	const sameEvents = findSameEvents(exchangesEvents);

	fs.writeFileSync("comparison.json", JSON.stringify(sameEvents));
	let sameMarkets;

	sameEvents.forEach(event => {
		sameMarkets = findSameMarkets(event, exchangesEvents, 0.7);
	});
	/**
	 * 1. Find same events
	 * 2. Iterate over events and find same markets
	 */
	// let exchangesCompared = [];
	// let eventsNotThisExchange;
	// let sameEventsFound = {};
	// let matchName;

	// for (let i = 0; i < exchangesEvents.length; i++) {
	//     eventsNotThisExchange = filter(exchangesEvents, (events) => events.name !== exchangesEvents[i].name);

	//     for (let j = 0; j < eventsNotThisExchange.length; j++) {
	//         matchName = `${exchangesEvents[i].name}/${eventsNotThisExchange[j].name}`
	//         exchangesCompared.push(matchName);

	//         for (let k = 0; k < eventsNotThisExchange[j].events; k++) {
	//             sameEventsFound[matchName] = filter()
	//         }
	//     }
	// }
}
