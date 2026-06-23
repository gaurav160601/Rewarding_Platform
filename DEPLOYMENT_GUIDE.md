# Deployment Guide

## Overview

Three deployable services:

| Service | Type | Default Port |
|---------|------|-------------|
| Backend | Node.js / Express REST API | 5000 |
| GraphQL Gateway | Apollo Server 4 | 4000 |
| Frontend | React + Vite SPA | 5173 (dev) / static files (prod) |

---

# Environment Variables

## Backend (`backend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `production` or `development` |
| `PORT` | No | Server port (default: 5000) |
| `MYSQL_HOST` | Yes | TiDB Cloud host |
| `MYSQL_PORT` | Yes | TiDB Cloud port (default: 4000) |
| `MYSQL_USER` | Yes | TiDB Cloud user |
| `MYSQL_PASSWORD` | Yes | TiDB Cloud password |
| `MYSQL_DATABASE` | Yes | Database name (`ecommerce`) |
| `MONGO_URI` | Yes | MongoDB Atlas connection string |
| `REDIS_HOST` | Yes | Upstash Redis host |
| `REDIS_PORT` | Yes | Upstash Redis port |
| `REDIS_PASSWORD` | Yes* | Upstash Redis password |
| `REDIS_TLS` | No | Set `true` for Upstash (TLS required) |
| `JWT_SECRET` | Yes | Random string — must match gateway |
| `JWT_EXPIRES_IN` | No | Token expiry (default: `7d`) |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (sk_live or sk_test) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `CLIENT_URL` | Yes | Frontend URL (for Stripe redirects) |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |
| `RESEND_API_KEY` | No* | Resend API key for email (skip = log only) |
| `EMAIL_FROM` | No | Sender email address |

## GraphQL Gateway (`graphql-gateway/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 4000) |
| `BACKEND_API_URL` | Yes | Backend REST API base URL (e.g. `https://backend.example.com/api`) |
| `JWT_SECRET` | Yes | Must match backend `JWT_SECRET` |
| `CORS_ORIGINS` | No | Comma-separated allowed origins |
| `NODE_ENV` | No | Set `production` to disable GraphQL introspection |

## Frontend (`frontend/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend REST API URL (e.g. `https://backend.example.com/api`) |
| `VITE_GRAPHQL_URL` | Yes | GraphQL Gateway URL (e.g. `https://gateway.example.com/graphql`) |

---

# External Services Setup

## TiDB Cloud (MySQL)

1. Create a [TiDB Cloud](https://tidbcloud.com) Serverless cluster.
2. Under **Security → IP Access List**, add `0.0.0.0/0` (public access) or restrict to your deploy IPs.
3. Get connection details: host, port (4000), user, password.
4. Set SSL/TLS to **Enabled** in your connection settings.

## MongoDB Atlas

1. Create a [MongoDB Atlas](https://cloud.mongodb.com) cluster (M0 free tier is sufficient).
2. Under **Security → Database Access**, create a database user.
3. Under **Security → Network Access**, add your deployment IP or `0.0.0.0/0` for public access.
4. Get your connection string: `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority&appName=<app>`

## Upstash Redis

1. Create a [Upstash](https://upstash.com) Redis database.
2. Get the endpoint details:
   - `REDIS_HOST` — e.g. `us1-adequate-lion-12345.upstash.io`
   - `REDIS_PORT` — usually `6379`
   - `REDIS_PASSWORD` — the auto-generated password
3. Set `REDIS_TLS=true` (Upstash requires TLS).
4. In `backend/.env`:
   ```
   REDIS_HOST=us1-adequate-lion-12345.upstash.io
   REDIS_PORT=6379
   REDIS_PASSWORD=your-password
   REDIS_TLS=true
   ```

## Stripe

1. Create a [Stripe](https://stripe.com) account.
2. Get API keys from **Dashboard → Developers → API keys**.
3. Set up webhook endpoint in **Dashboard → Developers → Webhooks**:
   - **Endpoint URL**: `https://your-backend.com/api/payments/webhook`
   - **Events to listen for**: `checkout.session.completed`
   - Copy the **Webhook Signing Secret** (`whsec_...`) to `STRIPE_WEBHOOK_SECRET`.
4. **Production checklist** (VERY IMPORTANT):
   - Switch from `sk_test_` to `sk_live_` keys
   - Set `STRIPE_WEBHOOK_SECRET` to the **live** webhook secret
   - Set `CLIENT_URL` to your production frontend URL
   - Test with a real card in Stripe's test mode first
   - Enable webhook **Signing Secret** verification
   - Add your domain to Stripe's **Redirect Allowlist** in Dashboard

## Resend (Email)

1. Create a [Resend](https://resend.com) account.
2. Verify your domain under **Domains**.
3. Create an API key under **API Keys**.
4. Set `RESEND_API_KEY` in backend `.env`.
5. Set `EMAIL_FROM` to a verified sender (e.g. `noreply@yourdomain.com`).
6. If `RESEND_API_KEY` is not set, email jobs gracefully log and skip (no crash).

---

# Deployment

## Option A: Render (Backend + Gateway)

Both backend and GraphQL gateway deploy identically on Render as **Web Services**.

### Steps

1. Create a **New Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. **Settings**:
   - **Root Directory**: `backend/` (or `graphql-gateway/`)
   - **Build Command**: `npm install`
   - **Start Command**: `npm start` (runs `node server.js`)
   - **Runtime**: Node
4. Add all environment variables from the tables above in **Environment** section.
5. Deploy.

### Health Check

Backend ships with `GET /api/health` — you can point Render's health check to `/api/health`.

### Notes

- Backend and gateway are separate services — deploy each on its own Render service.
- Set the gateway's `BACKEND_API_URL` to the deployed backend URL (e.g. `https://backend.onrender.com/api`).
- Set `CORS_ORIGINS` on both to include the frontend URL(s).
- Set `CLIENT_URL` on backend to the frontend URL.

## Option B: Vercel (Frontend)

Complete frontend deploy, no serverless functions needed (SPA only).

### Steps

1. Install Vercel CLI or use GitHub import.
   ```bash
   npm install -g vercel
   ```
2. From the `frontend/` directory:
   ```bash
   vercel --prod
   ```
3. Add environment variables in Vercel Dashboard:
   - `VITE_API_URL` — deployed backend URL (e.g. `https://backend.onrender.com/api`)
   - `VITE_GRAPHQL_URL` — deployed gateway URL (e.g. `https://gateway.onrender.com/graphql`)
4. Vite reads these at build time — **re-deploy** if env vars change.

### SPA Routing

Vite's default build works with Vercel. For client-side routing, Vercel auto-detects the framework and handles fallback to `index.html`.

---

# Post-Deployment Verification

## 1. Backend Health

```bash
curl https://backend.onrender.com/api/health
# Expected: { "status": "ok" }
```

## 2. Authentication

```bash
curl -X POST https://backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"..."}'
# Expected: { "success": true, "data": { "token": "..." } }
```

## 3. GraphQL Gateway

```bash
curl -X POST https://gateway.onrender.com/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __typename }"}'
# Expected: { "data": { "__typename": "Query" } }
```

## 4. Frontend

Open the frontend URL in a browser. Verify:
- Login and registration work
- Product listing loads
- Add to cart and checkout redirect to Stripe
- Order history shows
- Admin dashboard loads for admin users

## 5. Stripe Webhook

Verify webhook delivery in Stripe Dashboard → Developers → Webhooks → (your endpoint) → **Recent deliveries**. Look for 200 responses.

---

# Redeploy on Code Changes

```bash
# Backend / Gateway (Render)
git push origin main
# Render auto-deploys from the branch.

# Frontend (Vercel)
cd frontend && vercel --prod
# Or: connect GitHub repo in Vercel Dashboard for auto-deploy.
```
