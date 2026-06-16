import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPortfolioSummary, getAllStocks } from "../services/api";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [topStocks, setTopStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, stockRes] = await Promise.all([
          getPortfolioSummary(),
          getAllStocks(),
        ]);
        setSummary(sumRes.data.summary);
        // Show top 6 stocks by market cap
        const sorted = [...(stockRes.data.stocks || [])].sort(
          (a, b) => (b.marketCap || 0) - (a.marketCap || 0)
        );
        setTopStocks(sorted.slice(0, 6));
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const pnl = summary?.profitLoss ?? 0;
  const pnlPositive = pnl >= 0;

  return (
    <div className="dashboard-page page-container">
      {/* Welcome Banner */}
      <div className="dashboard-welcome card">
        <div className="dw-left">
          <div className="dw-greeting">{greeting}, {user?.name?.split(" ")[0]} 👋</div>
          <h1 className="dw-title">Welcome to ShopEZ Markets</h1>
          <p className="dw-desc">
            Your virtual trading platform. Practice with real market data — zero risk, real skills.
            Browse stocks, build your portfolio, and track your performance.
          </p>
          <div className="dw-actions">
            <Link to="/market" className="btn btn-primary">🏪 Go to Markets</Link>
            <Link to="/portfolio" className="btn btn-secondary">📊 View Portfolio</Link>
          </div>
        </div>
        <div className="dw-balance-box">
          <div className="dw-bal-label">Available Balance</div>
          <div className="dw-bal-value">
            ₹{(user?.balance ?? 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
          {summary && (
            <div className={`dw-pnl ${pnlPositive ? "positive" : "negative"}`}>
              {pnlPositive ? "▲" : "▼"} ₹{Math.abs(pnl).toLocaleString("en-IN", { maximumFractionDigits: 0 })} P&L
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      {summary && !loading && (
        <div className="dashboard-stats">
          <div className="ds-card">
            <span className="ds-icon">💰</span>
            <div>
              <div className="ds-label">Cash Balance</div>
              <div className="ds-value">₹{summary.balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
            </div>
          </div>
          <div className="ds-card">
            <span className="ds-icon">📈</span>
            <div>
              <div className="ds-label">Invested</div>
              <div className="ds-value">₹{summary.invested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
            </div>
          </div>
          <div className="ds-card">
            <span className="ds-icon">💼</span>
            <div>
              <div className="ds-label">Portfolio Value</div>
              <div className="ds-value">₹{summary.currentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
            </div>
          </div>
          <div className="ds-card">
            <span className="ds-icon">{pnlPositive ? "🟢" : "🔴"}</span>
            <div>
              <div className="ds-label">Total P&L</div>
              <div className={`ds-value ${pnlPositive ? "positive" : "negative"}`}>
                {pnlPositive ? "+" : ""}₹{pnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="dashboard-section">
        <h2 className="section-title">How It Works</h2>
        <div className="how-grid">
          <div className="how-card">
            <div className="how-step">1</div>
            <div className="how-icon">🏦</div>
            <h3>Virtual Balance</h3>
            <p>You start with ₹1,00,000 in virtual cash — no real money involved.</p>
          </div>
          <div className="how-card">
            <div className="how-step">2</div>
            <div className="how-icon">🔍</div>
            <h3>Browse Stocks</h3>
            <p>Explore stocks by sector, search by name or symbol, view price charts.</p>
          </div>
          <div className="how-card">
            <div className="how-step">3</div>
            <div className="how-icon">⚡</div>
            <h3>Trade Instantly</h3>
            <p>Buy and sell shares at current prices. Trades execute immediately.</p>
          </div>
          <div className="how-card">
            <div className="how-step">4</div>
            <div className="how-icon">📊</div>
            <h3>Track Performance</h3>
            <p>Monitor your P&L, holdings, and full transaction history.</p>
          </div>
        </div>
      </div>

      {/* Top Stocks Preview */}
      {topStocks.length > 0 && (
        <div className="dashboard-section">
          <div className="section-header-row">
            <h2 className="section-title">Featured Stocks</h2>
            <Link to="/market" className="see-all-link">See all →</Link>
          </div>
          <div className="featured-stocks-grid">
            {topStocks.map((stock) => (
              <Link to={`/stocks/${stock.symbol}`} key={stock._id} className="featured-stock-card card">
                <div className="fsc-top">
                  <div>
                    <div className="fsc-symbol">{stock.symbol}</div>
                    <div className="fsc-name">{stock.companyName}</div>
                  </div>
                  <div className="fsc-price">
                    ₹{stock.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="fsc-bottom">
                  <span className="stock-sector">{stock.sector}</span>
                  <span className="fsc-trade-hint">Trade →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Options Info */}
      <div className="dashboard-section">
        <h2 className="section-title">Trading Options Available</h2>
        <div className="options-grid">
          <div className="option-card card">
            <div className="opt-icon">📦</div>
            <h3>Market Orders</h3>
            <p>Buy or sell at the current market price. Instant execution, no waiting.</p>
            <div className="opt-tag">Available Now</div>
          </div>
          <div className="option-card card">
            <div className="opt-icon">📉</div>
            <h3>Short Selling</h3>
            <p>Sell shares you currently hold to lock in gains or cut losses.</p>
            <div className="opt-tag">Available Now</div>
          </div>
          <div className="option-card card">
            <div className="opt-icon">📋</div>
            <h3>Portfolio Tracking</h3>
            <p>View all your holdings, average buy price, and real-time P&L in one place.</p>
            <div className="opt-tag">Available Now</div>
          </div>
          <div className="option-card card">
            <div className="opt-icon">📜</div>
            <h3>Transaction History</h3>
            <p>Full log of every trade with date, price, quantity, and type.</p>
            <div className="opt-tag">Available Now</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
