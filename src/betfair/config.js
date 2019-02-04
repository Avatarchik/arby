import { BetfairApi, FootballApi } from "../api";
import { Login } from "betfair-js-login";

export default class BetfairConfig {
    constructor() {
        this._minimumBetSize = 2;                    // Set by Betfair Exchange...
        this._defaultLocale = "en";
        this._defaultCountryCode = "GB";
        
        // This value (1-5) is to indicate the amount of risk I want to bet with
        // For the time being I am just betting 'Match Odds' market
        // The LOWER the risk, the CLOSER I bet to match resolution and the HIGHER the difference in the score line I would like it to be
        // Due to, most likely, LOWER odds (1.01) and INCREASED certainty. I can bet higher amounts with more reassurance that the bet will come in
        //
        // On the flip side, the higher
        this._riskLevel = 2;
        // This value represents (in mins) how frequently I should call each API to check the current scores
        // If was only football, I could work on a percentage basis but all sports are not time limited but are score limited
        // There will be a calculation here on the score when it is returned to check more or less frequently depending on how far along the match is
        this._checkFrequency = 20;
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
            process.env.BETFAIR_USERNAME,
            process.env.BETFAIR_PASSWORD,
            process.env.BETFAIR_APP_KEY_DELAY
        );

        process.env.BETFAIR_SESSIONTOKEN = await loginClient.login();

        this._betfairApi = new BetfairApi();
    }
}