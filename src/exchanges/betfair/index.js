const moment = require("moment")
const { chunk, flattenDeep } = require("lodash")

const BettingApi = require("./apis/betting")
const AccountsApi = require("./apis/account")
const { setExchangeBalance, getConfig } = require("../../db/helpers")
const BetfairConfig = require("./config")
const { handleApiException, checkForException, getException } = require("./exceptions")
const { AccountOperations } = require("../../../lib/enums/exchanges/betfair/account")

const BETTING = "Betting"
const ACCOUNT = "Account"

let bettingApi
let accountApi

async function setAccountFunds(db) {
	const params = {
		filter: {}
	}
	const funcName = setAccountFunds.name
	const type = ACCOUNT

	let response

	try {
		response = await accountApi.getAccountFunds(params)

		checkForException(response, AccountOperations.GET_ACCOUNT_FUNDS, type)

		await setExchangeBalance(db, response.data.result.availableToBetBalance, "betfair")
	} catch (err) {
		process.exit(1)
		// throw getException({
		// 	err,
		// 	params,
		// 	type,
		// 	funcName,
		// 	args
		// })
	}
}

async function getEventTypes() {
	const params = {
		filter: {}
	}
	const type = BETTING
	const funcName = getEventTypes.name

	let response

	try {
		response = await bettingApi.listEventTypes(params)

		return response.data.result
	} catch (err) {
		throw getException({
			err,
			params,
			type,
			funcName
		})
	}
}

async function getEvents(eventTypes) {
	const gap = moment.duration(2, "hours")
	const params = {
		filter: {
			marketStartTime: {
				from: moment()
					.subtract(gap)
					.format(),
				to: moment()
					.add(1, "day")
					.format()
			}
		}
	}
	const funcName = getEvents.name
	const type = BETTING

	let response

	try {
		return flattenDeep(
			await Promise.all(
				eventTypes.map(async eventType => {
					return (await bettingApi.listEvents({
						filter: {
							eventTypeIds: [eventType.id],
							...params.filter
						}
					})).data.result.map(event => {
						return {
							...event,
							eventType: eventType.name
						}
					})
				})
			)
		)
	} catch (err) {
		console.error(err)
		// throw getException({
		// 	err,
		// 	params,
		// 	type,
		// 	funcName,
		// 	args
		// })
	}
}

async function getWantedEventTypes(eventTypes, db) {
	const config = await getConfig(db)

	return eventTypes
		.filter(event => {
			return config[0].sportsToUse.includes(event.eventType.name)
		})
		.map(event => event.eventType)
}

function eventNameIsSet(event) {
	return (
		event.event.name === "Set 01" ||
		event.event.name === "Set 02" ||
		event.event.name === "Set 03" ||
		event.event.name === "Set 04" ||
		event.event.name === "Set 05"
	)
}

// For some reason, Betfair returns the sets for a tennis match as events
// This is a function to remove the,
function removeBogusTennisEvents(events) {
	return events.filter(event => {
		return !eventNameIsSet(event)
	})
}

exports.betfairInit = async function(db) {
	const betfairInstance = new BetfairConfig()

	let eventTypes
	let wantedEventTypes
	let events
	let trueEvents

	try {
		betfairInstance.initAxios()
		await betfairInstance.login()

		accountApi = new AccountsApi()
		bettingApi = new BettingApi()

		console.time("betfair")
		await setAccountFunds(db)
		eventTypes = await getEventTypes()
		wantedEventTypes = await getWantedEventTypes(eventTypes, db)

		events = await getEvents(wantedEventTypes)
		trueEvents = removeBogusTennisEvents(events)

		return trueEvents.map(event => {
			return {
				id: event.event.id,
				name: event.event.name,
				startTime: event.event.openDate,
				eventType: event.eventType,
				country: event.event.countryCode || "-"
			}
		})
	} catch (err) {
		handleApiException(err)
	}
}
