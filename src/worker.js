const { betfairInit } = require("./exchanges/betfair")
const { matchbookInit } = require("./exchanges/matchbook")

exports.initWorker = async function() {
	let builtEvents

	switch (process.env.workerId) {
		case "BETFAIR":
			builtEvents = await betfairInit()
			// fs.writeFileSync("betfair_events.json", JSON.stringify(builtEvents.map(event => event.name)));

			process.send({
				bookie: "BETFAIR",
				builtEvents
			})
			break
		case "MATCHBOOK":
			builtEvents = await matchbookInit()

			process.send({
				bookie: "MATCHBOOK",
				builtEvents
			})
			break
		default:
			console.error("Bookie not supported")
	}
}
