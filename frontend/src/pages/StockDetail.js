import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStockBySymbol, buyStock, sellStock, getPortfolio, getProfile } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import "./StockDetail.css";

// Generate realistic mock historical price data from a current price
const generatePriceHistory = (currentPrice, days = 30) => {
  const data = [];
  let price = currentPrice * (0.85 + Math.random() * 0.1); // start 5-15% lower
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const change = (Math.random() - 0.48) * 0.025 * price; // slight upward bias
    price = Math.max(price + change, currentPrice * 0.5);
    if (i === 0) price = currentPrice; // last point is current
    data.push({
      date: date.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      price: parseFloat(price.toFixed(2)),
    });
  }
  return data;
};

const CHART_RANGES = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
];

const StockDetail = () => {
  const { symbol } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [stock, setStock] = useState(null);
  const [holding, setHolding] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [tradeType, setTradeType] = useState("BUY");
  const [loading, setLoading] = useState(true);
  const [tradeLoading, setTradeLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [chartRange, setChartRange] = useState(CHART_RANGES[1]);
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const stockRes = await getStockBySymbol(symbol);
        const s = stockRes.data.stock;
        setStock(s);
        setChartData(generatePriceHistory(s.currentPrice, chartRange.days));
        const portRes = await getPortfolio();
        const h = portRes.data.portfolio.holdings.find(
          (h) => h.stockId?.symbol === symbol
        );
        setHolding(h || null);
      } catch {
        navigate("/market");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [symbol, navigate]); // eslint-disable-line

  // Regenerate chart when range changes
  useEffect(() => {
    if (stock) {
      setChartData(generatePriceHistory(stock.currentPrice, chartRange.days));
    }
  }, [chartRange, stock]);

  const refreshBalance = async () => {
    try {
      const res = await getProfile();
      setUser(res.data.user);
    } catch {}
  };

  const handleTrade = async () => {
    if (quantity < 1) return;
    setTradeLoading(true);
    setMessage(null);
    try {
      const payload = { stockId: stock._id, quantity: Number(quantity) };
      if (tradeType === "BUY") {
        await buyStock(payload);
        setMessage({ type: "success", text: `✅ Bought ${quantity} share(s) of ${stock.symbol}` });
      } else {
        await sellStock(payload);
        setMessage({ type: "success", text: `✅ Sold ${quantity} share(s) of ${stock.symbol}` });
      }
      await refreshBalance();
      const portRes = await getPortfolio();
      const h = portRes.data.portfolio.holdings.find(
        (h) => h.stockId?.symbol === symbol
      );
      setHolding(h || null);
      setQuantity(1);
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Trade failed." });
    } finally {
      setTradeLoading(false);
    }
  };

  if (loading) return <div className="loading-spinner">Loading stock data...</div>;
  if (!stock) return null;

  const totalCost = (stock.currentPrice * quantity).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const pnl = holding
    ? ((stock.currentPrice - holding.averagePrice) * holding.quantity)
    : null;
  const pnlPct = holding
    ? (((stock.currentPrice - holding.averagePrice) / holding.averagePrice) * 100).toFixed(2)
    : null;

  const chartMin = chartData.length ? Math.min(...chartData.map(d => d.price)) * 0.995 : 0;
  const chartMax = chartData.length ? Math.max(...chartData.map(d => d.price)) * 1.005 : 0;
  const chartStart = chartData[0]?.price ?? 0;
  const chartEnd = chartData[chartData.length - 1]?.price ?? 0;
  const chartPositive = chartEnd >= chartStart;

  return (
    <div className="page-container">
      <button className="back-btn" onClick={() => navigate("/market")}>← Back to Market</button>

      <div className="stock-detail-layout">
        <div className="stock-detail-main">
          {/* Header */}
          <div className="stock-detail-header card">
            <div className="sdh-top">
              <div>
                <div className="sd-symbol">{stock.symbol}</div>
                <div className="sd-name">{stock.companyName}</div>
                <span className="stock-sector" style={{ display: "inline-block", marginTop: 8 }}>{stock.sector}</span>
              </div>
              <div className="sd-price-block">
                <div className="sd-price">₹{stock.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</div>
                <div className={`sd-change ${chartPositive ? "positive" : "negative"}`}>
                  {chartPositive ? "▲" : "▼"} {Math.abs(((chartEnd - chartStart) / chartStart) * 100).toFixed(2)}% ({chartRange.label})
                </div>
                <div className="sd-price-label">Current Price</div>
              </div>
            </div>

            {stock.description && (
              <p className="sd-desc">{stock.description}</p>
            )}

            <div className="sd-stats">
              <div className="sd-stat">
                <span className="sd-stat-label">Market Cap</span>
                <span className="sd-stat-value mono">
                  {stock.marketCap ? `₹${(stock.marketCap / 1e7).toFixed(2)} Cr` : "—"}
                </span>
              </div>
              <div className="sd-stat">
                <span className="sd-stat-label">Listed Since</span>
                <span className="sd-stat-value">
                  {new Date(stock.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "short" })}
                </span>
              </div>
            </div>
          </div>

          {/* Price Chart */}
          <div className="card chart-card">
            <div className="chart-header">
              <h3>Price History</h3>
              <div className="chart-range-tabs">
                {CHART_RANGES.map((r) => (
                  <button
                    key={r.label}
                    className={`chart-range-btn ${chartRange.label === r.label ? "active" : ""}`}
                    onClick={() => setChartRange(r)}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="chart-summary">
              <span className={`chart-pct ${chartPositive ? "positive" : "negative"}`}>
                {chartPositive ? "+" : ""}{(((chartEnd - chartStart) / chartStart) * 100).toFixed(2)}%
              </span>
              <span className="chart-period-label">over {chartRange.label}</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  interval={Math.floor(chartData.length / 5)}
                />
                <YAxis
                  domain={[chartMin, chartMax]}
                  tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`}
                  width={70}
                />
                <Tooltip
                  formatter={(val) => [`₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`, "Price"]}
                  contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13 }}
                  labelStyle={{ color: "var(--text-secondary)" }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke={chartPositive ? "var(--accent-green)" : "var(--accent-red)"}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Holding */}
          {holding && (
            <div className="card holding-card">
              <h3>Your Position</h3>
              <div className="holding-stats">
                <div className="holding-stat">
                  <span className="hs-label">Shares Owned</span>
                  <span className="hs-value mono">{holding.quantity}</span>
                </div>
                <div className="holding-stat">
                  <span className="hs-label">Avg Buy Price</span>
                  <span className="hs-value mono">₹{holding.averagePrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="holding-stat">
                  <span className="hs-label">Current Value</span>
                  <span className="hs-value mono">₹{(stock.currentPrice * holding.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="holding-stat">
                  <span className="hs-label">P&L</span>
                  <span className={`hs-value mono ${pnl >= 0 ? "positive" : "negative"}`}>
                    {pnl >= 0 ? "+" : ""}₹{pnl.toFixed(2)} ({pnlPct}%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Trade Panel */}
        <div className="trade-panel card">
          <h3>Place Order</h3>

          <div className="trade-type-toggle">
            <button
              className={`trade-type-btn ${tradeType === "BUY" ? "buy-active" : ""}`}
              onClick={() => setTradeType("BUY")}
            >
              Buy
            </button>
            <button
              className={`trade-type-btn ${tradeType === "SELL" ? "sell-active" : ""}`}
              onClick={() => setTradeType("SELL")}
            >
              Sell
            </button>
          </div>

          {message && (
            <div className={message.type === "success" ? "success-msg" : "error-msg"}>
              {message.text}
            </div>
          )}

          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              max={tradeType === "SELL" ? holding?.quantity : undefined}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          {/* Quick quantity buttons */}
          {tradeType === "SELL" && holding && (
            <div className="quick-qty">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  className="quick-qty-btn"
                  onClick={() => setQuantity(Math.max(1, Math.floor(holding.quantity * pct / 100)))}
                >
                  {pct}%
                </button>
              ))}
            </div>
          )}

          <div className="trade-summary">
            <div className="trade-row">
              <span>Price per share</span>
              <span className="mono">₹{stock.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="trade-row">
              <span>Quantity</span>
              <span className="mono">{quantity}</span>
            </div>
            <div className="trade-row trade-total">
              <span>Total {tradeType === "BUY" ? "Cost" : "Return"}</span>
              <span className="mono">₹{totalCost}</span>
            </div>
            <div className="trade-row">
              <span>Available Balance</span>
              <span className="mono positive">₹{user?.balance?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <button
            className={`btn ${tradeType === "BUY" ? "btn-success" : "btn-danger"} trade-submit`}
            onClick={handleTrade}
            disabled={tradeLoading || (tradeType === "SELL" && (!holding || quantity > holding.quantity))}
          >
            {tradeLoading ? "Processing..." : `${tradeType} ${quantity} Share${quantity > 1 ? "s" : ""}`}
          </button>

          {tradeType === "SELL" && !holding && (
            <p className="trade-note">You don't own any shares of {stock.symbol}.</p>
          )}

          {/* Order Info */}
          <div className="order-info">
            <div className="oi-row"><span className="oi-label">Order Type</span><span>Market Order</span></div>
            <div className="oi-row"><span className="oi-label">Execution</span><span>Instant</span></div>
            <div className="oi-row"><span className="oi-label">Brokerage</span><span className="positive">₹0 (Free)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
