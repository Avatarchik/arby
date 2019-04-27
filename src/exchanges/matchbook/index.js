const moment = require("moment")
const { MongoClient } = require("mongodb")

const BettingApi = require("./apis/betting")
const AccountsApi = require("./apis/account")
const MatchbookConfig = require("./config")
const { buildFormattedEvents } = require("./format")

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
		"per-page": 500,
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

		console.log(JSON.stringify(response.data.events[0]))
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

exports.matchbookInit = async function() {
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

		console.timeEnd("matchbook")
		return buildFormattedEvents(events)
	} catch (err) {
		console.log(err)
	}
}
