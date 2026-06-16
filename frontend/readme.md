# ShopEZ Markets — Frontend

Frontend application for the ShopEZ Markets virtual stock trading platform. Built with React, Vite, Bootstrap, Chart.js, and Zustand.

---

## Overview

ShopEZ Markets is a virtual stock trading platform that allows users to:

- Register and login securely
- Explore stocks and market trends
- View live stock prices
- Buy and sell stocks using a virtual balance
- Track portfolio performance
- View transaction history
- Access admin management features

The frontend communicates with the Express + MongoDB backend through REST APIs.

---

## Tech Stack

| Layer | Technology |
|---------|------------|
| Framework | React.js |
| Build Tool | Vite |
| Routing | React Router DOM |
| State Management | Zustand |
| HTTP Client | Axios |
| UI Framework | Bootstrap 5 |
| Charts | Chart.js + React ChartJS 2 |
| Authentication | JWT |

---

## Project Structure

```text
src
│
├── api
│   ├── axiosInstance.js
│   ├── authApi.js
│   ├── stockApi.js
│   ├── tradeApi.js
│   ├── portfolioApi.js
│   └── transactionApi.js
│
├── assets
│
├── components
│   ├── common
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   │
│   ├── stocks
│   │   ├── StockCard.jsx
│   │   └── StockChart.jsx
│   │
│   └── portfolio
│
├── pages
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Market.jsx
│   ├── StockDetails.jsx
│   ├── Portfolio.jsx
│   ├── Transactions.jsx
│   └── AdminDashboard.jsx
│
├── routes
│   ├── AppRoutes.jsx
│   └── ProtectedRoute.jsx
│
├── store
│   └── authStore.js
│
├── styles
│   └── global.css
│
├── App.jsx
├── main.jsx
└── index.css
```

---

## Features

### Authentication

- User Registration
- User Login
- JWT Authentication
- Protected Routes
- Persistent Login State

### Market Dashboard

- Browse Stocks
- Search Stocks
- View Live Prices
- Featured Stocks
- Real-Time Market Data

### Stock Details

- Company Information
- Live Market Price
- Buy Stocks
- Sell Stocks
- Price Charts

### Portfolio Management

- Current Balance
- Holdings Overview
- Investment Summary
- Profit/Loss Calculation

### Transaction History

- Buy/Sell Records
- Trade Details
- Portfolio Tracking

### Admin Features

- Manage Stocks
- Add New Stocks
- Update Existing Stocks
- Delete Stocks
- Monitor Trading Activity
