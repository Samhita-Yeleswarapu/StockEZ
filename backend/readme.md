# ShopEZ Markets — Backend

REST API for the ShopEZ Markets virtual stock trading platform. Built with Node.js, Express, and MongoDB.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js (ESM modules) |
| Framework | Express.js |
| Database | MongoDB (via Mongoose) |
| Auth | JWT + bcryptjs |
| External API | Finnhub (live stock quotes) |
| Price Updater | Custom polling job (60s interval) |

---

## Project Structure

```
backend/
├── config/
│   ├── db.js               # MongoDB connection
│   └── stockApi.js         # Finnhub API helpers
├── controllers/
│   ├── authController.js   # Register, login, profile
│   ├── stockController.js  # CRUD for stocks
│   ├── tradeController.js  # Buy / sell / history
│   ├── portfolioController.js  # Holdings + summary
│   └── adminController.js  # Admin-only stats & user mgmt
├── middleware/
│   ├── verifyToken.js      # JWT auth guard
│   ├── verifyAdmin.js      # Admin role guard
│   └── errorHandler.js     # Global error handler
├── models/
│   ├── User.js
│   ├── Stock.js
│   ├── Portfolio.js
│   └── Transaction.js
├── routes/
│   ├── authRoutes.js
│   ├── stockRoutes.js
│   ├── tradeRoutes.js
│   ├── portfolioRoutes.js
│   └── adminRoutes.js
├── utils/
│   ├── generateToken.js    # JWT signing
│   ├── calculatePnL.js     # P&L calculation
│   └── priceUpdater.js     # Live price polling job
└── server.js
```

---

## Setup

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Create `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
STOCK_API_KEY=your_finnhub_api_key   # optional — simulation runs if omitted
```

Get a free Finnhub key at https://finnhub.io

### 3. Run

```bash
# Development (auto-restart)
npm run dev

# Production
npm start
```

Server starts on `http://localhost:5000`

---

## API Reference

All protected routes require:
```
Authorization: Bearer <token>
```

---

### Auth — `/api/auth`

#### POST `/register`
Create a new user account.

**Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "initialBalance": 100000
}
```
`initialBalance` is optional — defaults to ₹1,00,000 if omitted.

**Response:**
```json
{ "success": true, "message": "Registration successful", "token": "..." }
```

---

#### POST `/login`
Authenticate an existing user.

**Body:**
```json
{ "email": "jane@example.com", "password": "secret123" }
```

**Response:**
```json
{
  "success": true,
  "token": "...",
  "user": { "id": "...", "name": "Jane Doe", "email": "...", "role": "USER", "balance": 100000 }
}
```

---

#### GET `/profile` 🔒
Get the logged-in user's profile.

**Response:**
```json
{ "success": true, "user": { "name": "...", "email": "...", "balance": 95000, "role": "USER" } }
```

---

### Stocks — `/api/stocks` 🔒

#### GET `/`
Get all stocks.

#### GET `/search/:keyword`
Search stocks by symbol or company name.

#### GET `/:symbol`
Get a single stock by symbol (e.g. `GET /api/stocks/RELIANCE`).

#### POST `/` 🔒 (Admin only)
Add a new stock.

**Body:**
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

#### PUT `/:id` 🔒 (Admin only)
Update stock details (including price).

#### DELETE `/:id` 🔒 (Admin only)
Delete a stock.

---

### Trade — `/api/trade` 🔒

#### POST `/buy`
Buy shares of a stock.

**Body:**
```json
{ "stockId": "mongo_object_id", "quantity": 5 }
```

**Response:**
```json
{ "success": true, "message": "Stock purchased successfully", "balance": 82750.00 }
```

Fails with 400 if balance is insufficient.

---

#### POST `/sell`
Sell shares you own.

**Body:**
```json
{ "stockId": "mongo_object_id", "quantity": 2 }
```

Fails with 400 if you don't own enough shares.

---

#### GET `/history`
Get all transactions for the logged-in user, newest first.

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "type": "BUY",
      "quantity": 5,
      "price": 3450.75,
      "totalAmount": 17253.75,
      "stockId": { "symbol": "TCS", "companyName": "Tata Consultancy Services" },
      "createdAt": "2025-06-10T08:30:00.000Z"
    }
  ]
}
```

---

### Portfolio — `/api/portfolio` 🔒

#### GET `/`
Get all holdings with stock details populated.

#### GET `/summary`
Get a financial summary.

**Response:**
```json
{
  "success": true,
  "summary": {
    "balance": 82750.00,
    "invested": 17253.75,
    "currentValue": 18200.00,
    "profitLoss": 946.25,
    "totalHoldings": 1
  }
}
```

---

### Admin — `/api/admin` 🔒 (Admin role only)

#### GET `/stats`
Platform-wide stats — total users, transactions, volume.

#### GET `/users`
List all registered users.

#### DELETE `/users/:id`
Delete a user account.

#### GET `/transactions`
All transactions across all users.

---

## Data Models

### User
| Field | Type | Default |
|---|---|---|
| name | String | required |
| email | String | required, unique |
| password | String | hashed |
| role | `USER` / `ADMIN` | `USER` |
| balance | Number | 100000 |

### Stock
| Field | Type |
|---|---|
| symbol | String (unique, uppercase) |
| companyName | String |
| currentPrice | Number |
| sector | String |
| marketCap | Number |
| description | String |

### Portfolio
Belongs to one user. Contains an array of holdings: `{ stockId, quantity, averagePrice }`.

Average price is recalculated on each additional buy using weighted average.

### Transaction
Logs every BUY/SELL: `{ userId, stockId, type, quantity, price, totalAmount, createdAt }`.

---

## Live Price Updater

`utils/priceUpdater.js` runs automatically when the server starts.

- Fetches all stocks from DB every **60 seconds**
- Tries **Finnhub** first using `STOCK_API_KEY`
- Falls back to **simulated drift** (±0.8% per cycle) if key is missing or Finnhub returns nothing
- Uses **bulk write** for efficient DB updates
- Logs only changed prices to console

To change the interval, edit `UPDATE_INTERVAL_MS` in `priceUpdater.js`.

---

## Auth Flow

```
Register → JWT returned → store in localStorage
Login    → JWT returned → store in localStorage
All protected requests → send JWT in Authorization header
Token decoded by verifyToken middleware → req.user.userId available
Admin routes also pass through verifyAdmin → checks req.user.role === "ADMIN"
```

---

## Error Responses

All errors follow this shape:
```json
{ "success": false, "message": "Human-readable error description" }
```

Common HTTP codes used: `200`, `201`, `400` (bad input), `401` (no/invalid token), `403` (not admin), `404` (not found), `500` (server error).