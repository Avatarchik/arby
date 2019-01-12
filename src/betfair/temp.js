function test(funds) {
    const prices = [1.45, 1.54, 1.63, 1.78].sort();
    const sum = prices.reduce((acc, price) => acc + price, 0);

    let priceToBet;
    let percentage;
    let pricesToBet = [];
    let amountsToBet;

    // guarentees order from low to high as want to put most money on lowest...
    for (let i = 0; i < prices.length; i++) {
        percentage = Math.round(prices[i] / sum * 100);
        priceToBet = (funds * (percentage / 100)).toFixed(2);

        pricesToBet.push(priceToBet);
    }
    amountsToBet = pricesToBet.reverse();

    for (let i = 0; i < prices.length; i++) {
        console.log({
            price: prices[i],
            bet: amountsToBet[i]
        });
    }
}

test(72);