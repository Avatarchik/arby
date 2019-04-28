const { betfairInit } = require("../exchanges/betfair")
const { matchbookInit } = require("../exchanges/matchbook")
const { watchEvent } = require("../strategies/arbitrage")

exports.initWorker = async function(db) {
	let builtEvents

	if (process.env.WORKER_ID) {
		switch (process.env.WORKER_ID) {
			case "BETFAIR":
				builtEvents = await betfairInit(db)

				process.send({
					bookie: "BETFAIR",
					builtEvents
				})
				break
			case "MATCHBOOK":
				builtEvents = await matchbookInit(db)

				process.send({
					bookie: "MATCHBOOK",
					builtEvents
				})
				break
			default:
				console.error("Bookie not supported")
		}
	} else {
		watchEvent(db)
	}
}
