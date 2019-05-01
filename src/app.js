const express = require("express")
const session = require("express-session")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const cors = require("cors")
const chalk = require("chalk")
const cluster = require("cluster")
const schedule = require("node-schedule")
const moment = require("moment")

const initDb = require("./db/config")
const { setDefaults, storeMatchedEvents } = require("./db/helpers")
const { findSameEvents } = require("./helper")
const strategies = require("./strategies")
const exInit = require("./exchanges")
const { watchEvent } = require("./watch")

const app = express()
const log = console.log
const bookies = ["BETFAIR", "MATCHBOOK"]
const clusterMap = {}

let worker
let storedEvents
let timeGap
let exchangeEvents
let exchangesHaveEvents

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
				.then(async () => {
					exchangeEvents = await Promise.all(
						bookies.map(async bookie => {
							return {
								exchange: bookie,
								events: await exInit[`init_${bookie.toLowerCase()}`](db)
							}
						})
					)
					exchangesHaveEvents = exchangeEvents.every(exchange => exchange.events.length)

					if (exchangeEvents.length === bookies.length && exchangesHaveEvents) {
						sameEvents = findSameEvents(exchangeEvents)
						storedEvents = await storeMatchedEvents(sameEvents, db)

						if (process.env.NODE_ENV === "development") {
							timeGap = moment.duration(10, "seconds")

							schedule.scheduleJob(
								moment()
									.add(timeGap)
									.format(),
								() => {
									worker = cluster.fork({
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
			watchEvent(db)
		}
	})
	.catch(err => {
		console.error(err)
		process.exit(1)
	})

module.exports = app
