import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📈</span>
          <span className="brand-name">ShopEZ</span>
          <span className="brand-sub">Markets</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          {user ? (
            <>
              <Link to="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>Home</Link>
              <Link to="/market" className={`nav-link ${isActive("/market") ? "active" : ""}`}>Market</Link>
              <Link to="/portfolio" className={`nav-link ${isActive("/portfolio") ? "active" : ""}`}>Portfolio</Link>
              <Link to="/transactions" className={`nav-link ${isActive("/transactions") ? "active" : ""}`}>History</Link>
              {user.role === "ADMIN" && (
                <Link to="/admin" className={`nav-link ${isActive("/admin") ? "active" : ""}`}>Admin</Link>
              )}
              <div className="nav-divider" />
              <div className="nav-user">
                <span className="nav-balance">₹{user.balance?.toLocaleString("en-IN", { maximumFractionDigits: 2 })}</span>
                <span className="nav-username">{user.name}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary btn-sm">Sign In</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>

        <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
