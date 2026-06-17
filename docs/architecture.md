# System Architecture

## Phase 1 - Modular Monolith

React Frontend

↓

Express Backend

↓

MySQL + MongoDB

## Phase 2 - Distributed Architecture

React Frontend

↓

GraphQL Gateway

↓

API Gateway

↓

Auth Service

User Service

Product Service

Order Service

Payment Service

Reward Service

Notification Service

↓

Kafka

↓

Redis

↓

MySQL + MongoDB

## Communication

Frontend → GraphQL Gateway

Gateway → Microservices

Microservices → Kafka Events

BullMQ → Background Jobs

Redis → Caching and Locks

Stripe → Payment Processing

## Design Patterns

* API Gateway Pattern
* Saga Pattern
* CQRS (Future)
* Event Driven Architecture
* Cache Aside Pattern
* Distributed Lock Pattern
