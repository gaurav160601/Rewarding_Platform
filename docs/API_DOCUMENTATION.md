# API Documentation

Base URL: `http://localhost:5000/api`

All endpoints return JSON responses with the format:

```json
{
  "success": true,
  "data": { ... }
}
```

On error:

```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Authentication

### POST /auth/register

Create a new user account.

**Auth:** None

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "userId": 1 }
}
```

**Errors:**
- `400` — `email already exists`

---

### POST /auth/login

Authenticate and receive a JWT token.

**Auth:** None

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "token": "eyJhbGciOiJIUzI1NiIs..." }
}
```

**Errors:**
- `400` — `Invalid credentials`

---

### GET /auth/profile

Get authenticated user's profile information.

**Auth:** JWT (any role)

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john@example.com",
    "role": "CUSTOMER",
    "name": "John Doe",
    "reward_points": 1500,
    "created_at": "2026-01-15T10:30:00.000Z"
  }
}
```

**Errors:**
- `401` — Invalid/missing token
- `404` — User not found

---

## Products

### GET /products

List all active products (paginated).

**Auth:** None

**Query Parameters:**
- `page` (optional, default: `1`)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Premium Headphones",
      "description": "High-quality wireless headphones",
      "price": "2999.00",
      "stock": 50,
      "sku": "PH-001",
      "is_active": 1,
      "created_at": "2026-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### GET /products/search

Search products by name.

**Auth:** None

**Query Parameters:**
- `q` — Search keyword

**Response (200):** Same as product list.

---

### GET /products/:id

Get a single product by ID.

**Auth:** None

**Response (200):** Single product object.

**Errors:**
- `400` — `Product not found`

---

### POST /products

Create a new product.

**Auth:** Admin JWT

**Request Body:**
```json
{
  "name": "New Product",
  "description": "Description",
  "price": 999,
  "stock": 100,
  "sku": "NP-001"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "productId": 10 }
}
```

---

### PUT /products/:id

Update an existing product.

**Auth:** Admin JWT

**Request Body:** Same as create (all fields optional).

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Product updated successfully" }
}
```

**Errors:**
- `400` — `Product not found`

---

### DELETE /products/:id

Soft-delete a product (sets `is_active = FALSE`).

**Auth:** Admin JWT

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Product deleted successfully" }
}
```

**Errors:**
- `400` — `Product not found`

---

## Cart

### GET /cart

Get current user's cart with items.

**Auth:** JWT

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cartId": 1,
    "items": [
      {
        "productId": 1,
        "name": "Premium Headphones",
        "price": 2999,
        "quantity": 2,
        "subtotal": 5998
      }
    ],
    "total": 5998
  }
}
```

---

### POST /cart/items

Add an item to the cart.

**Auth:** JWT

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { "itemId": 5, "message": "Item added to cart" }
}
```

**Errors:**
- `400` — `Product not found`, `Product is not available`, `Insufficient stock`

---

### PUT /cart/items/:productId

Update item quantity.

**Auth:** JWT

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Cart item updated" }
}
```

**Errors:**
- `400` — `Cart not found`, `Item not found in cart`, `Insufficient stock`

---

### DELETE /cart/items/:productId

Remove an item from the cart.

**Auth:** JWT

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Item removed from cart" }
}
```

---

### DELETE /cart

Clear all items from the cart.

**Auth:** JWT

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Cart cleared successfully" }
}
```

---

## Orders

### POST /orders/checkout

Create a new order from the current cart.

**Auth:** JWT

**Request Body:**
```json
{
  "redeemPoints": 500
}
```

`redeemPoints` is optional (defaults to 0).

**Response (201):**
```json
{
  "success": true,
  "data": {
    "orderId": 42,
    "totalAmount": 2999,
    "discountAmount": 500,
    "finalAmount": 2499,
    "message": "Order placed successfully"
  }
}
```

If an existing PAYMENT_PENDING order is found (within expiry):
```json
{
  "success": true,
  "data": {
    "orderId": 42,
    "totalAmount": 2999,
    "discountAmount": 500,
    "finalAmount": 2499,
    "message": "Existing pending order found"
  }
}
```

**Errors:**
- `400` — `Cart not found`, `Cart is empty`, `Insufficient reward points`, `Insufficient stock`

---

### GET /orders

Get all orders for the current user (admins see all orders).

**Auth:** JWT

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 42,
      "user_id": 1,
      "total_amount": "2999.00",
      "status": "PAID",
      "points_redeemed": 500,
      "discount_amount": "500.00",
      "payment_expires_at": "2026-01-15T10:35:00.000Z",
      "paid_at": "2026-01-15T10:32:00.000Z",
      "created_at": "2026-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### GET /orders/:id

Get a single order with its items.

**Auth:** JWT (user's own order or admin)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "user_id": 1,
    "total_amount": "2999.00",
    "status": "PAID",
    "points_redeemed": 500,
    "discount_amount": "500.00",
    "payment_expires_at": "2026-01-15T10:35:00.000Z",
    "paid_at": "2026-01-15T10:32:00.000Z",
    "created_at": "2026-01-15T10:30:00.000Z",
    "items": [
      {
        "id": 1,
        "order_id": 42,
        "product_id": 1,
        "product_name": "Premium Headphones",
        "product_price": "2999.00",
        "quantity": 1,
        "subtotal": "2999.00"
      }
    ]
  }
}
```

**Errors:**
- `400` — `Order not found`

---

### PUT /orders/:id/process

Move order from PAID to PROCESSING.

**Auth:** Admin JWT

**Response (200):** Updated order object.

**Errors:**
- `400` — `Order not found`, `Only paid orders can be processed`

---

### PUT /orders/:id/ship

Move order from PROCESSING to SHIPPED.

**Auth:** Admin JWT

**Response (200):** Updated order object.

**Errors:**
- `400` — `Order not found`, `Only processing orders can be shipped`

---

### PUT /orders/:id/deliver

Move order from SHIPPED to DELIVERED.

**Auth:** Admin JWT

**Response (200):** Updated order object.

**Errors:**
- `400` — `Order not found`, `Only shipped orders can be delivered`

---

### PUT /orders/:id/cancel

Cancel an order (customers and admins).

**Auth:** JWT

**Response (200):**
```json
{
  "success": true,
  "data": { "message": "Order cancelled successfully" }
}
```

**Behavior:**
- Restores product stock
- Refunds redeemed reward points with REFUND transaction
- Sets `cancelled_at` timestamp

**Allowed statuses:** PAYMENT_PENDING, PAID, PROCESSING

**Errors:**
- `400` — `Order not found`, `Order can no longer be cancelled.`

---

## Payments

### POST /payments/create-session

Create a Stripe Checkout session for an order.

**Auth:** JWT

**Request Body:**
```json
{
  "orderId": 42
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "paymentId": 10,
    "sessionId": "cs_test_...",
    "checkoutUrl": "https://checkout.stripe.com/pay/cs_test_..."
  }
}
```

For zero-amount orders (fully paid by points):
```json
{
  "success": true,
  "data": {
    "paymentId": null,
    "sessionId": null,
    "checkoutUrl": null,
    "message": "Order paid with points. No payment needed."
  }
}
```

**Errors:**
- `400` — `Order not found`

---

### POST /payments/retry/:orderId

Retry payment for an expired/failed PAYMENT_PENDING order.

**Auth:** JWT

**Response (200):** Same as create-session response.

**Errors:**
- `400` — `Order not found`, `Order does not belong to this user`, `Only PAYMENT_PENDING orders can be retried`, `Payment session expired. Please place a new order.`, `One or more items are no longer available.`

---

### POST /payments/webhook

Stripe webhook endpoint for processing completed checkouts.

**Auth:** None (uses Stripe signature verification)

**Headers:** `stripe-signature: <webhook-signature>`

**Response (200):**
```json
{
  "received": true
}
```

**Behavior:**
- Verifies Stripe webhook signature
- On `checkout.session.completed`: updates payment to SUCCESS, updates order to PAID with `paid_at`, queues reward job

---

## Rewards

### GET /rewards/balance

Get current reward points balance.

**Auth:** JWT

**Response (200):**
```json
{
  "success": true,
  "data": { "reward_points": 1500 }
}
```

---

### GET /rewards/history

Get reward transaction history.

**Auth:** JWT

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "65a...",
      "userId": 1,
      "orderId": 42,
      "points": 100,
      "type": "EARN",
      "description": "Earned 100 points from Order #42",
      "createdAt": "2026-01-15T10:35:00.000Z"
    }
  ]
}
```

Transaction types: `EARN`, `REDEEM`, `REFUND`

---

### POST /rewards/redeem

Redeem reward points (standalone redemption).

**Auth:** JWT

**Request Body:**
```json
{
  "points": 500
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { "reward_points": 1000 }
}
```

**Errors:**
- `400` — `Insufficient reward points`

---

## Admin

### GET /admin/dashboard

Get overview statistics.

**Auth:** Admin JWT

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalUsers": 100,
    "totalProducts": 50,
    "totalOrders": 200,
    "totalRevenue": 500000,
    "totalRewardTransactions": 350
  }
}
```

---

### GET /admin/users

Get all users.

**Auth:** Admin JWT

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "email": "user@example.com", "role": "CUSTOMER" }
  ]
}
```

---

### GET /admin/analytics

Get analytics data (order status distribution, top products, recent orders).

**Auth:** Admin JWT

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ordersByStatus": {
      "PAID": 45,
      "DELIVERED": 80,
      "PROCESSING": 30,
      "SHIPPED": 25,
      "CANCELLED": 20
    },
    "topProducts": [
      { "id": 1, "name": "Premium Headphones", "sales": 150 }
    ],
    "recentOrders": [
      {
        "id": 100,
        "user_id": 5,
        "status": "DELIVERED",
        "total_amount": "2999.00",
        "created_at": "2026-06-23T10:00:00.000Z"
      }
    ]
  }
}
```

---

## Health

### GET /health

Check server status.

**Auth:** None

**Response (200):**
```json
{
  "success": true,
  "message": "Server running"
}
```
