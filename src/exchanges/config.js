export default class ExchangeConfig {
    constructor() {
        this._defaultLocale = "en";
        this._defaultCurrency = "GBP";
        this._defaultCountryCode = "GB";
        this._sportsToUse = [
            "Soccer",
            "Horse Racing",
            "Tennis",
            "Basketball"
        ];
    }

    get defaultLocale() {
        return this._defaultLocale;
    }

    get defaultCurrency() {
        return this._defaultCurrency;
    }

    get defaultCountryCode() {
        return this._defaultCountryCode;
    }

    get sportsToUse() {
        return this._sportsToUse;
    }

    set defaultLocale(val) {
        this._defaultLocale = val;
    }

    set defaultCurrency(val) {
        this._defaultLocale = val;
    }

    set defaultCountryCode(val) {
        this._defaultCountryCode = val;
    }

    set sportsToUse(val) {
        this._sportsToUse = val;
    }
}