# Database Schema

The application uses a **hybrid database architecture**:
- **MySQL (TiDB Cloud)** — Transactional data (users, products, orders, cart, payments)
- **MongoDB Atlas** — Reward transaction ledger (append-only event log)

---

## MySQL / TiDB Tables

### `users`

Stores user accounts and authentication data.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | |
| `name` | VARCHAR(255) | NULLABLE | User's full name |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Login identifier |
| `password_hash` | VARCHAR(255) | NOT NULL | bcrypt hash |
| `role` | ENUM('ADMIN','CUSTOMER') | NOT NULL, DEFAULT 'CUSTOMER' | Access control |
| `reward_points` | INT | DEFAULT 0 | Denormalized balance |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE | |

**Indexes:** `email` (UNIQUE), `id` (PRIMARY)

---

### `products`

Stores product catalog.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | |
| `name` | VARCHAR(255) | NOT NULL | |
| `description` | TEXT | NULLABLE | |
| `price` | DECIMAL(10,2) | NOT NULL | |
| `stock` | INT | NOT NULL | Current inventory |
| `sku` | VARCHAR(100) | NOT NULL | Stock keeping unit |
| `is_active` | TINYINT(1) / BOOLEAN | DEFAULT TRUE | Soft delete flag |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE | |

**Indexes:** `id` (PRIMARY), `is_active` (for filtering)

---

### `carts`

One cart per user.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | |
| `user_id` | INT | UNIQUE, NOT NULL | FK → `users.id` |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE | |

**Relationships:** `user_id` → `users.id`

---

### `cart_items`

Items within a cart.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | |
| `cart_id` | INT | NOT NULL | FK → `carts.id` |
| `product_id` | INT | NOT NULL | FK → `products.id` |
| `quantity` | INT | NOT NULL | |

**Relationships:** `cart_id` → `carts.id`, `product_id` → `products.id`

---

### `orders`

Order records with status tracking.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | |
| `user_id` | INT | NOT NULL | FK → `users.id` |
| `total_amount` | DECIMAL(10,2) | NOT NULL | |
| `status` | ENUM | NOT NULL, DEFAULT 'PAYMENT_PENDING' | See below |
| `points_redeemed` | INT | DEFAULT 0 | Points used for discount |
| `discount_amount` | DECIMAL(10,2) | DEFAULT 0 | Monetary discount from points |
| `payment_expires_at` | DATETIME | NULLABLE | 5 minutes after creation |
| `paid_at` | DATETIME | NULLABLE | Timestamp of payment |
| `processed_at` | DATETIME | NULLABLE | Timestamp of processing |
| `shipped_at` | DATETIME | NULLABLE | Timestamp of shipping |
| `delivered_at` | DATETIME | NULLABLE | Timestamp of delivery |
| `cancelled_at` | DATETIME | NULLABLE | Timestamp of cancellation |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE | |

**Status ENUM:**
```
'PAYMENT_PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED',
'CANCELLED', 'FAILED', 'PAYMENT_EXPIRED'
```

**Relationships:** `user_id` → `users.id`

---

### `order_items`

Individual line items within an order.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | |
| `order_id` | INT | NOT NULL | FK → `orders.id` |
| `product_id` | INT | NOT NULL | FK → `products.id` |
| `product_name` | VARCHAR(255) | NOT NULL | Denormalized |
| `product_price` | DECIMAL(10,2) | NOT NULL | Denormalized |
| `quantity` | INT | NOT NULL | |
| `subtotal` | DECIMAL(10,2) | NOT NULL | quantity × price |

**Relationships:** `order_id` → `orders.id`, `product_id` → `products.id`

---

### `payments`

Payment records linked to orders.

| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | |
| `order_id` | INT | NOT NULL | FK → `orders.id` |
| `user_id` | INT | NOT NULL | FK → `users.id` |
| `amount` | DECIMAL(10,2) | NOT NULL | |
| `provider` | VARCHAR(50) | DEFAULT 'STRIPE' | |
| `status` | ENUM('PENDING','SUCCESS','FAILED','REFUNDED') | NOT NULL, DEFAULT 'PENDING' | |
| `provider_session_id` | VARCHAR(255) | NULLABLE | Stripe session ID |
| `provider_payment_id` | VARCHAR(255) | NULLABLE | Stripe payment intent ID |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP ON UPDATE | |

**Relationships:** `order_id` → `orders.id`, `user_id` → `users.id`

---

## MongoDB Collections

### `rewardtransactions`

Append-only ledger of all reward point movements.

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | MongoDB auto-generated |
| `userId` | Number | Yes | References `users.id` |
| `orderId` | Number | No | References `orders.id` |
| `points` | Number | Yes | Positive for EARN, negative for REDEEM |
| `type` | String | Yes | `EARN`, `REDEEM`, `REFUND`, or `ADJUSTMENT` |
| `description` | String | No | Free-text description |
| `createdAt` | Date | auto | Via Mongoose timestamps |
| `updatedAt` | Date | auto | Via Mongoose timestamps |

**Indexes:** `{ userId: 1, type: 1 }`, `{ orderId: 1, type: 1 }`

---

## Entity Relationships

```
users (1) ────────── (N) orders
users (1) ────────── (N) payments
users (1) ────────── (1) carts
users (1) ────────── (N) rewardtransactions (MongoDB, logical)

orders (1) ───────── (N) order_items
orders (1) ───────── (N) payments

products (1) ─────── (N) order_items
products (1) ─────── (N) cart_items

carts (1) ────────── (N) cart_items
```

## Enum Values Summary

| Context | Values |
|---------|--------|
| `users.role` | `ADMIN`, `CUSTOMER` |
| `orders.status` | `PAYMENT_PENDING`, `PAID`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `FAILED`, `PAYMENT_EXPIRED` |
| `payments.status` | `PENDING`, `SUCCESS`, `FAILED`, `REFUNDED` |
| `rewardtransactions.type` | `EARN`, `REDEEM`, `REFUND`, `ADJUSTMENT` |
