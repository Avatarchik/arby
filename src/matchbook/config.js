import { MatchbookApi } from "../api";

export default class MatchbookConfig {
    constructor() {
        this._api = new MatchbookApi();
    }

    async login() {
        this._api._api.post("/bpapi/rest/security/session", {
            data: {
                username: process.env.MATCHBOOK_USERNAME,
                password: process.env.MATCHBOOK_PASSWORD
            }
        })
    }
}