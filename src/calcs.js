import { filter, uniq } from "lodash";
import { findBestMatch } from "string-similarity";
import ArbTable from "../lib/arb-table";
import { isAsianDoubleLine, isAsianSingleLine } from "./helpers";

function getExchangesToCompare(exchanges, exchangeBeingChecked, exchangesChecked) {
	return filter(exchanges, exchange => {
		return exchange.name !== exchangeBeingChecked.name && exchangesChecked.indexOf(exchange.name) <= -1;
	});
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
		return eventToCompare.country.toUpperCase() === eventToCheck.country.toUpperCase();
	}
	return true;
}

function eventTypeMatch(eventToCheck, eventToCompare) {
	return eventToCheck.eventType.toUpperCase() === eventToCompare.eventType.toUpperCase();
}

function checkHandicapsAreSame(market1, market2) {
	let market1Handicap;
	let market2Handicap;

	if (isAsianDoubleLine(market1.name) && isAsianDoubleLine(market2.name)) {
		market1Handicap = market1.name.match(/\(\d?\.\d{1,2}\/[+-]?\d?\.\d{1,2}\)/g);
		market2Handicap = market2.name.match(/\(\d?\.\d{1,2}\/[+-]?\d?\.\d{1,2}\)/g);

		return market1Handicap === market2Handicap;
	} else if (isAsianSingleLine(market1.name, false) && isAsianSingleLine(market2.name, false)) {
		market1Handicap = market1.name.match(/(\(?\d?\.\d{1,2}\)?)/g);
		market2Handicap = market2.name.match(/(\(?\d?\.\d{1,2}\)?)/g);

		return Number(market1Handicap[0]) === Number(market2Handicap[0]);
	}
}

function findSameMarkets(matchedEvent, similarityThreshold) {
	let bestMatchedMarket;
	let marketsOfSameType;
	let matchingMarket;
	let matchedMarkets = [];
	let sameHandicap;

	matchedEvent.event1.markets.forEach(ex1Market => {
		marketsOfSameType = matchedEvent.event2.markets.filter(ex2Market => ex2Market.type === ex1Market.type);

		if (marketsOfSameType.length) {
			bestMatchedMarket = findBestMatch(ex1Market.name.toUpperCase(), marketsOfSameType.map(ex2Market => ex2Market.name.toUpperCase()));

			if (bestMatchedMarket.bestMatch.rating >= similarityThreshold) {
				console.log(`"${ex1Market.name}" matched with "${bestMatchedMarket.bestMatch.target}" @ ${bestMatchedMarket.bestMatch.rating}`);

				matchingMarket = marketsOfSameType.find(market => market.name.toUpperCase() === bestMatchedMarket.bestMatch.target);

				if (ex1Market.type === "HANDICAP" || ex1Market.type === "ASIAN_HANDICAP") {
					sameHandicap = checkHandicapsAreSame(ex1Market, matchingMarket);
				}

				// Would be undefined if not a handicap market so the condition above has not been truthy
				if (sameHandicap === undefined || sameHandicap) {
					matchedMarkets.push({
						market1: ex1Market,
						market2: matchingMarket
					});
				}
				sameHandicap = undefined;
			}
		}
	});
	return matchedMarkets;
}

// function checkQualifictionEvents(exchangesToCompare) {
// 	return exchangesToCompare.filter(exchange => {
// 		return exchange.events.filter(event => {
// 			return event.name.indexOf("To Qualify") > -1;
// 		}).length;
// 	});
// }

function findSameEvents(exchanges) {
	let exchangesToCompare;
	let exchangeToCheck;
	let exchangeToCompare;
	let eventToCheck;
	let matches = [];
	let exchangesChecked = [];
	let eventBestMatch;
	let eventsMatchingCountryAndType;
	let matchingEvent;

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
					console.log("don't think we care about this anymore as not doing anything with competitors");
				} else {
					// Iterate the exchanges that are not this one
					// (This and the iteration above could be swapped around but don't think it makes that much difference to performance)
					for (let k = 0; k < exchangesToCompare.length; k++) {
						exchangeToCompare = exchangesToCompare[k];

						eventsMatchingCountryAndType = exchangeToCompare.events
							.filter(eventToCompare => {
								return countryMatch(eventToCheck, eventToCompare) && eventTypeMatch(eventToCheck, eventToCompare);
							})
							.map(event => event.name);

						if (eventsMatchingCountryAndType && eventsMatchingCountryAndType.length) {
							eventBestMatch = findBestMatch(eventToCheck.name, eventsMatchingCountryAndType);

							if (eventBestMatch.bestMatch.rating >= 0.5) {
								matchingEvent = exchangeToCompare.events.find(event => event.name === eventBestMatch.bestMatch.target);

								matches.push({
									ex1: exchangeToCheck,
									event1: eventToCheck,
									ex2: exchangeToCompare,
									event2: matchingEvent
								});
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

function getSameRunner(runnerToMatch, otherRunners) {
	const match = findBestMatch(runnerToMatch.name, otherRunners.map(runner => runner.name));

	return otherRunners.find(runner => runner.name === match.bestMatch.target);
}

function getPotentialArb(prices, prioritiesTried) {
	const runner1 = prices[0];
	const runner2 = prices[1];

	if (runner1.smallest < runner2.smallest && runner1.smallest <= 2) {
		return {
			...runner1,
			opposingRunner: runner2,
			arb: ArbTable.find(arb => {
				if (prioritiesTried && prioritiesTried.length) {
					return prioritiesTried.indexOf(arb.priority) <= -1 && runner1.smallest <= arb.outcome1;
				}
				return runner1.smallest <= arb.outcome1;
			})
		};
	} else if (runner2.smallest < runner1.smallest && runner2.smallest <= 2) {
		return {
			...runner2,
			opposingRunner: runner1,
			arb: ArbTable.find(arb => {
				if (prioritiesTried && prioritiesTried.length) {
					return prioritiesTried.indexOf(arb.priority) <= -1 && runner1.smallest <= arb.outcome1;
				}
				return runner1.smallest <= arb.outcome1;
			})
		};
	}
}

function getSmallestPrices(runner1, runner2) {
	return [
		{
			id: runner1.id,
			name: runner1.name,
			market: 1,
			smallest: Math.min(...runner1.prices)
		},
		{
			id: runner2.id,
			name: runner2.name,
			market: 2,
			smallest: Math.min(...runner2.prices)
		}
	];
}

function getOpposingRunner(opposingMarket, runnerName) {
	const match = findBestMatch(runnerName, opposingMarket.runners.map(runner => runner.name));

	// Since there are only 2 runners in this scenario, this is a safe calculation
	// to get the runner that does not equal the best match
	return opposingMarket.runners.find(runner => {
		return runner.name !== match.bestMatch.target;
	});
}

function findArb(prices, market, arbPrioritiesTried) {
	// Tested all potential arb outcomes so quit as no arb :(
	if (arbPrioritiesTried && arbPrioritiesTried.length === 9) {
		return {};
	}

	let potentialArb = getPotentialArb(prices, arbPrioritiesTried);
	let runnerNameUsed;
	let opposingMarket;
	let opposingRunner;

	if (potentialArb && potentialArb.arb) {
		runnerNameUsed = potentialArb.name;
		opposingMarket = potentialArb.market === 1 ? market.market2 : market.market1;
		opposingRunner = getOpposingRunner(opposingMarket, runnerNameUsed);

		if (opposingRunner.prices && opposingRunner.prices.length) {
			if (Math.max(...opposingRunner.prices) > potentialArb.arb.outcome2) {
				return potentialArb;
			} else {
				if (arbPrioritiesTried && arbPrioritiesTried.length) {
					return findArb(prices, market, [...arbPrioritiesTried, potentialArb.arb.priority]);
				} else {
					return findArb(prices, market, [potentialArb.arb.priority]);
				}
			}
		}
		// There are no prices (yet) for the opposing runner so may as well quit
		// Is it possible for me to become the 1st price and set the threshold?
		return {};
	}
}

function findArbs(event) {
	let prices;
	let market2Runner;
	let market1Runner;

	return event.matchedMarkets
		.map(market => {
			if (market.market1.runners.length === 2) {
				market1Runner = market.market1.runners[0];
				market2Runner = getSameRunner(market1Runner, market.market2.runners);
				prices = getSmallestPrices(market1Runner, market2Runner);

				// Hmmm...a check for now but is it possible for me to be the 1st price?
				if (market1Runner.prices && market1Runner.prices.length && market2Runner.prices && market2Runner.prices.length) {
					return findArb(prices, market);
				}
				return {};
			} else {
				// TODO
				return {};
			}
		})
		.filter(arb => arb && Object.keys(arb).length);
}

function placeArbs(event) {}

export function matchMarkets(exchangesEvents) {
	const sameEvents = findSameEvents(exchangesEvents);
	const eventsWithMatchedMarkets = sameEvents.map(event => {
		// This threshold (0.6) is quite high considering am also taking the market type into account
		// This is because any lower and Asian Single Lines matched with Asian Double Lines
		// In the future, I could split these into 2 separate market types but for now...no
		return {
			...event,
			matchedMarkets: findSameMarkets(event, 0.6)
		};
	});
	const eventsWithArbs = eventsWithMatchedMarkets
		.map(event => {
			if (event.matchedMarkets.length) {
				return {
					...event,
					arbs: findArbs(event)
				};
			}
			return event;
		})
		.filter(event => event.arbs && event.arbs.length);

	eventsWithArbs.forEach(event => {
		placeArbs(event);
	});
}
