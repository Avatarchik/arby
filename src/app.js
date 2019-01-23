import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import chalk from "chalk";
import { Login } from "betfair-js-login";
import schedule from "node-schedule";

import { init } from "./betfair";

const app = express();
const log = console.log;

(async() => {
	const loginClient = new Login(
		process.env.BF_USERNAME,
		process.env.BF_PASSWORD,
		process.env.BF_APP_KEY_DELAY
	);

	process.env.BF_SESSIONTOKEN = await loginClient.login();

	// Runs everyday at midnight
	// schedule.scheduleJob("0 0 * * *", () => {
		init();
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
