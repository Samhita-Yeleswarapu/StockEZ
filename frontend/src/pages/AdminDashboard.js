import React, { useState, useEffect } from "react";
import {
  getAdminStats, getAllUsers, deleteUser,
  getAllTransactions, getAllStocks, addStock, updateStock, deleteStock
} from "../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import "./AdminDashboard.css";

const TABS = ["Overview", "Users", "Stocks", "Transactions"];

const AdminDashboard = () => {
  const [tab, setTab] = useState("Overview");
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stocks, setStocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockForm, setStockForm] = useState({ symbol: "", companyName: "", currentPrice: "", sector: "", marketCap: "", description: "" });
  const [editingStock, setEditingStock] = useState(null);
  const [formMsg, setFormMsg] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, u, st, tx] = await Promise.all([
          getAdminStats(), getAllUsers(), getAllStocks(), getAllTransactions()
        ]);
        setStats(s.data.stats);
        setUsers(u.data.users);
        setStocks(st.data.stocks);
        setTransactions(tx.data.transactions);
      } catch {}
      setLoading(false);
    };
    fetchAll();
  }, []);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleDeleteStock = async (id) => {
    if (!window.confirm("Delete this stock?")) return;
    try {
      await deleteStock(id);
      setStocks(stocks.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete stock");
    }
  };

  const handleStockSubmit = async (e) => {
    e.preventDefault();
    setFormMsg(null);
    try {
      const payload = {
        ...stockForm,
        currentPrice: parseFloat(stockForm.currentPrice),
        marketCap: parseFloat(stockForm.marketCap) || 0,
      };
      if (editingStock) {
        const res = await updateStock(editingStock._id, payload);
        setStocks(stocks.map((s) => s._id === editingStock._id ? res.data.stock : s));
        setFormMsg({ type: "success", text: "Stock updated." });
      } else {
        const res = await addStock(payload);
        setStocks([...stocks, res.data.stock]);
        setFormMsg({ type: "success", text: "Stock added." });
      }
      setStockForm({ symbol: "", companyName: "", currentPrice: "", sector: "", marketCap: "", description: "" });
      setEditingStock(null);
    } catch (err) {
      setFormMsg({ type: "error", text: err.response?.data?.message || "Failed." });
    }
  };

  const startEdit = (stock) => {
    setEditingStock(stock);
    setStockForm({
      symbol: stock.symbol,
      companyName: stock.companyName,
      currentPrice: stock.currentPrice,
      sector: stock.sector,
      marketCap: stock.marketCap || "",
      description: stock.description || "",
    });
    setFormMsg(null);
    setTab("Stocks");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const chartData = stats ? [
    { name: "Users", value: stats.totalUsers },
    { name: "Stocks", value: stats.totalStocks },
    { name: "Buys", value: stats.buyTrades },
    { name: "Sells", value: stats.sellTrades },
  ] : [];

  if (loading) return <div className="loading-spinner">Loading admin dashboard...</div>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Admin Dashboard</h1>
        <p>Manage users, stocks, and monitor all platform activity</p>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t} className={`admin-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>

      {tab === "Overview" && stats && (
        <>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-label">Total Users</div><div className="stat-value">{stats.totalUsers}</div></div>
            <div className="stat-card"><div className="stat-label">Total Stocks</div><div className="stat-value">{stats.totalStocks}</div></div>
            <div className="stat-card"><div className="stat-label">Total Trades</div><div className="stat-value">{stats.totalTransactions}</div></div>
            <div className="stat-card"><div className="stat-label">Buy Orders</div><div className="stat-value positive">{stats.buyTrades}</div></div>
            <div className="stat-card"><div className="stat-label">Sell Orders</div><div className="stat-value negative">{stats.sellTrades}</div></div>
          </div>

          <div className="card">
            <h3 className="section-title">Platform Overview</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={40}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: "var(--text-secondary)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "var(--text-muted)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8 }}
                  labelStyle={{ color: "var(--text-primary)" }}
                />
                <Bar dataKey="value" fill="var(--accent-blue)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {tab === "Users" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Balance</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{u.email}</td>
                    <td><span className={`badge badge-${u.role.toLowerCase()}`}>{u.role}</span></td>
                    <td className="mono positive">₹{u.balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      {u.role !== "ADMIN" && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(u._id)}>Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "Stocks" && (
        <div className="admin-stocks-layout">
          <div className="card stock-form-card">
            <h3 className="section-title">{editingStock ? "Edit Stock" : "Add New Stock"}</h3>
            {formMsg && <div className={formMsg.type === "success" ? "success-msg" : "error-msg"}>{formMsg.text}</div>}
            <form onSubmit={handleStockSubmit}>
              <div className="form-group">
                <label>Symbol</label>
                <input value={stockForm.symbol} onChange={e => setStockForm({ ...stockForm, symbol: e.target.value })} placeholder="RELIANCE" required disabled={!!editingStock} />
              </div>
              <div className="form-group">
                <label>Company Name</label>
                <input value={stockForm.companyName} onChange={e => setStockForm({ ...stockForm, companyName: e.target.value })} placeholder="Reliance Industries" required />
              </div>
              <div className="form-group">
                <label>Current Price (₹)</label>
                <input type="number" value={stockForm.currentPrice} onChange={e => setStockForm({ ...stockForm, currentPrice: e.target.value })} placeholder="2450.00" required min="0" step="0.01" />
              </div>
              <div className="form-group">
                <label>Sector</label>
                <input value={stockForm.sector} onChange={e => setStockForm({ ...stockForm, sector: e.target.value })} placeholder="Energy" required />
              </div>
              <div className="form-group">
                <label>Market Cap (₹)</label>
                <input type="number" value={stockForm.marketCap} onChange={e => setStockForm({ ...stockForm, marketCap: e.target.value })} placeholder="1000000000" min="0" />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={stockForm.description} onChange={e => setStockForm({ ...stockForm, description: e.target.value })} placeholder="Brief description..." rows={3} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button type="submit" className="btn btn-primary">{editingStock ? "Update" : "Add Stock"}</button>
                {editingStock && (
                  <button type="button" className="btn btn-secondary" onClick={() => { setEditingStock(null); setStockForm({ symbol: "", companyName: "", currentPrice: "", sector: "", marketCap: "", description: "" }); setFormMsg(null); }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Company</th>
                    <th>Sector</th>
                    <th>Price</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((s) => (
                    <tr key={s._id}>
                      <td className="mono" style={{ color: "var(--accent-blue)" }}>{s.symbol}</td>
                      <td>{s.companyName}</td>
                      <td style={{ color: "var(--text-secondary)" }}>{s.sector}</td>
                      <td className="mono">₹{s.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                      <td>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => startEdit(s)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDeleteStock(s._id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "Transactions" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>User</th>
                  <th>Stock</th>
                  <th>Type</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                      {new Date(tx.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{tx.userId?.name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>{tx.userId?.email}</div>
                    </td>
                    <td className="mono" style={{ color: "var(--accent-blue)" }}>{tx.stockId?.symbol}</td>
                    <td><span className={`badge badge-${tx.type.toLowerCase()}`}>{tx.type}</span></td>
                    <td className="mono">{tx.quantity}</td>
                    <td className="mono">₹{tx.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
                    <td className="mono">₹{tx.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</td>
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

export default AdminDashboard;
