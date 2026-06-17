# Kafka Event Design

## Topics

user.created

order.created

payment.completed

payment.failed

reward.earned

reward.redeemed

notification.send

## Example Event

payment.completed

{
orderId,
userId,
amount,
timestamp
}

## Consumers

Order Service

Reward Service

Notification Service

Analytics Service

## Benefits

Loose Coupling

Scalability

Independent Deployments

Asynchronous Processing
