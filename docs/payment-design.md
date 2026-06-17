# Stripe Payment Design

## Checkout Flow

Create Order

↓

Create Stripe Session

↓

User Payment

↓

Stripe Webhook

↓

Payment Success Event

↓

Update Order

↓

Add Rewards

↓

Send Notification

## Idempotency

Store Stripe Event ID

Unique Constraint

Ignore Duplicate Events

## Payment Status

PENDING

PROCESSING

SUCCESS

FAILED

REFUNDED
