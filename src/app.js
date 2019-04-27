const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const cors = require("cors")
const chalk = require("chalk")
const cluster = require("cluster")

const { initWorker } = require("./worker")
const db = require("./db")
const strategies = require("./strategies")

const app = express()
const log = console.log
const bookies = ["BETFAIR", "MATCHBOOK"]
const clusterMap = {}

let worker
let matchbookEvents
let betfairEvents
let noCountry

if (cluster.isMaster) {
	app.use(bodyParser.json())
	app.use(morgan("combined"))
	app.use(cors())
	app.use(
		session({
			secret: "test",
			resave: false,
			saveUninitialized: true
		})
	)

	app.listen(process.env.PORT || 3000, () => {
		log(chalk.green("--------------------"))
		log(chalk.green(`Host:\t${process.env.HOST || "localhost"}`))
		log(chalk.green(`Port:\t${process.env.PORT || 3000}`))
		log(chalk.green("--------------------"))
	})

	db.setDefaults()
		.then(() => {
			for (let i = 0; i < bookies.length; i++) {
				worker = cluster.fork({
					workerId: bookies[i]
				})
				clusterMap[worker.id] = bookies[i]

				worker.on("message", message => {
					switch (message.bookie) {
						case "BETFAIR":
							betfairEvents = message.builtEvents
							break
						case "MATCHBOOK":
							matchbookEvents = message.builtEvents

							noCountry = matchbookEvents.filter(event => !event.country)

							if (noCountry.length) {
								console.log("NO COUNTRIES!!!")
							}
							break
						default:
							console.log("Bookie not supported")
					}

					if (matchbookEvents && matchbookEvents.length && betfairEvents && betfairEvents.length) {
						strategies
							.initArbitrage([
								{
									name: "matchbook",
									events: matchbookEvents
								},
								{
									name: "betfair",
									events: betfairEvents
								}
							])
							.then(res => {})
							.catch(err => {
								console.error(err)
							})
					} else {
						console.log("No events")
					}
				})
			}

			cluster.on("online", worker => {
				console.log(`Worker ${clusterMap[worker.id]} is now online after it has been forked`)
			})
			cluster.on("listening", (worker, address) => {
				console.log(`A worker is now connected to ${address.address}:${address.port}`)
			})
			cluster.on("fork", worker => {
				console.log(`New worker being forked: ${clusterMap[worker.id]}`)
			})
			cluster.on("exit", (worker, code, signal) => {
				console.log(`Worker ${clusterMap[worker.id]} died ${signal || code}`)
			})
			cluster.on("death", worker => {
				console.log(`Worker ${clusterMap[worker.id]} died`)
			})
		})
		.catch(err => {
			console.error("Error: ", err)
		})
} else {
	initWorker()
}

module.exports = app
