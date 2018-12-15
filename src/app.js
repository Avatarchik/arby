import express from "express";
import moment from "moment";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import { reduce, concat, find } from "lodash";

import BettingApi from "./betfair/apis/betting/betting";

const bettingApi = new BettingApi();

let response
let eventTypes;
let eventTypeIds;
let events;
let eventIds;
let marketCatalogue;
let marketIds;

(async() => {
	await bettingApi.initAxios();

	// Get all event types
	try {
		response = await bettingApi.listEventTypes();
		eventTypes = response.data.result;

		eventTypeIds = find(eventTypes, (eT) => eT.eventType.name === "Soccer").eventType.id;

		// console.log("::: eventTypes :::");
		// console.log(eventTypes);
		console.log("::: soccerEventId");
		console.log(eventTypeIds);

		// eventTypeIds = reduce(eventTypes, (arr, eT) => concat(arr, eT.eventType.id), []);
		// console.log("\n\n\n::: eventTypeIds :::");
		// console.log(eventTypeIds);
	} catch(err) {
		console.error(err);
	}

	// Get all events of those event types
	try {
		response = await bettingApi.listEvents({
			filter: {
				eventTypeIds: [
					eventTypeIds
				],
				marketStartTime: {
					from: moment().startOf("day").format(),
					to: moment().endOf("day").format()
				}
			}
		});
		events = response.data.result;

		console.log("::: events :::");
		console.log(events);

		eventIds = reduce(events, (arr, e) => concat(arr, e.event.id), []);
		// console.log("\n\n\n::: eventIds :::");
		// console.log(eventIds);
	} catch(err) {
		console.error(err);
	}

	// Get all the markets of those events...a hell of a lot of results as no limit
	try {
		response = await bettingApi.listMarketCatalogue({
			filter: {
				eventTypeIds: [
					eventTypeIds
				],
				eventIds
			},
			marketProjection: [
				"COMPETITION",
				"EVENT"	
			],
			maxResults: 10
		});
		marketCatalogue = response.data.result;
		marketIds = marketCatalogue.map(market => market.marketId);
		console.log("\n\n\n::: marketCatalogue :::");
		console.log(marketCatalogue);
		console.log("::: marketIds :::");
		console.log(marketIds);
	} catch(err) {
		console.error(err);
	}

	// try {
	// 	response = await bettingApi.listMarketBook({
	// 		_marketIds: {
	// 			params: marketIds
	// 		}
	// 	});
	// } catch(err) {
	// 	console.error(err);
	// }

	// try {
	// 	respone = await bettingApi.placeOrders({
	// 		opMarketId: marketCatalogue[0].marketId,
	// 		opInstructions: {
	// 			typeDef: "PLACE_INSTRUCTION",
	// 			params: {
	// 				orderType: [
	// 					"LIMIT"					// Normal order for immediate execution
	// 				],
	// 				side: [
	// 					"BACK"
	// 				]
	// 			}
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
