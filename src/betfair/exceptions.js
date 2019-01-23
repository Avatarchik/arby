function checkIfCanBeResurrected() {
    return true;
}

export function handleApiException() {
    try {
		switch (error.code) {
			// MarketFilter has too little restrictions
			case "TOO_MUCH_DATA":
				// console.log(error);
				// marketFilter.addFilter(bettingApi);
				// await placeBets()
				break;
			case "INSUFFICIENT_FUNDS":
				// Inform user...AWS SES?
				break;
			default:
				break;
		}
	} catch(err) {
		fixApiCall(err);
	}
}