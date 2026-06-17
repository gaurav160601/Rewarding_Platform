# Concurrency Design

## Inventory Protection

Use MySQL Row Lock

SELECT ... FOR UPDATE

## Optimistic Locking

Products

id
stock
version

Update only if version matches

## Distributed Lock

Redis Lock Keys

lock:product:{id}

lock:user:{id}

lock:reward:{userId}

## Idempotency

Stripe Events

Kafka Events

BullMQ Jobs

## Race Conditions Covered

Double Payment

Double Reward

Double Coupon Redemption

Overselling Inventory
