import React, { useState, useEffect } from "react";
import { getTransactionHistory } from "../services/api";
import "./Transactions.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    getTransactionHistory()
      .then((res) => setTransactions(res.data.transactions))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "ALL" ? transactions : transactions.filter((t) => t.type === filter);

  const totalBuyAmount = transactions.filter((t) => t.type === "BUY").reduce((s, t) => s + t.totalAmount, 0);
  const totalSellAmount = transactions.filter((t) => t.type === "SELL").reduce((s, t) => s + t.totalAmount, 0);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Trade History</h1>
        <p>All your buy and sell transactions</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Total Trades</div>
          <div className="stat-value">{transactions.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Bought</div>
          <div className="stat-value" style={{ fontSize: "1.2rem" }}>₹{totalBuyAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Sold</div>
          <div className="stat-value" style={{ fontSize: "1.2rem" }}>₹{totalSellAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</div>
        </div>
      </div>

      <div className="tx-filter">
        {["ALL", "BUY", "SELL"].map((f) => (
          <button
            key={f}
            className={`sector-tab ${filter === f ? "active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-spinner">Loading history...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "60px", color: "var(--text-muted)" }}>
          <p style={{ fontSize: "2rem", marginBottom: 10 }}>📋</p>
          <p>No transactions found.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Stock</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx._id}>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      {new Date(tx.createdAt).toLocaleString("en-IN", {
                        day: "2-digit", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td>
                      <div className="mono" style={{ color: "var(--accent-blue)", fontWeight: 500 }}>
                        {tx.stockId?.symbol || "—"}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        {tx.stockId?.companyName || ""}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${tx.type.toLowerCase()}`}>{tx.type}</span>
                    </td>
                    <td className="mono">{tx.quantity}</td>
                    <td className="mono">₹{tx.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td className={`mono ${tx.type === "BUY" ? "negative" : "positive"}`}>
                      {tx.type === "BUY" ? "-" : "+"}₹{tx.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
