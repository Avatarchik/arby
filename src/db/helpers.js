function getCountry(matchedEvent) {
	const meaningfulCountry = matchedEvent.find(exEvent => {
		return exEvent.event.country !== "-"
	})

	return (meaningfulCountry && meaningfulCountry.country) || "-"
}

exports.storeMatchedEvents = async function(matchedEvents, db) {
	const inserted = await db.collection("events").insertMany(
		matchedEvents.map(matchedEvent => {
			return {
				startTime: matchedEvent[0].event.startTime,
				eventType: matchedEvent[0].event.eventType,
				country: getCountry(matchedEvent),
				exchanges: matchedEvent.map(exEvent => {
					return {
						exchange: exEvent.exchange,
						eventId: exEvent.event.id
					}
				})
			}
		})
	)

	return inserted.ops
}

exports.setDefaults = async function(db) {
	await db.collection("config").deleteMany({}) // Remove all documents from the config collection

	// The Asian Single Line doesn't seem to return anything important...
	// For football, for example, it returns runners such as:
	// - 1 goals or more
	// - 2 goal or more
	//
	// I can already do this using TOTAL types of Under/Over halves or HANDICAP types of Under/Over quarters
	await db.collection("config").insertMany([
		{
			sportsToUse: [
				"Soccer",
				"Tennis",
				"Basketball",
				"Rugby Union",
				"Rugby League",
				"Horse Racing",
				"Golf",
				"Cricket",
				"Baseball",
				"American Football",
				"Snooker",
				"Boxing",
				"Cycling"
			],
			defaultLocale: "en",
			defaultCurrency: "GBP",
			defaultCountryCode: "GB",
			percentageOfBalanceToSave: 0,
			betOnSpread: true,
			betOnOdds: true,
			betOnAsianHandicapSingleLine: true,
			minimumBetSize: 2
		}
	])
}

exports.setExchangeBalance = async function(db, balance, exchange) {
	return await db.collection("config").updateOne(
		{
			sportsToUse: {
				$exists: true
			}
		},
		{
			$set: {
				[`${exchange}Balance`]: balance
			}
		}
	)
}

exports.getConfig = async function(db) {
	return await db
		.collection("config")
		.find({
			sportsToUse: {
				$exists: true
			}
		})
		.toArray()
}
