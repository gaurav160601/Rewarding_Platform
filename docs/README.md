# Rewarding Platform

A full-stack loyalty commerce platform where users earn reward points on purchases and redeem them for discounts. Built with React, Node.js, Express, MySQL (TiDB), MongoDB, Redis, and Stripe.

## Features

### Customer Features
- **User Authentication** — Register, login, JWT-based sessions
- **Product Browsing** — View products with stock status, search functionality
- **Shopping Cart** — Add/remove items, update quantities, persistent cart
- **Checkout** — Stripe payment integration with reward point redemption
- **Order Tracking** — Real-time order timeline (Created → Paid → Processing → Shipped → Delivered)
- **Retry Payment** — Retry failed/expired payments within expiry window
- **Cancel Order** — Cancel eligible orders with automatic stock and points refund
- **Reward Points** — Earn 1 point per ₹10 spent, redeem for instant discounts
- **Customer Dashboard** — Account statistics, rewards wallet, order stats, recent activity

### Admin Features
- **Admin Dashboard** — Overview stats (users, products, orders, revenue)
- **Analytics** — Order status distribution (pie chart), top products by sales (bar chart)
- **Product Management** — CRUD operations with form and table view
- **Order Management** — Status transitions (Process, Ship, Deliver, Cancel)
- **User Management** — View all registered users with roles

### Technical Features
- **Double Payment Protection** — Webhook idempotency prevents duplicate payment processing
- **Double Reward Protection** — MongoDB idempotency check prevents duplicate reward credit
- **Payment Expiry** — 5-minute expiry window with automatic stock and points refund
- **Soft Delete** — Products soft-deleted via `is_active` flag
- **Redis Caching** — Product list cached for 5 minutes, invalidated on mutations
- **BullMQ Queue** — Asynchronous reward point calculation with retry

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, React Router 7, Zustand 5, Axios, Recharts 3 |
| Backend | Node.js, Express 4 |
| Database (SQL) | MySQL / TiDB Cloud |
| Database (NoSQL) | MongoDB Atlas |
| Cache / Queue | Redis (via Upstash), BullMQ |
| Payments | Stripe |
| Security | JWT, bcrypt, Helmet |

## Installation

### Prerequisites

- Node.js >= 18
- MySQL / TiDB Cloud database
- MongoDB Atlas cluster
- Redis instance (local or Upstash)
- Stripe account (test mode)

### 1. Clone the repository

```bash
git clone <repository-url>
cd Rewarding_Platform
```

### 2. Backend Setup

```bash
cd backend
cp .env.example .env
npm install
```

Edit `.env` with your credentials (see Environment Variables below).

```bash
# Run database migrations
# Execute SQL files in backend/src/database/migrations/ manually

# Start development server
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

# MySQL / TiDB Cloud
MYSQL_HOST=your-tidb-host
MYSQL_PORT=4000
MYSQL_USER=your-username
MYSQL_PASSWORD=your-password
MYSQL_DATABASE=rewarding_platform

# MongoDB
MONGO_URI=mongodb+srv://your-mongo-uri

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Folder Structure

```
Rewarding_Platform/
├── backend/
│   ├── server.js
│   ├── package.json
│   └── src/
│       ├── app.js
│       ├── config/
│       ├── constants/
│       ├── controllers/
│       ├── database/
│       │   └── migrations/
│       ├── middleware/
│       ├── models/
│       ├── queues/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       ├── validators/
│       └── workers/
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── api/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       └── store/
└── docs/
    ├── README.md
    ├── architecture.md
    ├── API_DOCUMENTATION.md
    └── DATABASE_SCHEMA.md
```

## API Summary

| Group | Endpoints | Auth |
|-------|-----------|------|
| Auth | Register, Login, Profile | Public / JWT |
| Products | List, Search, Get, Create, Update, Delete | Public / Admin |
| Cart | Get, Add Item, Update, Remove, Clear | JWT |
| Orders | Checkout, List, Get, Process, Ship, Deliver, Cancel | JWT / Admin |
| Payments | Create Session, Retry, Webhook | JWT / Public |
| Rewards | Balance, History, Redeem | JWT |
| Admin | Dashboard, Users, Analytics | Admin |

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for full details.

## Running the Application

### Start Backend
```bash
cd backend
npm run dev
```
Server starts on `http://localhost:5000`.

### Start Frontend
```bash
cd frontend
npm run dev
```
App opens at `http://localhost:5173`.

### Stripe Webhook (Local Development)
```bash
stripe listen --forward-to localhost:5000/api/payments/webhook
```

## Future Enhancements

- Email notifications for order status changes
- Admin reward balance management
- Payment history page
- Coupon/discount code system
- Product image upload
- Paginated product browsing
- Dark mode toggle
- Mobile app
- Multi-currency support
- Wishlist feature

## License

ISC
