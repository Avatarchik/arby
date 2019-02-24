import { init as BetfairInit } from "./exchanges/betfair";
import { init as MatchbookInit } from "./exchanges/matchbook";
import fs from "fs";

export async function initWorker() {
	let builtEvents;

	switch (process.env.workerId) {
		case "BETFAIR":
			builtEvents = await BetfairInit();
			// fs.writeFileSync("betfair_events.json", JSON.stringify(builtEvents.map(event => event.name)));

			process.send({
				bookie: "BETFAIR",
				builtEvents
			});
			break;
		case "MATCHBOOK":
			builtEvents = await MatchbookInit();

			process.send({
				bookie: "MATCHBOOK",
				builtEvents
			});
			break;
		default:
			console.error("Bookie not supported");
	}
}
