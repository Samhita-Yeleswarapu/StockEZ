import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getPortfolio, getPortfolioSummary } from "../services/api";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import "./Portfolio.css";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#84cc16"];

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [portRes, sumRes] = await Promise.all([getPortfolio(), getPortfolioSummary()]);
        setPortfolio(portRes.data.portfolio);
        setSummary(sumRes.data.summary);
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) return <div className="loading-spinner">Loading portfolio...</div>;

  const holdings = portfolio?.holdings || [];
  const chartData = holdings.map((h) => ({
    name: h.stockId?.symbol || "Unknown",
    value: parseFloat((h.stockId?.currentPrice * h.quantity).toFixed(2)),
  }));

  const pnlPositive = summary?.profitLoss >= 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>My Portfolio</h1>
        <p>Track your holdings and overall performance</p>
      </div>

      {summary && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Cash Balance</div>
            <div className="stat-value">₹{summary.balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Invested</div>
            <div className="stat-value">₹{summary.invested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Current Value</div>
            <div className="stat-value">₹{summary.currentValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total P&L</div>
            <div className={`stat-value ${pnlPositive ? "positive" : "negative"}`}>
              {pnlPositive ? "+" : ""}₹{summary.profitLoss.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Holdings</div>
            <div className="stat-value">{summary.totalHoldings}</div>
          </div>
        </div>
      )}

      {holdings.length === 0 ? (
        <div className="card empty-portfolio">
          <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📭</div>
          <h3>No holdings yet</h3>
          <p>Start trading to build your portfolio.</p>
          <Link to="/market" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Market</Link>
        </div>
      ) : (
        <div className="portfolio-layout">
          <div className="holdings-table card">
            <h3 className="section-title">Holdings</h3>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Stock</th>
                    <th>Qty</th>
                    <th>Avg Price</th>
                    <th>Current Price</th>
                    <th>Value</th>
                    <th>P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((h, i) => {
                    const stock = h.stockId;
                    if (!stock) return null;
                    const currentVal = stock.currentPrice * h.quantity;
                    const invested = h.averagePrice * h.quantity;
                    const pnl = currentVal - invested;
                    const pnlPct = ((pnl / invested) * 100).toFixed(2);
                    return (
                      <tr key={i}>
                        <td>
                          <Link to={`/stocks/${stock.symbol}`} className="holding-link">
                            <div className="holding-symbol">{stock.symbol}</div>
                            <div className="holding-company">{stock.companyName}</div>
                          </Link>
                        </td>
                        <td className="mono">{h.quantity}</td>
                        <td className="mono">₹{h.averagePrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="mono">₹{stock.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className="mono">₹{currentVal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                        <td className={`mono ${pnl >= 0 ? "positive" : "negative"}`}>
                          {pnl >= 0 ? "+" : ""}₹{pnl.toFixed(2)}<br />
                          <span style={{ fontSize: "0.75rem" }}>({pnlPct}%)</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {chartData.length > 0 && (
            <div className="card portfolio-chart-card">
              <h3 className="section-title">Allocation</h3>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`₹${val.toLocaleString("en-IN")}`, "Value"]}
                    contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="chart-legend">
                {chartData.map((d, i) => (
                  <div key={i} className="legend-item">
                    <span className="legend-dot" style={{ background: COLORS[i % COLORS.length] }} />
                    <span>{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Portfolio;
