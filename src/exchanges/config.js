export default class ExchangeConfig {
	constructor() {
		this._defaultLocale = "en"
		this._defaultCurrency = "GBP"
		this._defaultCountryCode = "GB"
		this._percentageOfBalanceToSave = 0
		this._betOnOdds = true
		this._betOnSpread = true
		// The Asian Single Line doesn't seem to return anything important...
		// For football, for example, it returns runners such as:
		// - 1 goals or more
		// - 2 goal or more
		//
		// I can already do this using TOTAL types of Under/Over halves or HANDICAP types of Under/Over quarters
		this._betOnAsianHandicapSingleLine = false
		this._betOnAsianHandicapDoubleLine = true
		this._sportsToUse = [
			"Soccer"
			// "Horse Racing",                  There is currently no point with Horse Racing, as there will never be a market backing with only 2 runners
			// 								   	For this to work, you would have to incorporate LAY betting as well
			// "Tennis",
			// "Basketball"
			// "Rugby Union",
			// "Rugby League"
			// "Golf",
			// "Cricket",
			// "Baseball",
			// "American Football",
			// "Snooker",
			// "Boxing",
			// "Cycling"
		]
	}

	get defaultLocale() {
		return this._defaultLocale
	}

	get defaultCurrency() {
		return this._defaultCurrency
	}

	get defaultCountryCode() {
		return this._defaultCountryCode
	}

	get sportsToUse() {
		return this._sportsToUse
	}

	get percentageOfBalanceToSave() {
		return this._percentageOfBalanceToSavel
	}

	get betOnOdds() {
		return this._betOnOdds
	}

	get betOnSpread() {
		return this._betOnSpread
	}

	get betOnAsianHandicapSingleLine() {
		return this._betOnAsianHandicapSingleLine
	}

	get betOnAsianHandicapDoubleLine() {
		return this._betOnAsianHandicapDoubleLine
	}

	set defaultLocale(val) {
		this._defaultLocale = val
	}

	set defaultCurrency(val) {
		this._defaultLocale = val
	}

	set defaultCountryCode(val) {
		this._defaultCountryCode = val
	}

	set sportsToUse(val) {
		this._sportsToUse = val
	}

	set percentageOfBalanceToSave(val) {
		this._percentageOfBalanceToSave = val
	}

	set betOnOdds(val) {
		this._betOnOdds = val
	}

	set betOnSpread(val) {
		this._betOnSpread = val
	}

	set betOnAsianHandicapSingleLine(val) {
		this._betOnAsianHandicapSingleLine = val
	}

	set betOnAsianHandicapDoubleLine(val) {
		this._betOnAsianHandicapDoubleLine = val
	}
}
