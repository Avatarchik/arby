import axios from "axios";

export class BetfairApi {
    constructor() {
        if (!BetfairApi.instance) {
            BetfairApi.instance = this;
        }

        return BetfairApi.instance;
    }

    initAxios() {
        this.api = axios.create({
            baseURL: `https://${process.env.BF_API_ENDPOINT}`,
            headers: {
                "Accept": "application/json",
                "X-Application": process.env.BF_APP_KEY_DELAY,
                "Content-Type": "application/json",
                "X-Authentication": process.env.BF_SESSIONTOKEN
            },
            transformRequest: [function(data, headers) {
                // Axios encapsulates the request body in a 'data' object
                // This needs to be removed
                return JSON.stringify(data.data);
            }]
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
        this.api = axios.create({
            baseURL: `https://${process.env.FOOTBALL_API_BASE_ENDPOINT}`,
            headers: {
                "Accept": "application/json",
                "X-Mashape-Key": process.env.FOOTBALL_API_KEY
            }
        });
    }
}