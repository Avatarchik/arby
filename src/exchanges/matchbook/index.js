import moment from "moment"
import { MongoClient } from "mongodb"

import BettingApi from "./apis/betting"
import AccountsApi from "./apis/account"
import MatchbookConfig from "./config"
import { buildFormattedEvents } from "./format"

let accountsApi
let bettingApi

async function setAccountFunds(db) {
	let response

	try {
		response = await accountsApi.getBalance()

		await db.collection("config").updateOne(
			{
				sportsToUse: {
					$exists: true
				}
			},
			{
				$set: {
					matchbookBalance: response.data.balance
				}
			},
			{
				upsert: false
			}
		)
	} catch (err) {
		console.error(err)
	}
}

async function getSports() {
	const params = {
		"per-page": 100,
		status: "active"
	}

	let response

	try {
		response = await bettingApi.getSports(params)

		return response.data.sports
	} catch (err) {
		console.error(err)
	}
}

async function getEvents(sportIds, db) {
	const gap = moment.duration(2, "hours")

	let params = {
		"per-page": 100,
		after: String(
			moment()
				.subtract(gap)
				.unix()
		),
		before: String(
			moment()
				.add(1, "day")
				.unix()
		),
		states: "open",
		"sport-ids": JSON.stringify(sportIds)
			.replace("[", "")
			.replace("]", ""),
		"odds-type": "DECIMAL",
		"include-prices": false,
		"exchange-type": "back-lay"
	}
	let response
	let config

	try {
		config = await db
			.collection("config")
			.find(
				{
					sportsToUse: {
						$exists: true
					}
				},
				{
					defaultCurrency: 1
				}
			)
			.toArray()
		params.currency = config[0].defaultCurrency
		response = await bettingApi.getEvents(params)

		return response.data.events
	} catch (err) {
		console.error(err)
	}
}

async function getSportIds(sports, db) {
	const config = await db
		.collection("config")
		.find(
			{
				sportsToUse: {
					$exists: true
				}
			},
			{
				sportsToUse: 1
			}
		)
		.toArray()

	return sports
		.filter(sport => {
			return config[0].sportsToUse.includes(sport.name)
		})
		.map(sport => sport.id)
}

export async function init() {
	const matchbookInstance = new MatchbookConfig()

	let sports
	let sportsIds
	let events
	let client
	let db

	try {
		matchbookInstance.initAxios()
		await matchbookInstance.login()

		accountsApi = new AccountsApi()
		bettingApi = new BettingApi()

		client = await MongoClient.connect(process.env.DB_URL, {
			useNewUrlParser: true
		})
		db = client.db(process.env.DB_NAME)

		console.time("matchbook")
		await setAccountFunds(db)
		sports = await getSports()
		sportsIds = await getSportIds(sports, db)

		events = await getEvents(sportsIds, db)

		// let thingsToRight = [];
		// events.forEach(event => {
		// 	event.markets.forEach(market => {
		// 		thingsToRight.push({
		// 			name: market.name,
		// 			type: market["market-type"],
		// 			runnerNo: market.runners.length,
		// 			runners: market.runners.map(runner => runner.name)
		// 		});
		// 	});
		// });
		// fs.writeFileSync("./matchbook_events.json", JSON.stringify(thingsToRight));

		console.timeEnd("matchbook")
		return buildFormattedEvents(events)
	} catch (err) {
		console.log(err)
	}
}
