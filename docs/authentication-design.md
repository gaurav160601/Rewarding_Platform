# Authentication Design

## JWT Authentication

Access Token

* Expiry: 15 Minutes

Refresh Token

* Expiry: 30 Days

## Login Flow

User Login

↓

Verify Credentials

↓

Generate Access Token

↓

Generate Refresh Token

↓

Store Refresh Token

↓

Return Tokens

## Authorization

Roles

* ADMIN
* CUSTOMER

## Security

Password Hashing

bcrypt

Token Rotation

Refresh Token Blacklisting

Rate Limiting

Brute Force Protection
