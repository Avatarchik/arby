import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import chalk from "chalk";
import schedule from "node-schedule";
import leven from "leven";
import { fork } from "child_process";
import path from "path";
import fs from "fs";

// import {
// 	init as BetfairInit
// } from "./exchanges/betfair";
// import {
// 	init as MatchbookInit
// } from "./exchanges/matchbook"

const app = express();
const log = console.log;

let betfairEvents;
let matchbookEvents;

let betfairProcess;
let matchbookProcess;

(async () => {
	// Runs everyday at midnight
	// schedule.scheduleJob("0 0 * * *", () => {
	betfairProcess = fork(path.join(__dirname, "exchanges", "betfair", "index.js"));
	matchbookProcess = fork(path.join(__dirname, "exchanges", "matchbook", "index.js"));

	betfairProcess.send("start");
	matchbookProcess.send("start");
	// });
})();

app.use(bodyParser.json());
app.use(morgan("combined"));
app.use(cors());
app.use(session({
	secret: "test",
	resave: false,
	saveUninitialized: true,
}));

app.listen(process.env.PORT || 3000, () => {
	log(chalk.green("--------------------"));
	log(chalk.green(`Host:\t${process.env.HOST || "localhost"}`));
	log(chalk.green(`Port:\t${process.env.PORT || 3000}`))
	log(chalk.green("--------------------"));
});

matchbookProcess.on("message", (message) => {
	console.log("\n::: MATCHBOOK EVENT :::");
	console.log(`::: message: ${message.status}`);
	console.log(`::: # of events: ${message.mutatedEvents.length}`);
	console.log(`::: events: ${message.mutatedEvents}`)
	fs.writeFileSync("matchbook_events.json", JSON.stringify(message.mutatedEvents));
});

betfairProcess.on("message", (message) => {
	console.log("\n::: BETFAIR EVENT :::");
	console.log(`::: message: ${message.status}`);
	console.log(`::: # of events: ${message.mutatedEvents.length}`);
	console.log(`::: events: ${message.mutatedEvents}`);
	fs.writeFileSync("betfair_events.json", JSON.stringify(message.mutatedEvents));
});

export default app;