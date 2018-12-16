import express from "express";
import moment from "moment";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import { reduce, concat, find } from "lodash";

import BettingApi from "./betfair/apis/betting/betting";
import { EventTypeIds } from "./betfair/apis/betting/config";

const bettingApi = new BettingApi();

let response
let eventTypes;
let eventTypeIds;
let events;
let eventIds;
let marketCatalogues;
let marketIds;
let marketBooks;
let runnerBook;
let runners;
let runnerSelectionId;

(async() => {
	await bettingApi.initAxios();

	try {
		response = await bettingApi.listEventTypes({
			filter: {
				eventTypeIds: [
					EventTypeIds.SOCCER
				]
			}
		});
		eventTypes = response.data.result;
		eventTypeIds = eventTypes.map(eT => eT.eventType.id);
	} catch(err) {
		console.error(err);
	}

	try {
		response = await bettingApi.listEvents({
			filter: {
				eventTypeIds,
				marketStartTime: {
					from: moment().startOf("day").format(),
					to: moment().endOf("day").format()
				},
				marketCountries: [
					"GB"
				],
				turnInPlayEnabled: true,
				marketBettingTypes: [
					"ODDS"
				]
			}
		});
		events = response.data.result;
		eventIds = events.reduce((acc, e) => acc.concat(e.event.id), []);
	} catch(err) {
		console.error(err);
	}

	try {
		response = await bettingApi.listMarketCatalogue({
			filter: {
				eventIds
			},
			marketProjection: [
				"COMPETITION",
				"EVENT",
				"MARKET_START_TIME",
				"RUNNER_DESCRIPTION"	
			],
			maxResults: 1000
		});
		marketCatalogues = response.data.result;
		marketIds = marketCatalogues.find(mc => mc.marketName === "Match Odds").marketId;
		console.log("::: marketCatalogues[0] :::");
		console.log(marketCatalogues.find(mc => mc.marketName === "Match Odds"));
	} catch(err) {
		console.error(err);
	}

	try {
		response = await bettingApi.listMarketBook({
			marketIds: [
				marketIds
			],
			priceProjection: {
				priceData: [
					"EX_BEST_OFFERS"
				]
			}
			//orderProjection: "ALL"
		});
		marketBooks = response.data.result;
		runners = marketBooks.map(marketBook => marketBook.runners);

		console.log("::: marketBooks[0].runners :::");
		console.log(marketBooks[0].runners[0].ex);
	} catch(err) {
		console.error(err);
	}


	try {
		response = await bettingApi.listRunnerBook({
			marketId: marketBooks[0].marketId,
			selectionId: String(marketBooks[0].runners[0].selectionId)
		});
		// do not let the name fool you... what is returned is actually a MarketBook but just with the 1 runner specified
		runnerBook = response.data.result;

		console.log("::: runnerBook :::");
		console.log(runnerBook[0]);
	} catch(err) {
		console.error(err);
	}

	// try {
	// 	respone = await bettingApi.placeOrders({
	// 		marketId: marketCatalogue[0].marketId,
	// 		instructions: {
	// 			handicap: "0",
	// 			side: "BACK"
	// 		}
	// 	});
	// } catch(err) {
	// 	console.error(err);
	// }
})();

const app = express();

app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(cors());
app.use(session({
	secret: "test",
	resave: false,
	saveUninitialized: true,
}));

app.listen(process.env.PORT, () => {
	console.log(`Listening on port: ${process.env.PORT}`);
});

export default app;
