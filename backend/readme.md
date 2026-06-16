# 🚀 ShopEZ Markets - Backend

Backend REST API for **ShopEZ Markets**, a virtual stock trading platform where users can simulate stock market investments, build portfolios, track profits/losses, and practice trading without risking real money.

Built with **Node.js**, **Express.js**, **MongoDB**, and **JWT Authentication**.

---

## 📌 Features

### 👤 User Features
- User Registration & Login
- JWT-based Authentication
- Secure Password Hashing using bcryptjs
- View User Profile
- Virtual Wallet with Initial Balance
- Buy & Sell Stocks
- Track Portfolio Holdings
- View Transaction History
- Profit & Loss Calculation

### 📈 Stock Market Features
- Stock Listing Management
- Search Stocks by Symbol or Company Name
- Real-Time Stock Price Updates via Finnhub API
- Simulated Price Updates when API is unavailable
- Portfolio Valuation Based on Current Prices

### 🛡️ Admin Features
- Add, Update, and Delete Stocks
- View Platform Statistics
- Manage Users
- Monitor All Transactions

---

# 🛠️ Tech Stack

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

# 📁 Project Structure

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

# ⚙️ Installation & Setup

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

# 🔐 Authentication

Protected routes require a JWT token.

### Header Format

```http
Authorization: Bearer <JWT_TOKEN>
```

---

# 📚 API Documentation

## Authentication Routes

Base Route:

```http
/api/auth
```

### Register User

```http
POST /register
```

#### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "initialBalance": 100000
}
```

#### Response

```json
{
  "success": true,
  "message": "Registration Successful",
  "token": "jwt_token"
}
```

---

### Login User

```http
POST /login
```

#### Request Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Response

```json
{
  "success": true,
  "token": "jwt_token",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "balance": 100000
  }
}
```

---

### Get User Profile

```http
GET /profile
```

Authentication Required ✅

---

# 📈 Stock Routes

Base Route:

```http
/api/stocks
```

### Get All Stocks

```http
GET /
```

### Search Stocks

```http
GET /search/:keyword
```

Example:

```http
GET /search/TCS
```

### Get Single Stock

```http
GET /:symbol
```

Example:

```http
GET /RELIANCE
```

### Add New Stock

```http
POST /
```

Admin Only ✅

#### Request Body

```json
{
  "symbol": "TCS",
  "companyName": "Tata Consultancy Services",
  "currentPrice": 3450.75,
  "sector": "IT",
  "marketCap": 1260000000000,
  "description": "India's largest IT services company."
}
```

### Update Stock

```http
PUT /:id
```

Admin Only ✅

### Delete Stock

```http
DELETE /:id
```

Admin Only ✅

---

# 💰 Trading Routes

Base Route:

```http
/api/trade
```

Authentication Required ✅

### Buy Stock

```http
POST /buy
```

#### Request Body

```json
{
  "stockId": "stock_id",
  "quantity": 5
}
```

#### Response

```json
{
  "success": true,
  "message": "Stock purchased successfully",
  "balance": 82750
}
```

### Sell Stock

```http
POST /sell
```

#### Request Body

```json
{
  "stockId": "stock_id",
  "quantity": 2
}
```

### Transaction History

```http
GET /history
```

Returns all BUY and SELL transactions for the authenticated user.

---

# 📊 Portfolio Routes

Base Route:

```http
/api/portfolio
```

Authentication Required ✅

### Get Portfolio Holdings

```http
GET /
```

### Portfolio Summary

```http
GET /summary
```

#### Response

```json
{
  "success": true,
  "summary": {
    "balance": 82750,
    "invested": 17253.75,
    "currentValue": 18200,
    "profitLoss": 946.25,
    "totalHoldings": 1
  }
}
```

---

# 👨‍💼 Admin Routes

Base Route:

```http
/api/admin
```

Admin Authentication Required ✅

### Platform Statistics

```http
GET /stats
```

Returns:
- Total Users
- Total Transactions
- Trading Volume
- Platform Analytics

### Get All Users

```http
GET /users
```

### Delete User

```http
DELETE /users/:id
```

### Get All Transactions

```http
GET /transactions
```

---

# 🗄️ Database Models

## User Model

```js
{
  name: String,
  email: String,
  password: String,
  role: "USER" | "ADMIN",
  balance: Number
}
```

## Stock Model

```js
{
  symbol: String,
  companyName: String,
  currentPrice: Number,
  sector: String,
  marketCap: Number,
  description: String
}
```

## Portfolio Model

```js
{
  userId: ObjectId,
  holdings: [
    {
      stockId: ObjectId,
      quantity: Number,
      averagePrice: Number
    }
  ]
}
```

## Transaction Model

```js
{
  userId: ObjectId,
  stockId: ObjectId,
  type: "BUY" | "SELL",
  quantity: Number,
  price: Number,
  totalAmount: Number,
  createdAt: Date
}
```

---

# 🔄 Live Stock Price Updater

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

# 🔒 Security Features

- JWT Authentication
- Password Hashing using bcryptjs
- Protected Routes Middleware
- Admin Authorization Middleware
- Environment Variable Protection
- Centralized Error Handling

---

# ❌ Error Response Format

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Status Codes

| Code | Meaning |
|--------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 500 | Internal Server Error |

---

# 🚀 Future Enhancements

- Watchlist Functionality
- Stock Charts & Historical Data
- Market News Integration
- Leaderboard System
- Trading Competitions
- Email Notifications
- Two-Factor Authentication (2FA)
- Advanced Portfolio Analytics

---

# 👨‍💻 Author

Developed as part of the **ShopEZ Markets Virtual Stock Trading Platform** using the MERN stack ecosystem.

⭐ If you found this project useful, consider giving the repository a star.
