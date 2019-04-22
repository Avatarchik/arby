import { MongoClient } from "mongodb"

export async function setDefaults() {
	const mongoClient = await MongoClient.connect(process.env.DB_URL, {
		useNewUrlParser: true
	})
	const db = mongoClient.db(process.env.DB_NAME)

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
