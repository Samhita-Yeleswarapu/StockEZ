export const calculatePnL = (holdings) => {
  let invested = 0;
  let currentValue = 0;

  for (const holding of holdings) {
    const stock = holding.stockId;
    if (!stock) continue;
    invested += holding.averagePrice * holding.quantity;
    currentValue += stock.currentPrice * holding.quantity;
  }

  return {
    invested,
    currentValue,
    profitLoss: currentValue - invested,
  };
};
