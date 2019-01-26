import { BetfairApi, FootballApi } from "./api";
import { Login } from "betfair-js-login";

export default class BetfairConfig {
    constructor() {
        this._minimumBetSize = 2;                    // Set by Betfair Exchange...
        this._defaultLocale = "en";
        this._defaultCountryCode = "GB";
        // this.spreadBetting = 0.5;
        this.riskLevelPercent = 0.25;
        this._betfairApi = new BetfairApi();
        this._footballApi = new FootballApi();
        // this.backPriceLimit = 2;
        // this.layPriceLimit = 30;

        if (!BetfairConfig.instance) {
            BetfairConfig.instance = this;
        }

        return BetfairConfig.instance;
    }

    set fundsAvailableToBet(val) {
        this._fundsAvailableToBet = val;

        if (this._percentOfFundsToSave) {
            this.calculatateFundsAllowedToBet();
        }
    }

    set percentOfFundsToSave(val) {
        this._percentOfFundsToSave = val;

        if (this._fundsAvailableToBet) {
            this.calculatateFundsAllowedToBet();
        }
    }

    set riskLevel(val) { this._riskLevel = val; }
    set schedules(val) { this._schedules = val; }

    get schedules() { return this._schedules; }
    get fundsAllowedToBet() { return this._fundsAllowedToBet; }
    get footballApi() { return this._footballApi; }
    get betfairApi() { return this._betfairApi; }

    calculatateFundsAllowedToBet() {
        this._fundsAllowedToBet = (this._fundsAvailableToBet - (this._fundsAvailableToBet * this._percentOfFundsToSave)).toFixed(2);
    }

    initApis() {
        this._betfairApi.initAxios();
        this._footballApi.initAxios();
    }

    async login() {
        const loginClient = new Login(
            process.env.BF_USERNAME,
            process.env.BF_PASSWORD,
            process.env.BF_APP_KEY_DELAY
        );

        process.env.BF_SESSIONTOKEN = await loginClient.login();

        this._betfairApi = new BetfairApi();
    }
}