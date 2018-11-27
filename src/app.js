import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import { reduce, concat } from "lodash";

import BettingApi from "./betfair/apis/betting";

const bettingApi = new BettingApi();

let response
let eventTypes;
let eventTypeIds;
let events;
let eventIds;
let marketCatalogue;

(async() => {
	await bettingApi.initAxios();

	// Get all event types
	try {
		response = await bettingApi.getEventTypes();
		eventTypes = response.data.result;

		eventTypeIds = reduce(eventTypes, (arr, eT) => concat(arr, eT.eventType.id), []);
	} catch(err) {
		console.error(err);
	}

	// Get all events of those event types
	try {
		response = await bettingApi.getEvents(eventTypeIds);
		events = response.data.result;

		eventIds = reduce(events, (arr, e) => concat(arr, e.event.id), []);
	} catch(err) {
		console.log(err);
	}

	// Get all the markets of those events...a hell of a lot of results as no limit
	try {
		response = await bettingApi.getMarketCatalogue(eventIds);
		marketCatalogue = response.data.result;
	} catch(err) {
		console.log(err);
	}
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
