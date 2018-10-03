import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";

import BettingApi from "./betfair/apis/betting";

const bettingApi = new BettingApi();

const app = express();

app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(cors());
app.use(session({
	secret: "test",
	resave: false,
	saveUninitialized: true,
}));

const eventTypes = bettingApi.getEventTypes();
console.log(eventTypes);

app.listen(process.env.PORT, () => {
	console.log(`Listening on port: ${process.env.PORT}`);
});

export default app;
