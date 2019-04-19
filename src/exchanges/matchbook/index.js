import moment from "moment"
import fs from "fs"

import BettingApi from "./apis/betting"
import AccountsApi from "./apis/account"
import MatchbookConfig from "./config"

import * as helpers from "../../helpers"

let matchbookConfig
let accountsApi
let bettingApi

async function getAccountFunds() {
	let response

	try {
		response = await accountsApi.getBalance()

		return response.data
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
	const params = {
		"per-page": 100,
		after: String(
			moment()
				.subtract(gap)
				.unix()
		),
		before: String(
			moment()
				.add(2, "day")
				.unix()
		),
		states: "open",
		"sport-ids": JSON.stringify(sportIds)
			.replace("[", "")
			.replace("]", ""),
		"odds-type": "DECIMAL",
		"include-prices": false,
		"exchange-type": "back-lay",
		currency: matchbookConfig.defaultCurrency
	}

	let response

	try {
		response = await bettingApi.getEvents(params)

		return response.data.events
	} catch (err) {
		console.error(err)
	}
}

function getSportIds(sports) {
	const sportsToUse = matchbookConfig.sportsToUse

	return sports
		.filter(sport => {
			return sportsToUse.indexOf(sport.name) > -1
		})
		.map(sport => sport.id)
}

export async function init() {
	let sports
	let sportsIds
	let events

	matchbookConfig = new MatchbookConfig()

	matchbookConfig.initAxios()
	await matchbookConfig.login()

	accountsApi = new AccountsApi()
	bettingApi = new BettingApi()

	try {
		console.time("matchbook")
		matchbookConfig.balance = await getAccountFunds()
		sports = await getSports()
		sportsIds = getSportIds(sports)

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
