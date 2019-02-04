import jsonschema from "jsonschema";

import MatchbookConfig from "../config";

export default class BettingAPI {
    constructor() {
        const Validator = jsonschema.Validator;

        this._config = new MatchbookConfig();
        this._validator = new Validator();
    }

    async getSports() {
        try {
            return this._config._api._api.get("/edge/rest/lookups/sports", {
                params: {
                    offset: 0,
                    "per-page": 20,
                    order: "name asc",
                    status: "active"
                }
            });
        } catch(err) {
            console.error(err);
        }
    }

    async getEvents() {
        try {
            return this._config._api._api.get("/edge/rest/events", {
                params: {
                    offset: 0,
                    "per-page": 20,
                    // after: Probably will make this daily so will be after midnight each day
                    "sport-ids": "",
                }
            });
        } catch(err) {
            console.error(err);
        }
    }
}