import moment from "moment";
import scheduler from "node-schedule";
import { forOwn, chunk, flattenDeep } from "lodash";
import fs from "fs";
import path from "path";

import BettingApi from "./apis/betting";
import AccountsApi from "./apis/account";
// import MarketFilter from "./betting/marketFilter";
import BetfairConfig from "./config";
import {
    handleApiException,
    checkForException,
    getException,
} from "./exceptions";
import {
    MarketProjection,
    PriceData,
    OrderType,
    Side,
    PersistenceType,
    EventTypes,
    Operations as BettingOperations,
    MarketBettingType,
} from "../../../lib/enums/exchanges/betfair/betting";
import { Operations as AccountOperations } from "../../../lib/enums/exchanges/betfair/account";
import * as helpers from "../../../lib/helpers";
import { isDeepStrictEqual } from "util";

const BETTING = "Betting";
const ACCOUNT = "Account";

let bettingApi;
let accountApi;
let betfairConfig;

async function getAccountFunds() {
    const params = {
        filter: {},
    };
    const funcName = getAccountFunds.name;
    const type = ACCOUNT;

    let response;

    try {
        response = await accountApi.getAccountFunds(params);

        checkForException(response, AccountOperations.GET_ACCOUNT_FUNDS, type);

        betfairConfig.balance = response.data.result.availableToBetBalance;
    } catch (err) {
        throw getException({
            err,
            params,
            type,
            funcName,
            args,
        });
    }
}

async function getEventTypes() {
    const params = {
        filter: {},
    };
    const type = BETTING;
    const funcName = getEventTypes.name;

    let response;

    try {
        response = await bettingApi.listEventTypes(params);

        return response.data.result;
    } catch (err) {
        throw getException({
            err,
            params,
            type,
            funcName,
        });
    }
}

async function getEvents(eventTypeIds) {
    const gap = moment.duration(2, "hours");
    const params = {
        filter: {
            eventTypeIds,
            marketStartTime: {
                from: moment()
                    .subtract(gap)
                    .format(),
                to: moment()
                    .endOf("day")
                    .format(),
            },
        },
    };
    const funcName = getEvents.name;
    const type = BETTING;

    let response;

    try {
        response = await bettingApi.listEvents(params);

        checkForException(response, BettingOperations.LIST_EVENTS, type);

        return response.data.result;
    } catch (err) {
        throw getException({
            err,
            params,
            type,
            funcName,
            args,
        });
    }
}

async function getMarketCatalogues(eventIds) {
    const type = BETTING;
    const funcName = getMarketCatalogues.name;
    // If there is an error of TOO_MUCH_DATA, lower the amount of size
    const idChunks = chunk(eventIds, 2);

    let params = {
        filter: {
            marketBettingTypes: [MarketBettingType.ODDS.val],
        },
        marketProjection: [
            MarketProjection.EVENT_TYPE.val,
            MarketProjection.EVENT.val,
            MarketProjection.MARKET_START_TIME.val,
            MarketProjection.MARKET_DESCRIPTION.val,
            MarketProjection.RUNNER_DESCRIPTION.val,
        ],
        maxResults: 1000,
    };
    let response;
    let marketCatalogues = [];
    let marketCataloguePromises;

    try {
        console.time("market-catalogues");

        // I attempted the commented out method below in an attempt to make all calls asynchronous and, hopefully, make the process faster
        // However, when doing this, I was returned with the error code of 'TOO_MUCH_DATA' everytime so too many requests per second?
        //
        // marketCataloguePromises = idChunks.map(ids => {
        //     params.filter.events = ids;

        //     return bettingApi.listMarketCatalogue(params);
        // });

        // marketCatalogues = await Promise.all(marketCataloguePromises);
        for (let ids of idChunks) {
            params.filter.eventIds = ids;

            response = await bettingApi.listMarketCatalogue(params);

            checkForException(
                response,
                BettingOperations.LIST_MARKET_CATALOGUE,
                type
            );
            // getMarketBooks(response.data.result);

            marketCatalogues.push(response.data.result);
        }

        console.timeEnd("market-catalogues");
        return flattenDeep(marketCatalogues);
    } catch (err) {
        throw getException({
            err,
            params,
            type,
            funcName,
        });
    }
}

async function getMarketBooks(marketIds) {
    const type = BETTING;
    const funcName = getMarketBooks.name;
    // If there is an error of TOO_MUCH_DATA, lower the amount of size
    // The number of results you get back will be the same number of markets you put in
    const idChunks = chunk(marketIds, 40);

    let params = {
        priceProjection: {
            priceData: [PriceData.EX_BEST_OFFERS.val],
        },
    };
    let response;
    let marketBooks = [];

    try {
        for (let ids of idChunks) {
            params.marketIds = ids;

            response = await bettingApi.listMarketBook(params);

            checkForException(
                response,
                BettingOperations.LIST_MARKET_BOOK,
                type
            );
            // getMarketBooks(response.data.result);

            marketBooks.push(response.data.result);
        }

        return flattenDeep(marketBooks);
    } catch (err) {
        throw getException({
            err,
            params,
            type,
            funcName,
        });
    }
}

async function placeBets(markets, funds) {
    const marketsWithAllocatedFunds = helpers.allocateFundsPerRunner(
        markets,
        funds
    );
    const params = {
        marketId: marketsWithAllocatedFunds[0].marketId,
        instructions: [
            {
                orderType: OrderType.LIMIT.val,
                selectionId: String(
                    marketsWithAllocatedFunds[0].runnerToBack.selectionId
                ),
                side: Side.BACK.val,
                limitOrder: {
                    size: Number(
                        marketsWithAllocatedFunds[0].runnerToBack.priceToBet
                    ),
                    price:
                        marketsWithAllocatedFunds[0].runnerToBack.lowestPrice, // 20% of the current market price...
                    persistenceType: PersistenceType.PERSIST.val, // No going back...
                },
            },
        ],
        async: false,
    };

    let response;

    try {
        response = await bettingApi.placeOrders(params);

        checkForException(response, BettingOperations.PLACE_ORDERS, Betting);
        return response.data.result;
    } catch (err) {
        throw getException(err, params, Betting);
    }
}

function setupScheduleJobs() {
    let dateToSchedule;
    let eventLength;

    forOwn(betfairConfig.schedules, (schedules, key) => {
        schedules.forEach(schedule => {
            eventLength = EventTypes[key.toUpperCase()].eventLength;
            dateToSchedule = moment(schedule)
                .add(eventLength, "m")
                .toDate();

            scheduler.scheduleJob(dateToSchedule, resolveScheduledJob);
        });
    });
}

function getEventTypeIds(eventTypes) {
    const sportsToUse = betfairConfig.sportsToUse;

    return eventTypes
        .filter(event => {
            return sportsToUse.indexOf(event.eventType.name) > -1;
        })
        .map(event => event.eventType.id);
}

function eventNameIsSet(event) {
    return (
        event.event.name === "Set 01" ||
        event.event.name === "Set 02" ||
        event.event.name === "Set 03" ||
        event.event.name === "Set 04" ||
        event.event.name === "Set 05"
    );
}

// For some reason, Betfair returns the sets for a tennis match as events
// This is a function to remove the,
function removeBogusTennisEvents(events) {
    return events.filter(event => {
        return !eventNameIsSet(event);
    });
}

export async function init() {
    let eventTypes;
    let eventTypeIds;
    let eventIds;
    let events;
    let trueEvents;
    let marketCatalogues;
    let marketIds;
    let marketBooks;

    betfairConfig = new BetfairConfig();

    betfairConfig.initAxios();
    await betfairConfig.login();

    accountApi = new AccountsApi();
    bettingApi = new BettingApi();

    try {
        console.time("betfair");
        await getAccountFunds();
        eventTypes = await getEventTypes();
        eventTypeIds = getEventTypeIds(eventTypes);

        events = await getEvents(eventTypeIds);
        trueEvents = removeBogusTennisEvents(events);
        // fs.writeFileSync("betfair_events.json", JSON.stringify(trueEvents));
        // console.log("::: number of events: ", trueEvents.length);
        eventIds = trueEvents.map(event => event.event.id);

        marketCatalogues = await getMarketCatalogues(eventIds);
        marketIds = marketCatalogues.map(catalogue => catalogue.marketId);

        marketBooks = await getMarketBooks(marketIds);

        console.timeEnd("betfair");
        return helpers.betfair_buildFullEvents(marketCatalogues, marketBooks);
    } catch (err) {
        handleApiException(err);
    }
}
