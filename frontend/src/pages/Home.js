import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const Home = () => {
  const { user } = useAuth();

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge">Virtual Stock Trading Platform</div>
          <h1 className="hero-title">
            Trade Smarter.<br />
            <span className="hero-accent">Grow Faster.</span>
          </h1>
          <p className="hero-desc">
            ShopEZ Markets gives you a virtual ₹1,00,000 to practice stock trading.
            Buy, sell, track your portfolio, and sharpen your investment instincts — risk-free.
          </p>
          <div className="hero-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">Go to Dashboard →</Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary">Start Trading Free</Link>
                <Link to="/login" className="btn btn-secondary">Sign In</Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="features">
        <div className="page-container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Live Market Overview</h3>
              <p>Browse real-time stock listings across sectors. Search by symbol or company name instantly.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Buy & Sell</h3>
              <p>Execute trades in seconds with your virtual balance. No delays, no fees, no risk.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💼</div>
              <h3>Portfolio Tracking</h3>
              <p>Monitor your holdings, average buy price, and profit/loss in one clean dashboard.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📋</div>
              <h3>Full Trade History</h3>
              <p>Every transaction logged — date, price, quantity. See exactly how your decisions played out.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="page-container">
          <div className="cta-card">
            <h2>Start with ₹1,00,000 virtual cash</h2>
            <p>No real money, real learning. Create your account and begin trading in under a minute.</p>
            {!user && (
              <Link to="/register" className="btn btn-primary">Create Free Account</Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
