# CrushIT Backend API Documentation

**Base URL:** `http://localhost:4000`  
**Latest Version:** 1.0.0

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Arena Endpoints](#arena-endpoints)
3. [Reviews Endpoints](#reviews-endpoints)
4. [Notifications Endpoints](#notifications-endpoints)
5. [Time Slots Endpoints](#time-slots-endpoints)
6. [Search & Filters](#search--filters)
7. [Payment Endpoints](#payment-endpoints)
8. [Wallet Endpoints](#wallet-endpoints)
9. [Location & Maps](#location--maps)
10. [Chat Endpoints](#chat-endpoints)

---

## Authentication Endpoints

### 1. User Registration
**POST** `/auth/register`

```bash
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "Password123!",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_1",
    "email": "user@test.com",
    "name": "John Doe",
    "createdAt": "2025-01-10T10:00:00Z"
  }
}
```

---

### 2. User Login
**POST** `/auth/login`

```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@test.com",
    "password": "Password123!"
  }'
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_1",
    "email": "user@test.com",
    "name": "John Doe"
  }
}
```

---

### 3. Get User Profile
**GET** `/auth/me`

```bash
curl -X GET http://localhost:4000/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "id": "user_1",
  "email": "user@test.com",
  "name": "John Doe",
  "phone": "+91-9876543210",
  "avatar": "https://example.com/avatar.jpg",
  "address": "123 Main St, Bangalore",
  "createdAt": "2025-01-10T10:00:00Z",
  "updatedAt": "2025-01-12T15:30:00Z"
}
```

---

### 4. Update User Profile
**PUT** `/auth/profile`

```bash
curl -X PUT http://localhost:4000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "phone": "+91-9876543210",
    "address": "456 Oak Ave, Bangalore",
    "avatar": "https://example.com/avatar-new.jpg"
  }'
```

**Response:**
```json
{
  "id": "user_1",
  "email": "user@test.com",
  "name": "Jane Doe",
  "phone": "+91-9876543210",
  "avatar": "https://example.com/avatar-new.jpg",
  "address": "456 Oak Ave, Bangalore",
  "updatedAt": "2025-01-13T10:00:00Z"
}
```

---

## Arena Endpoints

### 1. Get All Arenas
**GET** `/arenas`

```bash
curl -X GET http://localhost:4000/arenas
```

---

### 2. Get Arena by ID
**GET** `/arenas/:id`

```bash
curl -X GET http://localhost:4000/arenas/1
```

---

## Reviews Endpoints

### 1. Get Arena Reviews
**GET** `/reviews/arena/:arenaId`

```bash
curl -X GET http://localhost:4000/reviews/arena/1
```

**Response:**
```json
{
  "reviews": [
    {
      "id": "review_1",
      "arenaId": "1",
      "userId": "user_1",
      "rating": 5,
      "title": "Excellent Arena",
      "comment": "Great experience!",
      "helpful": 12,
      "createdAt": "2025-01-10T10:00:00Z"
    }
  ],
  "averageRating": 4.5,
  "totalReviews": 3
}
```

---

### 2. Create Review
**POST** `/reviews`

```bash
curl -X POST http://localhost:4000/reviews \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "arenaId": "1",
    "rating": 5,
    "title": "Amazing Place",
    "comment": "Had a great badminton session!"
  }'
```

---

## Notifications Endpoints

### 1. Get User Notifications
**GET** `/notifications/:userId`

```bash
curl -X GET http://localhost:4000/notifications/user_1
```

**Response:**
```json
[
  {
    "id": "notif_1",
    "userId": "user_1",
    "type": "booking",
    "title": "Booking Confirmed",
    "message": "Your booking for Cricket Arena is confirmed",
    "read": false,
    "createdAt": "2025-01-13T10:00:00Z"
  }
]
```

---

### 2. Mark Notification as Read
**PUT** `/notifications/:id/read`

```bash
curl -X PUT http://localhost:4000/notifications/notif_1/read
```

---

## Time Slots Endpoints

### 1. Get Available Time Slots
**GET** `/timeslots/:arenaId/:date`

```bash
curl -X GET http://localhost:4000/timeslots/1/2025-01-15
```

**Response:**
```json
[
  {
    "id": "slot_1",
    "arenaId": "1",
    "date": "2025-01-15",
    "startTime": "06:00",
    "endTime": "07:00",
    "booked": false,
    "price": 500,
    "createdAt": "2025-01-13T10:00:00Z"
  },
  {
    "id": "slot_2",
    "arenaId": "1",
    "date": "2025-01-15",
    "startTime": "07:00",
    "endTime": "08:00",
    "booked": true,
    "bookingId": "BK123",
    "price": 500,
    "createdAt": "2025-01-13T10:00:00Z"
  }
]
```

---

## Search & Filters

### Advanced Arena Search
**GET** `/arenas/search?search=&minPrice=&maxPrice=&minRating=&type=&sortBy=`

```bash
curl -X GET "http://localhost:4000/arenas/search?search=cricket&minPrice=300&maxPrice=800&minRating=4&type=cricket&sortBy=price-asc"
```

**Query Parameters:**
- `search` (string): Search term for arena name/description
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `minRating` (number): Minimum rating filter (0-5)
- `type` (string): Arena type (cricket, football, badminton, tennis, basketball, squash)
- `sortBy` (string): Sort by 'price-asc', 'price-desc', or 'rating'

**Response:**
```json
[
  {
    "id": "1",
    "name": "Elite Cricket Turf",
    "type": "cricket",
    "pricing": 500,
    "rating": 4.8,
    "description": "Premium cricket turf..."
  }
]
```

---

## Payment Endpoints

### 1. Create Razorpay Order
**POST** `/payments/create-order`

```bash
curl -X POST http://localhost:4000/payments/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "bookingId": "BK123",
    "description": "Cricket Arena Booking"
  }'
```

**Response:**
```json
{
  "orderId": "order_1001",
  "amount": 500,
  "paymentId": "payment_1"
}
```

---

### 2. Verify Payment
**POST** `/payments/verify`

```bash
curl -X POST http://localhost:4000/payments/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "razorpay_order_id": "order_1001",
    "razorpay_payment_id": "pay_1001",
    "razorpay_signature": "sig_1001"
  }'
```

---

### 3. Process Wallet Payment
**POST** `/payments/wallet`

```bash
curl -X POST http://localhost:4000/payments/wallet \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "bookingId": "BK123",
    "description": "Arena Booking Payment"
  }'
```

---

### 4. Get Payment History
**GET** `/payments/history/:userId`

```bash
curl -X GET http://localhost:4000/payments/history/user_1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Wallet Endpoints

### 1. Get Wallet Balance
**GET** `/wallet/:userId`

```bash
curl -X GET http://localhost:4000/wallet/user_1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Response:**
```json
{
  "userId": "user_1",
  "balance": 4500,
  "currency": "INR",
  "transactions": [
    {
      "id": "txn_1",
      "type": "credit",
      "amount": 5000,
      "description": "Initial wallet credit",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

---

### 2. Recharge Wallet
**POST** `/wallet/:userId/recharge`

```bash
curl -X POST http://localhost:4000/wallet/user_1/recharge \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "method": "razorpay"
  }'
```

---

### 3. Get Transaction History
**GET** `/transactions/:userId`

```bash
curl -X GET http://localhost:4000/transactions/user_1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Location & Maps

### 1. Get Nearby Arenas
**GET** `/arenas/nearby?latitude=&longitude=&radius=`

```bash
curl -X GET "http://localhost:4000/arenas/nearby?latitude=12.9716&longitude=77.5946&radius=5"
```

**Response:**
```json
[
  {
    "arenaId": "1",
    "name": "Elite Cricket Turf",
    "distance": 2.3,
    "duration": 6,
    "address": "Bangalore, Karnataka",
    "type": "cricket",
    "rating": 4.8,
    "pricing": 500
  }
]
```

---

### 2. Calculate Distance
**POST** `/location/distance`

```bash
curl -X POST http://localhost:4000/location/distance \
  -H "Content-Type: application/json" \
  -d '{
    "fromLatitude": 12.9716,
    "fromLongitude": 77.5946,
    "toLatitude": 12.9856,
    "toLongitude": 77.6010,
    "mode": "driving"
  }'
```

**Response:**
```json
{
  "distance": 12.5,
  "duration": 18,
  "mode": "driving"
}
```

---

### 3. Get Directions
**POST** `/location/directions`

```bash
curl -X POST http://localhost:4000/location/directions \
  -H "Content-Type: application/json" \
  -d '{
    "fromLatitude": 12.9716,
    "fromLongitude": 77.5946,
    "toLatitude": 12.9856,
    "toLongitude": 77.6010,
    "mode": "driving"
  }'
```

**Response:**
```json
{
  "directionsUrl": "https://www.google.com/maps/dir/?api=1&origin=12.9716,77.5946&destination=12.9856,77.6010&travelmode=driving"
}
```

---

### 4. Search Nearby Locations
**GET** `/location/search?latitude=&longitude=&radius=&type=&minRating=&query=`

```bash
curl -X GET "http://localhost:4000/location/search?latitude=12.9716&longitude=77.5946&radius=5&type=cricket&minRating=4"
```

---

## Chat Endpoints

### 1. Send Chat Message
**POST** `/chat/message`

```bash
curl -X POST http://localhost:4000/chat/message \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user_1",
    "userMessage": "I want to book a cricket arena"
  }'
```

**Response:**
```json
{
  "id": "msg1610000000000",
  "userId": "user_1",
  "userMessage": "I want to book a cricket arena",
  "botResponse": "I can help you book a cricket arena! What date would you prefer?",
  "intent": "booking",
  "timestamp": "2025-01-10T10:00:00Z"
}
```

---

### 2. Get Chat History
**GET** `/chat/history/:userId`

```bash
curl -X GET http://localhost:4000/chat/history/user_1
```

---

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized (Missing or invalid token)
- `404` - Not Found
- `500` - Server Error

---

## Demo Credentials

**Email:** user1@test.com  
**Password:** password123

---

## Rate Limits

No rate limiting is currently implemented. Production deployment should include appropriate rate limiting.

---

## Version History

- **v1.0.0** (2025-01-13): Initial release with all core features
