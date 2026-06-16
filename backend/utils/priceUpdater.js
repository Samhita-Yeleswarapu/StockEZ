import { StockModel } from "../models/Stock.js";
import { fetchLiveQuote } from "../config/stockApi.js";

// How often to run the update cycle (ms)
const UPDATE_INTERVAL_MS = 60 * 1000; // every 60 seconds

// Fallback: simulate a small random price drift when Finnhub returns nothing
// (e.g. API key missing, rate limit hit, or symbol not on Finnhub)
const simulatePriceDrift = (currentPrice) => {
  const changePct = (Math.random() - 0.48) * 0.8; // -0.38% to +0.32%, slight upward bias
  const newPrice = currentPrice * (1 + changePct / 100);
  return parseFloat(Math.max(newPrice, currentPrice * 0.5).toFixed(2));
};

// Try Finnhub first; fall back to simulation if it fails
const getUpdatedPrice = async (symbol, currentPrice) => {
  const hasFinnhubKey = !!process.env.STOCK_API_KEY;

  if (hasFinnhubKey) {
    const quote = await fetchLiveQuote(symbol);
    // Finnhub returns { c: currentPrice, ... }; c===0 means symbol not found
    if (quote && quote.c && quote.c > 0) {
      return parseFloat(quote.c.toFixed(2));
    }
  }

  // No key, or Finnhub returned nothing — use simulation
  return simulatePriceDrift(currentPrice);
};

// Main update loop
export const startPriceUpdater = async () => {
  console.log("📊 Price updater started — interval:", UPDATE_INTERVAL_MS / 1000, "s");

  const runUpdate = async () => {
    try {
      const stocks = await StockModel.find({}, "symbol currentPrice");
      if (!stocks.length) return;

      const updates = await Promise.all(
        stocks.map(async (stock) => {
          const newPrice = await getUpdatedPrice(stock.symbol, stock.currentPrice);
          return { id: stock._id, symbol: stock.symbol, oldPrice: stock.currentPrice, newPrice };
        })
      );

      // Bulk write for efficiency
      const bulkOps = updates.map(({ id, newPrice }) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { currentPrice: newPrice } },
        },
      }));

      await StockModel.bulkWrite(bulkOps);

      const changed = updates.filter((u) => u.oldPrice !== u.newPrice);
      if (changed.length) {
        console.log(`[PriceUpdater] Updated ${changed.length} stock(s):`,
          changed.map((u) => `${u.symbol} ${u.oldPrice}→${u.newPrice}`).join(", ")
        );
      }
    } catch (err) {
      console.error("[PriceUpdater] Error during update cycle:", err.message);
    }
  };

  // Run once immediately on startup, then on interval
  await runUpdate();
  setInterval(runUpdate, UPDATE_INTERVAL_MS);
};