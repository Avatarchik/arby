const getAccountFunds = {
	id: "/getAccountFunds",
	type: "object",
	properties: {
		wallet: {
			$ref: "/Wallet"
		}
	}
}

const getAccountDetails = {
	id: "/getAccountDetails",
	type: "object",
	properties: {}
}

const getDeveloperAppKeys = {
	id: "/getDeveloperAppKeys",
	type: "object",
	properties: {}
}

const getAccountStatement = {
	id: "/getAccountStatement",
	type: "object",
	properties: {
		locale: {
			type: "string"
		},
		fromRecord: {
			type: "number"
		},
		recordCount: {
			type: "number"
		},
		itemDateRange: {
			$ref: "/TimeRange"
		},
		includeItem: {
			$ref: "/IncludeItem"
		},
		wallet: {
			$ref: "/Wallet"
		}
	}
}

module.exports = {
	getAccountFunds,
	getAccountDetails,
	getAccountStatement,
	getDeveloperAppKeys
}
