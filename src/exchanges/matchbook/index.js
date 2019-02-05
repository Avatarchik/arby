import moment from "moment";

import BettingApi from "./apis/betting";
import AccountsApi from "./apis/account";
import MatchbookConfig from "./config";

import {
    buildFullEvent
} from "../../../lib/helpers";

let matchbookConfig;
let accountsApi;
let bettingApi;

async function getAccountFunds() {
    let response;

    try {
        response = await accountsApi.getBalance();

        return response.data;
    } catch (err) {
        console.error(err);
    }
}

async function getSports() {
    const params = {
        "per-page": 100,
        "status": "active"
    };

    let response;

    try {
        response = await bettingApi.getSports(params);

        return response.data.sports;
    } catch(err) {
        console.error(err);
    }
}

async function getEvents(sportIds) {
    const params = {
        after: String(moment().startOf("day").valueOf()),
        before: String(moment().endOf("day").valueOf()),
        "sport-ids": JSON.stringify(sportIds).replace("[", "").replace("]", ""),
        "odds-type": "DECIMAL",
        "include-prices": false,
        side: "back",
        currency: matchbookConfig.defaultCurrency
    };

    let response;

    try {
        response = await bettingApi.getEvents(params);

        return response.data;
    } catch (err) {
        console.error(err);
    }
}

function getSportIds(sports) {
    const sportsToUse = matchbookConfig.sportsToUse;

    return sports.filter(sport => {
        return (sportsToUse.indexOf(sport.name) > -1)
    })
        .map(sport => sport.id);
}

export async function init() {
    let sports;
    let sportsIds;

    matchbookConfig = new MatchbookConfig();

    matchbookConfig.initAxios();
    await matchbookConfig.login();

    accountsApi = new AccountsApi();
    bettingApi = new BettingApi();

    try {
        matchbookConfig.balance = await getAccountFunds();
        sports = await getSports();
        sportsIds = getSportIds(sports);

        await getEvents(sportsIds);
    } catch(err) {

    }
}