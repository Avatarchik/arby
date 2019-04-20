import asyncRedis from "async-redis"

const client = asyncRedis.createClient()

client.on("error", err => {
	console.error("Error: ", err)
})

export async function setDefaults() {
	// "Horse Racing",
	// "Tennis",
	// "Basketball"
	// "Rugby Union",
	// "Rugby League"
	// "Golf",
	// "Cricket",
	// "Baseball",
	// "American Football",
	// "Snooker",
	// "Boxing",
	// "Cycling"

	await client.set("sportsToUse", JSON.stringify(["Soccer"]))
	await client.set("defaultLocale", "en")
	await client.set("defaultCurrency", "GBP")
	await client.set("defaultCountryCode", "GB")
	await client.set("percentageOfBalanceToSave", "0")
	// The Asian Single Line doesn't seem to return anything important...
	// For football, for example, it returns runners such as:
	// - 1 goals or more
	// - 2 goal or more
	//
	// I can already do this using TOTAL types of Under/Over halves or HANDICAP types of Under/Over quarters
	await client.set("betOnAsianHandicapSingleLine", "true")
	await client.set("betOnAsianHandicapDoubleLine", "true")
	await client.set("betOnOdds", "true")
	await client.set("betOnSpread", "true")
	await client.set("minimumBetSize", "2")
}
