import axios from "axios";

export class BetfairApi {
    constructor() {
        if (!BetfairApi.instance) {
            BetfairApi.instance = this;
        }

        return BetfairApi.instance;
    }

    initAxios() {
        this._api = axios.create({
            baseURL: `https://${process.env.BETFAIR_ENDPOINT}`,
            headers: {
                "Accept": "application/json",
                "X-Application": process.env.BETFAIR_APP_KEY_DELAY,
                "Content-Type": "application/json",
                "X-Authentication": process.env.BETFAIR_SESSIONTOKEN
            },
            transformRequest: [function(data, headers) {
                // Axios encapsulates the request body in a 'data' object
                // This needs to be removed
                return JSON.stringify(data.data);
            }]
        });
    }
}

export class MatchbookApi {
    constructor() {
        if (!MatchbookApi.instance) {
            MatchbookApi.instance = this;
        }

        return MatchbookApi.instance;
    }

    initAxios() {
        this._api = axios.create({
            baseURL: `https://${process.env.MATCHBOOK_ENDPOINT}`,
            headers: {
                "Accept": "application/json",
                "session-token": process.env.MATCHBOOK_SESSIONTOKEN
            }
        });
    }
}

export class FootballApi {
    constructor() {
        if (!FootballApi.instance) {
            FootballApi.instance = this;
        }

        return FootballApi.instance;
    }

    initAxios() {
        this._api = axios.create({
            baseURL: `http://${process.env.LIVESCORE_API_BASE_ENDPOINT}`,
            params: {
                key: process.env.LIVESCORE_API_KEY,
                secret: process.env.LIVESCORE_API_SECRET
            }
        });
    }
}