import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { getAllStocks, searchStocks } from "../services/api";
import "./Market.css";

const POLL_INTERVAL = 30000; // 30 seconds

const Market = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");
  const [searching, setSearching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [priceChanges, setPriceChanges] = useState({}); // track flashing
  const prevPricesRef = useRef({});
  const searchRef = useRef("");

  const fetchStocks = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const res = await getAllStocks();
      const newStocks = res.data.stocks || [];

      // Detect price changes for flash animation
      const changes = {};
      newStocks.forEach((s) => {
        const prev = prevPricesRef.current[s._id];
        if (prev !== undefined && prev !== s.currentPrice) {
          changes[s._id] = s.currentPrice > prev ? "up" : "down";
        }
        prevPricesRef.current[s._id] = s.currentPrice;
      });
      if (Object.keys(changes).length > 0) {
        setPriceChanges(changes);
        setTimeout(() => setPriceChanges({}), 1200);
      }

      setStocks(newStocks);
      setLastUpdated(new Date());
    } catch {
      if (!silent) setStocks([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Initial load + polling
  useEffect(() => {
    fetchStocks();
    const interval = setInterval(() => {
      if (!searchRef.current.trim()) fetchStocks(true);
    }, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchStocks]);

  const handleSearch = async (e) => {
    const val = e.target.value;
    setSearch(val);
    searchRef.current = val;
    if (!val.trim()) { fetchStocks(); return; }
    setSearching(true);
    try {
      const res = await searchStocks(val);
      setStocks(res.data.stocks || []);
    } catch {
      setStocks([]);
    } finally {
      setSearching(false);
    }
  };

  const sectors = ["All", ...new Set(stocks.map((s) => s.sector).filter(Boolean))];
  const filtered = sector === "All" ? stocks : stocks.filter((s) => s.sector === sector);

  const formatCap = (n) => {
    if (!n) return "—";
    if (n >= 1e12) return `₹${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `₹${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)}Cr`;
    return `₹${n.toLocaleString()}`;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Market Overview</h1>
          <p>{stocks.length} stocks available for trading</p>
        </div>
        <div className="market-meta">
          {lastUpdated && (
            <span className="live-badge">
              🟢 Live · Updated {lastUpdated.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
          <button className="refresh-btn" onClick={() => fetchStocks()} title="Refresh">↻ Refresh</button>
        </div>
      </div>

      <div className="market-controls">
        <input
          className="market-search"
          type="text"
          placeholder="Search by symbol or company..."
          value={search}
          onChange={handleSearch}
        />
        <div className="sector-tabs">
          {sectors.map((s) => (
            <button
              key={s}
              className={`sector-tab ${sector === s ? "active" : ""}`}
              onClick={() => setSector(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading || searching ? (
        <div className="loading-spinner">Loading stocks...</div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span>🔍</span>
          <p>No stocks found{search ? ` for "${search}"` : ""}.</p>
        </div>
      ) : (
        <div className="stocks-grid">
          {filtered.map((stock) => {
            const flash = priceChanges[stock._id];
            return (
              <Link
                to={`/stocks/${stock.symbol}`}
                key={stock._id}
                className={`stock-card ${flash ? `price-flash-${flash}` : ""}`}
              >
                <div className="stock-card-header">
                  <div>
                    <div className="stock-symbol">{stock.symbol}</div>
                    <div className="stock-name">{stock.companyName}</div>
                  </div>
                  <div className="stock-price">
                    ₹{stock.currentPrice.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                    {flash && (
                      <span className={`price-arrow ${flash}`}>{flash === "up" ? " ▲" : " ▼"}</span>
                    )}
                  </div>
                </div>
                <div className="stock-card-footer">
                  <span className="stock-sector">{stock.sector}</span>
                  <span className="stock-cap">{formatCap(stock.marketCap)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Market;
