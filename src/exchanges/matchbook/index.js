const moment = require("moment")
const { MongoClient } = require("mongodb")

const BettingApi = require("./apis/betting")
const AccountsApi = require("./apis/account")
const MatchbookConfig = require("./config")
const { buildFormattedEvents } = require("./format")
const { setBalance, getConfig } = require("../../db/helpers")

let accountsApi
let bettingApi

async function setAccountFunds(db) {
	let response

	try {
		response = await accountsApi.getBalance()

		await setBalance(db, response.data.balance, "matchbook")
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
		config = await getConfig(db)
		params.currency = config.defaultCurrency
		response = await bettingApi.getEvents(params)

		return response.data.events
	} catch (err) {
		console.error(err)
	}
}

async function getSportIds(sports, db) {
	const config = await getConfig(db)

	return sports
		.filter(sport => {
			return config.sportsToUse.includes(sport.name)
		})
		.map(sport => sport.id)
}

exports.matchbookInit = async function(db) {
	const matchbookInstance = new MatchbookConfig()

	let sports
	let sportsIds
	let events

	try {
		matchbookInstance.initAxios()
		await matchbookInstance.login()

		accountsApi = new AccountsApi()
		bettingApi = new BettingApi()

		await setAccountFunds(db)
		sports = await getSports()
		sportsIds = await getSportIds(sports, db)

		events = await getEvents(sportsIds, db)

		return events.map(event => {
			const metaTags = event["meta-tags"]
			const countryTag = metaTags.find(tag => tag.type === "COUNTRY")
			const eventTypeTag = metaTags.find(tag => tag.type === "SPORT")

			return {
				id: event.id || "-",
				name: event.name || "-",
				startTime: event.start,
				eventType: eventTypeTag ? eventTypeTag.name : "-",
				country: countryTag ? getCode(countryTag.name) : "-"
			}
		})
	} catch (err) {
		console.log(err)
	}
}
