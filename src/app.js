const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const cors = require("cors")
const chalk = require("chalk")
const cluster = require("cluster")
const schedule = require("node-schedule")

const { initWorker } = require("./cluster/worker")
const initDb = require("./db/config")
const { setDefaults, storeMatchedEvents } = require("./db/helpers")
const { findSameEvents } = require("./helper")
const strategies = require("./strategies")

const app = express()
const log = console.log
const bookies = ["BETFAIR", "MATCHBOOK"]
const clusterMap = {}

let worker
let matchbookEvents
let betfairEvents
let storedEvents

initDb()
	.then(db => {
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

			setDefaults(db)
				.then(() => {
					for (let bookie of bookies) {
						worker = cluster.fork({
							WORKER_ID: bookie
						})
						clusterMap[worker.id] = bookie

						worker.on("message", async message => {
							switch (message.bookie) {
								case "BETFAIR":
									betfairEvents = message.builtEvents
									worker.kill()
									break
								case "MATCHBOOK":
									matchbookEvents = message.builtEvents
									worker.kill()
									break
								default:
									console.log("Bookie not supported")
							}

							if (matchbookEvents && matchbookEvents.length && betfairEvents && betfairEvents.length) {
								sameEvents = findSameEvents([
									{
										name: "matchbook",
										events: matchbookEvents
									},
									{
										name: "betfair",
										events: betfairEvents
									}
								])
								storedEvents = await storeMatchedEvents(sameEvents, db)

								for (let event of storedEvents) {
									schedule.scheduleJob(new Date(event.startTime), () => {
										cluster.fork({
											OBJECT_ID: event._id.toString(),
											COUNTRY: event.country,
											EVENT_TYPE: event.eventType,
											START_TIME: event.startTime,
											EXCHANGES: JSON.stringify(event.exchanges)
										})
									})
								}
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
						if (worker.exitedAfterDisconnect === true) {
							console.log("Oh, it was volutary - no need to worry")
						} else {
							console.log(`Worker ${clusterMap[worker.id]} died ${signal || code}`)
						}
					})
					cluster.on("death", worker => {
						console.log(`Worker ${clusterMap[worker.id]} died`)
					})
				})
				.catch(err => {
					console.error("Error: ", err)
				})
		} else {
			initWorker(db)
		}
	})
	.catch(err => {
		console.error(err)
		process.exit(1)
	})

module.exports = app
