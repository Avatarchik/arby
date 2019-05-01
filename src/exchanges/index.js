const { betfairInit } = require("./betfair")
const { matchbookInit } = require("./matchbook")

module.exports = {
	init_betfair: betfairInit,
	init_matchbook: matchbookInit
}
