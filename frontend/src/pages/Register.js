import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/api";
import { useAuth } from "../context/AuthContext";
import "./Auth.css";

const BALANCE_OPTIONS = [
  { label: "₹50,000", value: 50000 },
  { label: "₹1,00,000", value: 100000, default: true },
  { label: "₹5,00,000", value: 500000 },
  { label: "₹10,00,000", value: 1000000 },
];

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "", initialBalance: 100000 });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, initialBalance: form.initialBalance });
      // Auto-login after registration
      const { default: axios } = await import("axios");
      const loginRes = await axios.post("http://localhost:5000/api/auth/login", {
        email: form.email,
        password: form.password,
      });
      loginUser(loginRes.data.token, loginRes.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-logo">📈</div>
          <h1>Create account</h1>
          <p>Choose your starting virtual balance — free</p>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="John Doe"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {/* Initial Balance Selector */}
          <div className="form-group">
            <label>Starting Virtual Balance</label>
            <div className="balance-options">
              {BALANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`balance-opt-btn ${form.initialBalance === opt.value ? "selected" : ""}`}
                  onClick={() => setForm({ ...form, initialBalance: opt.value })}
                >
                  {opt.label}
                  {opt.default && <span className="opt-default">Default</span>}
                </button>
              ))}
            </div>
            <p className="balance-hint">
              This is virtual money — choose any amount to practice trading.
            </p>
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in →</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
