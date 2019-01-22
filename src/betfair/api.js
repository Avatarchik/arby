import axios from "axios";

export default class BetfairApi {
    constructor() {
        if (!Api.instance) {
            Api.instance = this;
        }

        return Api.instance;
    }

    initAxios() {
        this.api = axios.create({
            baseURL: `https://${process.env.BF_API_HOSTNAME}`,
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
        })
    }
}