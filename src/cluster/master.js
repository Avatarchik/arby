const session = require("express-session")
const bodyParser = require("body-parser")
const morgan = require("morgan")
const cors = require("cors")
const chalk = require("chalk")
const cluster = require("cluster")

const initDb = require("../db/config")
const { storeMatchedEvents, setDefaults } = require("../db/helpers")
const strategies = require("../strategies")
const { findSameEvents } = require("../helper")

const bookies = ["BETFAIR", "MATCHBOOK"]
const clusterMap = {}
const log = console.log

let worker
let matchbookEvents
let betfairEvents
let sameEvents
let dbInstance

exports.initMaster = async function(app) {
	try {
		dbInstance = await initDb()

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
		await setDefaults(app)

		for (let bookie of bookies) {
			worker = cluster.fork({
				workerId: bookie
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
					await storeMatchedEvents(sameEvents, dbInstance)
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
	} catch (err) {}
}
