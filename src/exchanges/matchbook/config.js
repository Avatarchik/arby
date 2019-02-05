import axios from "axios";

import ExchangeConfig from "../config";

export default class MatchbookConfig extends ExchangeConfig {
    constructor() {
        super();

        this._minimumBetSize = 0;
        this._balance = 0;

        if (!MatchbookConfig.instance) {
            MatchbookConfig.instance = this;
        }
        return MatchbookConfig.instance;
    }

    initAxios() {
        this._api = axios.create({
            baseURL: `https://${process.env.MATCHBOOK_ENDPOINT}`,
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            transformRequest: [function (data, headers) {
                // Axios encapsulates the request body in a 'data' object
                // This needs to be removed
                // On 'GET' requests, there is no data so only do the mutation is data exists
                return (data) ? JSON.stringify(data.data) : data;
            }]
        });
    }

    async login() {
        let response;

        try {
            response = await this._api.post("/bpapi/rest/security/session", {
                data: {
                    username: process.env.MATCHBOOK_USERNAME,
                    password: process.env.MATCHBOOK_PASSWORD
                }
            });

            process.env.MATCHBOOK_SESSIONTOKEN = response.data["session-token"]
            this._api.defaults.headers.common["session-token"] = process.env.MATCHBOOK_SESSIONTOKEN;
        } catch (err) {
            console.error(err);
        }
    }

    get api() {
        return this._api;
    }

    set balance(val) { 
        this._balance = val;
    }

    get balance() {
        return this._balance;
    }
}