const { mapValues, values, groupBy, flatten } = require("lodash")

const MarketTypes = require("../../../lib/enums/marketTypes")

function getMarketType(market) {
	let actual
	let handicapMod

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
		return type.potentialTypes.includes(market.description.marketType)
	})

	return actual ? actual.actualType : market.description.marketType || "-"
}

function getMarketName(market, type, handicaps) {
	const marketName = market.marketName
	const marketType = market.description.marketType

	// Yes...I am well aware that handicaps are doing this check twice but was necessary to merge the functions...
	if (marketType.includes("OVER_UNDER")) {
		if (marketName.toUpperCase().includes("CORNERS")) {
			if (type === "handicap") {
				return `Over/Under (${handicaps.lower.toFixed(1)}/${handicaps.upper.toFixed(1)}) - Corners`
			}
			return `${marketName.substring(marketName.indexOf("Corners ") + 8, marketName.length)} - Corners`
		}
		if (marketName.toUpperCase().includes("CARDS")) {
			if (type === "handicap") {
				return `Over/Under (${handicaps.lower.toFixed(1)}/${handicaps.upper.toFixed(1)}) - Cards`
			}
			return `${marketName.substring(marketName.indexOf("Cards ") + 6, marketName.length)} - Cards`
		}
		if (marketName.toUpperCase().includes("GOALS")) {
			if (type === "handicap") {
				return `Over/Under (${handicaps.lower.toFixed(1)}/${handicaps.upper.toFixed(1)}) - Goals`
			}
			return `${marketName.substring(0, marketName.indexOf(" Goals"))} - Goals`
		}
		console.log("don't know what this is...")
	}
	return marketName
}

function getHandicapMarketName(market, runners, mainMarketType) {
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
		if (market.description.marketType.includes("OVER_UNDER")) {
			return getMarketName(market, "handicap", {
				lower: r0Lower,
				upper: r0Upper
			})
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

		return `${r0name} ${r0HandicapName}/${r1name} ${r1HandicapName}`
	}

	// For any sport, the mainMarketName is NOT the handicap market that Betfair gives us
	// Therefore, this condition is truthy for handicap markets
	if (market.description.marketType !== mainMarketType) {
		return `${r0name} ${posR0 ? "+" : ""}${r0Handicap.toFixed(1)}/${r1name} ${posR1 ? "+" : ""}${r1Handicap.toFixed(1)}`
	}
	return `${r0name}/${r1name} ${r0Handicap.toFixed(1)}`
}

function getFormattedHandicapMarket(market, runners, mainMarketType) {
	// The reason 'eventType' & 'description' are how they are is because I need to structure of the market to be the same as
	// markets that have not been altered as I want to access these properties the same way
	return {
		marketId: market.marketId,
		marketName: getHandicapMarketName(market, runners, mainMarketType),
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

function formatAsianHandicapMarkets_soccer(market, aRunner) {
	// There are only 2 market types in Football that are of market type Asian Handicap Double Line
	//
	// - ALT_TOTAL_GOALS
	// - ASIAN_HANDICAP
	let bRunner

	bRunner = market.runners.find(runner => {
		return market.description.marketType === "ALT_TOTAL_GOALS"
			? runner.handicap === aRunner.handicap && runner.selectionId !== aRunner.selectionId
			: runner.handicap === -aRunner.handicap && runner.selectionId !== aRunner.selectionId
	})

	if (bRunner) {
		// Removed from the array so there are no duplicate entries of markets
		market.runners.splice(market.runners.indexOf(bRunner), 1)

		return getFormattedHandicapMarket(market, [aRunner, bRunner], "ALT_TOTAL_GOALS")
	} else {
		console.log("elsing")
		// TODO: Should never get here but do need to have exception handling here
	}
}

function formatAsianHandicapMarkets_combinedTotal(market, aRunner) {
	// For all sports coming to this function, there are only 2 market types that are of Asian Handicap, which are:
	//
	// - COMBINED_TOTAL
	// - HANDICAP
	let bRunner

	bRunner = market.runners.find(runner => {
		return market.description.marketType === "COMBINED_TOTAL"
			? runner.handicap === aRunner.handicap && runner.selectionId !== aRunner.selectionId
			: runner.handicap === -aRunner.handicap && runner.selectionId !== aRunner.selectionId
	})

	if (bRunner) {
		// Removed from the array so there are no duplicate entries of markets
		market.runners.splice(market.runners.indexOf(bRunner), 1)

		return getFormattedHandicapMarket(market, [aRunner, bRunner], "COMBINED_TOTAL")
	} else {
		console.log("why you here?!")
		// TODO: Should never get here but do need to have exception handling here
	}
}

function formatAsianHandicapMarkets(market) {
	return market.runners
		.map(runner => {
			switch (market.eventType.name) {
				case "Soccer":
					return formatAsianHandicapMarkets_soccer(market, runner)
				case "Tennis":
				case "Basketball":
				case "Rugby Union":
				case "Snooker":
				case "Baseball":
					return formatAsianHandicapMarkets_combinedTotal(market, runner)
				default:
					console.log(`"${market.eventType.name}" with "${market.description.marketType}"`)
			}
		})
		.filter(market => market)
}

function formatMarkets(markets) {
	return flatten(
		markets.map(market => {
			if (market.description.bettingType === "ASIAN_HANDICAP_DOUBLE_LINE") {
				return formatAsianHandicapMarkets(market)
			}
			return [market]
		})
	)
}

exports.buildFormattedEvents = function(catalogues, books) {
	const groupByEventId = groupBy(catalogues, catalogue => catalogue.event.id)

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
				markets: formatMarkets(markets).map(market => {
					marketBook = books.find(book => book.marketId === market.marketId)

					return {
						id: market.marketId || "-",
						name: getMarketName(market),
						type: getMarketType(market),
						runners: market.runners.map(runner => {
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
