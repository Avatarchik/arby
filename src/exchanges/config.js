export default class ExchangeConfig {
    constructor() {
        this._defaultLocale = "en";
        this._defaultCurrency = "GBP";
        this._defaultCountryCode = "GB";
        this._percentageOfBalanceToSave = 0;
        this._sportsToUse = [
            "Soccer",
            // "Horse Racing",
            // "Tennis",
            // "Basketball"
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

    get percentageOfBalanceToSave() {
        return this._percentageOfBalanceToSavel
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

    set percentageOfBalanceToSave(val) {
        this._percentageOfBalanceToSave = val;
    }
}