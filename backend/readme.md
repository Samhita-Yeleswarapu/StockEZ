# ShopEZ Markets - Backend

Backend REST API for **ShopEZ Markets**, a virtual stock trading platform where users can simulate stock market investments, build portfolios, track profits/losses, and practice trading without risking real money.

Built with **Node.js**, **Express.js**, **MongoDB**, and **JWT Authentication**.

---

## Features

### User Features
- User Registration & Login
- JWT-based Authentication
- Secure Password Hashing using bcryptjs
- View User Profile
- Virtual Wallet with Initial Balance
- Buy & Sell Stocks
- Track Portfolio Holdings
- View Transaction History
- Profit & Loss Calculation

### Stock Market Features
- Stock Listing Management
- Search Stocks by Symbol or Company Name
- Real-Time Stock Price Updates via Finnhub API
- Simulated Price Updates when API is unavailable
- Portfolio Valuation Based on Current Prices

### Admin Features
- Add, Update, and Delete Stocks
- View Platform Statistics
- Manage Users
- Monitor All Transactions

---

# Tech Stack

| Category | Technology |
|-----------|------------|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT |
| Password Security | bcryptjs |
| Stock Market Data | Finnhub API |
| Environment Variables | dotenv |
| Background Jobs | Custom Price Polling Service |

---

# Project Structure

```bash
backend/
│
├── config/
│   ├── db.js
│   └── stockApi.js
│
├── controllers/
│   ├── authController.js
│   ├── stockController.js
│   ├── tradeController.js
│   ├── portfolioController.js
│   └── adminController.js
│
├── middleware/
│   ├── verifyToken.js
│   ├── verifyAdmin.js
│   └── errorHandler.js
│
├── models/
│   ├── User.js
│   ├── Stock.js
│   ├── Portfolio.js
│   └── Transaction.js
│
├── routes/
│   ├── authRoutes.js
│   ├── stockRoutes.js
│   ├── tradeRoutes.js
│   ├── portfolioRoutes.js
│   └── adminRoutes.js
│
├── utils/
│   ├── generateToken.js
│   ├── calculatePnL.js
│   └── priceUpdater.js
│
├── .env
├── package.json
└── server.js
```

---

# Installation & Setup

## 1. Clone the Repository

```bash
git clone <repository-url>
cd backend
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Configure Environment Variables

Create a `.env` file in the root directory.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
STOCK_API_KEY=your_finnhub_api_key
```

### Environment Variables

| Variable | Description |
|-----------|-------------|
| PORT | Server Port |
| MONGO_URI | MongoDB Connection String |
| JWT_SECRET | Secret Key for JWT |
| STOCK_API_KEY | Finnhub API Key |

## 4. Run the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

Server runs at:

```bash
http://localhost:5000
```

---

# Live Stock Price Updater

A background service automatically updates stock prices.

### Workflow

1. Runs every 60 seconds
2. Fetches all stocks from MongoDB
3. Retrieves latest prices from Finnhub
4. Updates stock prices in bulk
5. Falls back to simulated market fluctuations if API data is unavailable

### Fallback Simulation

```text
Price Change Range:
-0.8% to +0.8%
```

---

# Security Features

- JWT Authentication
- Password Hashing using bcryptjs
- Protected Routes Middleware
- Admin Authorization Middleware
- Environment Variable Protection
- Centralized Error Handling

