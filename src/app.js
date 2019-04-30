const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const cors = require("cors")
const chalk = require("chalk")
const cluster = require("cluster")
const schedule = require("node-schedule")
const moment = require("moment")

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
let timeGap
let noCountry

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
									noCountry = betfairEvents.filter(event => !event.country)

									if (noCountry.length) {
										console.log("debug")
									}
									worker.kill()
									break
								case "MATCHBOOK":
									matchbookEvents = message.builtEvents
									noCountry = matchbookEvents.filter(event => !event.country)

									if (noCountry.length) {
										console.log("debug")
									}

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

								if (process.env.NODE_ENV === "development") {
									timeGap = moment.duration(10, "seconds")

									schedule.scheduleJob(
										moment()
											.add(timeGap)
											.format(),
										() => {
											cluster.fork({
												OBJECT_ID: storedEvents[0]._id.toString(),
												COUNTRY: storedEvents[0].country,
												EVENT_TYPE: storedEvents[0].eventType,
												START_TIME: storedEvents[0].startTime,
												EXCHANGES: JSON.stringify(storedEvents[0].exchanges)
											})
											clusterMap[worker.id] = storedEvents[0]._id.toString()
										}
									)
								} else {
									timeGap = moment.duration(5, "minutes")

									for (let event of storedEvents) {
										schedule.scheduleJob(
											moment(event.startTime)
												.subtract(timeGap)
												.format(),
											() => {
												cluster.fork({
													OBJECT_ID: event._id.toString(),
													COUNTRY: event.country,
													EVENT_TYPE: event.eventType,
													START_TIME: event.startTime,
													EXCHANGES: JSON.stringify(event.exchanges)
												})
												clusterMap[worker.id] = event._id.toString()
											}
										)
									}
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
