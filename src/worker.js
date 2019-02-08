import { init as BetfairInit } from "./exchanges/betfair";
import { init as MatchbookInit } from "./exchanges/matchbook";

export async function initWorker() {
    let builtEvents;

    switch (process.env.bookie) {
        case "BETFAIR":
            builtEvents = await BetfairInit();

            process.send({
                bookie: "BETFAIR",
                builtEvents,
            });
            break;
        case "MATCHBOOK":
            builtEvents = await MatchbookInit();

            process.send({
                bookie: "MATCHBOOK",
                builtEvents,
            });
            break;
        default:
            console.error("Bookie not supported");
    }
}
