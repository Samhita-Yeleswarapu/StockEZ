import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

// Auth
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);
export const getProfile = () => API.get("/auth/profile");

// Stocks
export const getAllStocks = () => API.get("/stocks");
export const getStockBySymbol = (symbol) => API.get(`/stocks/${symbol}`);
export const searchStocks = (keyword) => API.get(`/stocks/search/${keyword}`);
export const addStock = (data) => API.post("/stocks", data);
export const updateStock = (id, data) => API.put(`/stocks/${id}`, data);
export const deleteStock = (id) => API.delete(`/stocks/${id}`);

// Trade
export const buyStock = (data) => API.post("/trade/buy", data);
export const sellStock = (data) => API.post("/trade/sell", data);
export const getTransactionHistory = () => API.get("/trade/history");

// Portfolio
export const getPortfolio = () => API.get("/portfolio");
export const getPortfolioSummary = () => API.get("/portfolio/summary");

// Admin
export const getAdminStats = () => API.get("/admin/stats");
export const getAllUsers = () => API.get("/admin/users");
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const getAllTransactions = () => API.get("/admin/transactions");
