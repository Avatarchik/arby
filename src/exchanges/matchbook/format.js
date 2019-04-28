const { getCode, overwrite } = require("country-list")
const { flatten } = require("lodash")

const countryListOverrides = require("../../../lib/country-list-overrides")
const MarketTypes = require("../../../lib/enums/marketTypes")

overwrite(countryListOverrides)

// function getAsianFullLineHandicap(name) {
// 	const match = name.match(/(\(?[+-]?\d\.?[0-0]{1}?\)?)/)

// 	if (match && match.length) {
// 		return parseFloat(match[0])
// 	}
// 	return "Something is wrong..."
// }

// function getAsianQuarterLineHandicap(name) {
// 	const match = name.match(/\([+-]?\d?\.\d{1,2}\/[+-]?\d?\.\d{1,2}\)/)

// 	let handicaps
// 	let parsedHandicaps

// 	if (match && match.length) {
// 		handicaps = match[0].substring(1, match[0].indexOf(")")).split("/")
// 		parsedHandicaps = handicaps.map(handicap => parseFloat(handicap))
// 		parsedHandicaps[1] = parsedHandicaps[0] < 0 ? -parsedHandicaps[1] : parsedHandicaps[1]

// 		return (parsedHandicaps[0] + parsedHandicaps[1]) / 2
// 	}
// 	return "Something went wrong..."
// }

// function getAsianHalfLineHandicap(name) {
// 	const match = name.match(/(\(?[+-]?\d?\.[5-5]\)?)/g)

// 	if (match && match.length) {
// 		return parseFloat(match[0])
// 	}
// 	return "Something is wrong..."
// }

// function getRunnerHandicap(market, name) {
// 	if (market.runners.length === 2) {
// 		if (isAsianQuarterLine(name)) {
// 			return getAsianQuarterLineHandicap(name)
// 		}
// 		if (isAsianFullLine(name)) {
// 			return getAsianFullLineHandicap(name)
// 		}

// 		if (isAsianHalfLine(name, true)) {
// 			return isUnderOverMarket(market) ? 0 : getAsianHalfLineHandicap(name)
// 		}
// 	}
// 	return 0
// }

// // - (+1)
// // - -2.0
// // - +3
// function isAsianFullLine(name) {
// 	return new RegExp(/(\(?[+-]?\d\.?[0-0]{1}?\)?)/).test(name)
// }

// // (+1.5)
// // .5
// // -1.5
// function isAsianHalfLine(name, isRunner) {
// 	const match = name.match(/(\(?[+-]?\d?\.[5-5]\)?)/g)

// 	// An Asian Double Line market would match twice...
// 	// A runner will only have the handicap for 1 team whereas a
// 	// market name (which can also be passed), has the handicap
// 	// for both teams so have to increment the number of matches to suit
// 	if (isRunner) {
// 		return match ? match.length === 1 : false
// 	} else {
// 		return match ? match.length === 2 : false
// 	}
// }

// // (.5/.75)
// // (1.5/2.0)
// // (+.75/1.0)
// function isAsianQuarterLine(name) {
// 	return new RegExp(/\([+-]?\d?\.\d{1,2}\/[+-]?\d?\.\d{1,2}\)/).test(name)
// }

// function isUnderOverMarket(market) {
// 	return market.runners[0].name.toUpperCase().includes("OVER") || market.runners[0].name.toUpperCase().includes("UNDER")
// }

// function getMarketType(market) {
// 	const runnerToTest = market.runners[0].name

// 	let actual

// 	// There are some exceptions where going off the type of the market is not strictly accurate
// 	// In this case below, the type here is 'money-line' even though it is clearly an Outright
// 	if (market.name === "Series Winner" || market.name === "Set Betting") {
// 		return "OUTRIGHT"
// 	}
// 	if (market.runners.length === 2) {
// 		if (isAsianQuarterLine(runnerToTest)) {
// 			return "QUARTER_LINE_ASIAN_HANDICAP"
// 		}

// 		if (isAsianFullLine(runnerToTest)) {
// 			return "FULL_LINE_ASIAN_HANDICAP"
// 		}

// 		if (isAsianHalfLine(runnerToTest, true)) {
// 			// Under/Over markets don't have half lines, they sub that for TOTAL_SCORE in my case
// 			// I guess this could change...
// 			return isUnderOverMarket(market) ? "TOTAL_SCORE" : "HALF_LINE_ASIAN_HANDICAP"
// 		}
// 	}
// 	actual = MarketTypes.find(type => market["market-type"].toUpperCase() === type.actualType)

// 	if (actual) {
// 		return actual.actualType
// 	}

// 	actual = MarketTypes.find(type => {
// 		return type.potentialTypes.includes(market["market-type"].toUpperCase())
// 	})

// 	if (actual) {
// 		return actual.actualType
// 	}
// 	return market["market-type"] ? market["market-type"].toUpperCase() : "-"
// }

// function getMarketName(market) {
// 	const nameToUse = market.name
// 	const typeToUse = market.type

// 	if (typeToUse.toUpperCase() === "BINARY" && isUnderOverMarket(market)) {
// 		// Matchbook don't seem to give any other over/under markets other than for goals...
// 		return `${nameToUse} - Points`
// 	}
// 	return nameToUse.includes("BTTS") ? "Match Odds and Both Teams To Score" : nameToUse
// }

// function formatMarkets(markets) {
// 	return flatten(
// 		markets.map(market => {
// 			switch (market["market-type"]) {
// 				case "total":
// 					if (isUnderOverMarket(market)) {
// 						// The line below is bloody dreadful...
// 						// If was a quarter line, the RegExp removed the leading '(' so put it back in...
// 						return {
// 							...market,
// 							name: `Over/Under ${isAsianQuarterLine(market.runners[0].name) ? "(" : ""}${market.runners[0].name.replace(/^\D+/g, "")}`
// 						}
// 					} else {
// 						console.log("debug")
// 					}
// 					break
// 				case "handicap":
// 					return {
// 						...market,
// 						name: market.runners.map(runner => runner.name).join("/")
// 					}
// 				default:
// 					return market
// 			}
// 		})
// 	)
// }

exports.buildFormattedEvents = function(events) {
	try {
		return events.map(event => {
			const metaTags = event["meta-tags"]
			const countryTag = metaTags.find(tag => tag.type === "COUNTRY")
			const eventTypeTag = metaTags.find(tag => tag.type === "SPORT")

			return {
				id: event.id || "-",
				name: event.name || "-",
				startTime: event.start,
				eventType: eventTypeTag ? eventTypeTag.name : "-",
				country: countryTag ? getCode(countryTag.name) : "-"
				// markets: formatMarkets(event.markets).map(market => {
				// 	return {
				// 		id: market.id || "-",
				// 		name: getMarketName(market),
				// 		type: getMarketType(market),
				// 		runners: market.runners.map(runner => {
				// 			return {
				// 				id: runner.id || "-",
				// 				name: runner.name || "-",
				// 				handicap: getRunnerHandicap(market, runner.name),
				// 				prices: {
				// 					back: runner.prices.filter(price => price.side === "back").map(price => price.odds),
				// 					lay: runner.prices.filter(price => price.side === "lay").map(price => price.odds)
				// 				}
				// 			}
				// 		})
				// 	}
				// })
			}
		})
		// .filter(event => event.markets && event.markets.length)
	} catch (err) {
		console.error(err)
	}
}
