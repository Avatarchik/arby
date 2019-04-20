import moment from "moment"
import fs from "fs"
import asyncRedis from "async-redis"

import BettingApi from "./apis/betting"
import AccountsApi from "./apis/account"
import MatchbookConfig from "./config"

import * as helpers from "../../helpers"

const client = asyncRedis.createClient()

let matchbookConfig
let accountsApi
let bettingApi

client.on("error", err => {
	console.error("Error: ", err)
})

async function getAccountFunds() {
	let response

	try {
		response = await accountsApi.getBalance()

		return response.data.balance.toString()
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

async function getEvents(sportIds) {
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

	try {
		params.currency = await client.get("defaultCurrency")
		response = await bettingApi.getEvents(params)

		return response.data.events
	} catch (err) {
		console.error(err)
	}
}

async function getSportIds(sports) {
	const sportsToUse = JSON.parse(await client.get("sportsToUse"))

	return sports
		.filter(sport => {
			return sportsToUse.includes(sport.name)
		})
		.map(sport => sport.id)
}

export async function init() {
	const matchbookInstance = new MatchbookConfig()
	let sports
	let sportsIds
	let events

	matchbookInstance.initAxios()
	await matchbookInstance.login()

	accountsApi = new AccountsApi()
	bettingApi = new BettingApi()

	try {
		console.time("matchbook")
		await client.set("matchbookBalance", await getAccountFunds())
		sports = await getSports()
		sportsIds = await getSportIds(sports)

		events = await getEvents(sportsIds)

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
		return helpers.matchbook_buildFullEvents(events)
	} catch (err) {
		console.log(err)
	}
}
