import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import chalk from "chalk";
import schedule from "node-schedule";

import {
	init as BetfairInit
} from "./exchanges/betfair";
import {
	init as MatchbookInit
} from "./exchanges/matchbook"

const app = express();
const log = console.log;

(async () => {
	// Runs everyday at midnight
	// schedule.scheduleJob("0 0 * * *", () => {
	MatchbookInit();
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

export default app;