# MySQL Tables

## Users

id
email
password_hash
role
created_at
updated_at

## Products

id
name
description
price
stock
version
created_at
updated_at

## Orders

id
user_id
status
total_amount
created_at

## Order Items

id
order_id
product_id
quantity
price

## Payments

id
order_id
stripe_session_id
stripe_event_id
status
amount

## Coupons

id
code
discount_percentage
expiry_date

# MongoDB Collections

## Profiles

{
userId,
firstName,
lastName,
phone,
addresses
}

## RewardAccounts

{
userId,
totalPoints,
availablePoints,
tier
}

## RewardLedger

{
transactionId,
userId,
orderId,
points,
type,
createdAt
}

## Notifications

{
userId,
type,
message,
status
}
