import { MarketBettingTypes, EventTypeIds } from "./config";

export default class MarketFilter {
    constructor(eventIds) {
        this.filter = {
            eventIds,
            marketBettingTypes: [
                MarketBettingTypes.ODDS
            ],
            marketCountries: [
                "GB"
            ],
            marketTypeCodes: [
                "MATCH_ODDS"
            ]
        }
    }

    async addFilter(api) {
        let marketTypeCodes;

        if (!this.filter.marketCountries) {
            this.addMarketCountries();
        } else if (!this.filter.marketTypeCodes) {
            marketTypeCodes = await this.getMarketTypeCodes(api);
            this.addMarketTypeCodes(marketTypeCodes);
        }
    }

    addMarketCountries() {
        this.filter.marketCountries = [
            "GB"
        ];
    }

    async getMarketTypeCodes(api) {
        let response;

        try {
            response = await api.listMarketTypes({
                filter: {
                    eventTypeIds: this.filter.eventTypeIds
                }
            });

            if (response.data.error) {
                throw response.data.error;
            }
            return response.data.result;
        } catch(err) {
            throw err;
        }
    }

    addMarketTypeCodes(marketTypeCodes) {
        if (this.filter.eventTypeIds.indexOf(EventTypeIds.SOCCER)) {
            this.filter.marketTypeCodes = [
                "MATCH_ODDS"
            ]
        }
    }
}