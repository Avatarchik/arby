import express from "express";
import session from "express-session";
import bodyParser from "body-parser";
import morgan from "morgan";
import cors from "cors";
import chalk from "chalk";
import cluster from "cluster";

import { initWorker } from "./worker";
import { matchMarkets } from "./calcs";

const app = express();
const log = console.log;
const bookies = [
	"BETFAIR"
	// "MATCHBOOK"
];

let worker;
let matchbookEvents;
let betfairEvents;

if (cluster.isMaster) {
	app.use(bodyParser.json());
	app.use(morgan("combined"));
	app.use(cors());
	app.use(
		session({
			secret: "test",
			resave: false,
			saveUninitialized: true
		})
	);

	app.listen(process.env.PORT || 3000, () => {
		log(chalk.green("--------------------"));
		log(chalk.green(`Host:\t${process.env.HOST || "localhost"}`));
		log(chalk.green(`Port:\t${process.env.PORT || 3000}`));
		log(chalk.green("--------------------"));
	});

	for (let i = 0; i < bookies.length; i++) {
		worker = cluster.fork({
			bookie: bookies[i]
		});

		worker.on("message", message => {
			switch (message.bookie) {
				case "BETFAIR":
					betfairEvents = message.builtEvents;
					break;
				case "MATCHBOOK":
					matchbookEvents = message.builtEvents;
					break;
				default:
					console.log("Bookie not supported");
			}

			if (matchbookEvents && matchbookEvents.length && betfairEvents && betfairEvents.length) {
				matchMarkets([
					{
						name: "matchbook",
						events: matchbookEvents
					},
					{
						name: "betfair",
						events: betfairEvents
					}
				]);
			} else {
				console.log("No events");
			}
		});
	}

	cluster.on("online", worker => {
		console.log(`Worker ${worker.id} is now online after it has been forked`);
	});
	cluster.on("listening", (worker, address) => {
		console.log(`A worker is now connected to ${address.address}:${address.port}`);
	});
	cluster.on("fork", worker => {
		console.log(`New worker being forked: ${worker.id}`);
	});
	cluster.on("exit", (worker, code, signal) => {
		console.log(`Worker ${worker.id} died ${signal || code}`);
	});
	cluster.on("death", worker => {
		console.log(`Worker ${worker.id} died`);
	});
} else {
	initWorker();
}

export default app;
