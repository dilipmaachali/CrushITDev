# CrushIT MongoDB Database Schema

Complete MongoDB schema documentation with all collections, fields, indexes, and relationships.

## Overview

CrushIT uses MongoDB as its primary NoSQL database. The schema includes 12 main collections covering:
- User management & authentication
- Arena/venue information
- Bookings & reservations
- Payments & transactions
- Wallet & balance management
- Reviews & ratings
- Products & merchandise
- Pet care services
- Chat & messaging
- Notifications
- Promotions & discounts

---

## Collections & Schema Details

### 1. **USERS** Collection
Stores user account information, authentication, and profiles.

**Collection Name:** `users`

**Fields:**
```javascript
{
  _id: ObjectId,              // MongoDB ID
  email: String (unique),     // User email
  password: String,           // Hashed password
  name: String,               // Full name
  phone: String (unique),     // Phone number
  avatar: String,             // Profile picture URL
  address: String,            // Home address
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    city: String,
    state: String
  },
  preferences: {
    favoriteArenas: [ObjectId],  // Arena IDs
    preferredSports: [String],   // e.g., ['cricket', 'football']
    notificationsEnabled: Boolean,
    newsletter: Boolean
  },
  wallet: {
    balance: Number,          // Wallet balance
    currency: String,         // e.g., 'INR'
    rewardPoints: Number      // Loyalty points
  },
  stats: {
    bookingsCount: Number,    // Total bookings
    totalSpent: Number,       // Total amount spent
    gamesPlayed: Number,      // Games participated
    averageRating: Number,    // User rating
    totalReviews: Number      // Reviews given
  },
  status: String,             // 'active', 'inactive', 'suspended', 'deleted'
  createdAt: Date,
  updatedAt: Date,
  lastLoginAt: Date
}
```

**Indexes:**
- `email` (unique)
- `phone` (unique, sparse)
- `createdAt` (descending)
- Geospatial: `location.latitude`, `location.longitude`
- `status`

---

### 2. **ARENAS** Collection
Stores sports venues and their information.

**Collection Name:** `arenas`

**Fields:**
```javascript
{
  _id: ObjectId,
  name: String,
  type: String,               // 'cricket', 'football', 'badminton', 'tennis', etc.
  description: String,
  ownerId: ObjectId,          // Owner reference
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  pricing: {
    hourly: Number,           // Price per hour
    daily: Number,            // Price per day
    currency: String,
    discountPercentage: Number
  },
  availability: [
    {
      dayOfWeek: Number,      // 0-6 (Monday-Sunday)
      startTime: String,      // HH:mm format
      endTime: String,        // HH:mm format
      isAvailable: Boolean
    }
  ],
  amenities: [String],        // 'Parking', 'WiFi', 'Locker', etc.
  images: [
    {
      url: String,
      caption: String,
      isPrimary: Boolean
    }
  ],
  rating: Number,             // 0-5
  reviewCount: Number,
  capacity: Number,           // Max players/participants
  contactPerson: {
    name: String,
    phone: String,
    email: String
  },
  status: String,             // 'active', 'inactive', 'closed', 'maintenance'
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `type`
- Geospatial: `location.latitude`, `location.longitude` (2dsphere)
- `location.city`
- `rating` (descending)
- `status`
- `ownerId`
- `createdAt` (descending)

---

### 3. **BOOKINGS** Collection
Stores arena booking information and reservation details.

**Collection Name:** `bookings`

**Fields:**
```javascript
{
  _id: ObjectId,
  bookingId: String,          // Unique booking reference
  userId: ObjectId,
  arenaId: ObjectId,
  startTime: Date,
  endTime: Date,
  duration: Number,           // Hours
  cost: {
    basePrice: Number,
    discount: Number,
    tax: Number,
    totalAmount: Number,
    currency: String
  },
  status: String,             // 'pending', 'confirmed', 'cancelled', 'completed', 'no-show'
  paymentStatus: String,      // 'unpaid', 'partial', 'paid', 'refunded'
  paymentId: ObjectId,        // Reference to payments
  participants: [
    {
      userId: ObjectId,
      name: String,
      email: String,
      isConfirmed: Boolean
    }
  ],
  notes: String,
  cancellationReason: String,
  cancellationTime: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId` + `createdAt` (descending)
- `arenaId`
- `status`
- `paymentStatus`
- `startTime`, `endTime`
- `bookingId` (unique)

---

### 4. **PAYMENTS** Collection
Stores payment transaction records and Razorpay integration data.

**Collection Name:** `payments`

**Fields:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  bookingId: ObjectId,
  amount: Number,
  currency: String,
  paymentMethod: String,      // 'credit_card', 'debit_card', 'wallet', 'upi', etc.
  razorpayOrderId: String,
  razorpayPaymentId: String,
  razorpaySignature: String,
  status: String,             // 'initiated', 'pending', 'completed', 'failed', 'refunded'
  refundAmount: Number,
  refundReason: String,
  refundStatus: String,       // 'none', 'initiated', 'processing', 'completed', 'failed'
  metadata: {
    // Additional payment data
  },
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId` + `createdAt` (descending)
- `bookingId`
- `status`
- `razorpayOrderId` (unique, sparse)
- `razorpayPaymentId` (unique, sparse)

---

### 5. **WALLETS** Collection
Stores user wallet balance and transaction history.

**Collection Name:** `wallets`

**Fields:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,           // User reference (unique)
  balance: Number,            // Current balance
  rewardPoints: Number,       // Loyalty points
  currency: String,
  transactions: [
    {
      transactionId: ObjectId,
      type: String,           // 'credit', 'debit', 'refund', 'bonus'
      amount: Number,
      description: String,
      relatedBooking: ObjectId,
      relatedPayment: ObjectId,
      timestamp: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId` (unique)
- `updatedAt` (descending)

---

### 6. **REVIEWS** Collection
Stores user reviews and ratings for arenas.

**Collection Name:** `reviews`

**Fields:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  arenaId: ObjectId,
  bookingId: ObjectId,
  rating: Number,             // 1-5
  title: String,
  comment: String,
  images: [String],           // Image URLs
  helpfulCount: Number,
  status: String,             // 'pending', 'approved', 'rejected', 'reported'
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `arenaId` + `rating` (descending)
- `userId`
- `bookingId`
- `status`
- `createdAt` (descending)

---

### 7. **PRODUCTS** Collection
Stores sports equipment and merchandise products.

**Collection Name:** `products`

**Fields:**
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  category: String,
  subcategory: String,
  price: Number,
  discountPrice: Number,
  currency: String,
  images: [
    {
      url: String,
      alt: String
    }
  ],
  stock: Number,
  sku: String,
  rating: Number,
  reviewCount: Number,
  vendorId: ObjectId,
  tags: [String],
  specifications: {},         // Dynamic fields
  status: String,             // 'active', 'inactive', 'discontinued'
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `category`
- Full-text search: `name`, `description`
- `price`
- `rating` (descending)
- `status`
- `vendorId`

---

### 8. **PET_CARE** Collection
Stores pet care services and providers.

**Collection Name:** `petCare`

**Fields:**
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  serviceType: String,        // 'grooming', 'training', 'boarding', etc.
  providerId: ObjectId,
  location: {
    latitude: Number,
    longitude: Number,
    address: String,
    city: String
  },
  pricing: {
    basePrice: Number,
    currency: String,
    pricingModel: String      // 'hourly', 'daily', 'per_service'
  },
  petTypes: [String],         // 'dog', 'cat', 'bird', etc.
  availability: [
    {
      dayOfWeek: Number,
      startTime: String,
      endTime: String
    }
  ],
  rating: Number,
  reviewCount: Number,
  images: [String],
  certifications: [String],
  status: String,             // 'active', 'inactive', 'closed'
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `serviceType`
- `providerId`
- Geospatial: `location.latitude`, `location.longitude` (2dsphere)
- `rating` (descending)
- `status`

---

### 9. **CHAT_MESSAGES** Collection
Stores chat messages between users and support.

**Collection Name:** `chatMessages`

**Fields:**
```javascript
{
  _id: ObjectId,
  conversationId: ObjectId,
  senderId: ObjectId,
  receiverId: ObjectId,
  message: String,
  messageType: String,        // 'text', 'image', 'file', 'booking_update'
  attachments: [
    {
      type: String,
      url: String,
      name: String
    }
  ],
  isRead: Boolean,
  readAt: Date,
  status: String,             // 'sent', 'delivered', 'read', 'failed'
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `conversationId` + `createdAt` (descending)
- `senderId`
- `receiverId`
- `isRead`
- `createdAt` (descending)

---

### 10. **NOTIFICATIONS** Collection
Stores user notifications.

**Collection Name:** `notifications`

**Fields:**
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: String,               // 'booking_confirmed', 'payment_received', etc.
  title: String,
  message: String,
  relatedBooking: ObjectId,
  relatedArena: ObjectId,
  actionUrl: String,
  isRead: Boolean,
  readAt: Date,
  priority: String,           // 'low', 'medium', 'high', 'urgent'
  sentVia: [String],          // 'in_app', 'email', 'push', 'sms'
  createdAt: Date,
  expiresAt: Date             // TTL index - auto-delete
}
```

**Indexes:**
- `userId` + `createdAt` (descending)
- `isRead`
- `type`
- `expiresAt` (TTL index - auto-deletes after expiry)

---

### 11. **TRANSACTIONS** Collection
Stores all wallet and payment transactions.

**Collection Name:** `transactions`

**Fields:**
```javascript
{
  _id: ObjectId,
  transactionId: String,      // Unique reference
  userId: ObjectId,
  type: String,               // 'booking', 'refund', 'wallet_topup', 'reward', 'penalty'
  amount: Number,
  currency: String,
  status: String,             // 'pending', 'completed', 'failed', 'cancelled'
  relatedBooking: ObjectId,
  relatedPayment: ObjectId,
  description: String,
  metadata: {},
  createdAt: Date,
  completedAt: Date
}
```

**Indexes:**
- `userId` + `createdAt` (descending)
- `transactionId` (unique)
- `status`
- `type`
- `createdAt` (descending)

---

### 12. **PROMOTIONS** Collection
Stores promotional offers and discount codes.

**Collection Name:** `promotions`

**Fields:**
```javascript
{
  _id: ObjectId,
  code: String,               // Unique promo code
  description: String,
  discountType: String,       // 'percentage', 'fixed_amount'
  discountValue: Number,
  maxDiscount: Number,
  minOrderValue: Number,
  usageLimit: Number,
  usedCount: Number,
  usagePerUser: Number,
  applicableArenas: [ObjectId],  // Empty = all arenas
  applicableTo: String,       // 'all_users', 'new_users', 'specific_users'
  specificUsers: [ObjectId],
  startDate: Date,
  endDate: Date,
  status: String,             // 'active', 'inactive', 'expired'
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `code` (unique)
- `status`
- `startDate`, `endDate`
- `usedCount` (descending)

---

## Relationships & Foreign Keys

### User → Bookings
```
users._id ← bookings.userId
```

### Arena → Bookings
```
arenas._id ← bookings.arenaId
```

### Booking → Payment
```
bookings._id ← payments.bookingId
```

### User → Wallet
```
users._id ← wallets.userId (1:1 relationship)
```

### Booking → Review
```
bookings._id ← reviews.bookingId
```

### Arena → Review
```
arenas._id ← reviews.arenaId
```

### User → Transactions
```
users._id ← transactions.userId
```

### User → Chat Messages
```
users._id ← chatMessages.senderId or receiverId
```

---

## Setup Instructions

### 1. Install MongoDB Locally
```bash
# Windows with Chocolatey
choco install mongodb-community

# macOS with Homebrew
brew install mongodb-community

# Linux (Ubuntu)
sudo apt-get install -y mongodb
```

### 2. MongoDB Atlas (Cloud)
```
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string: mongodb+srv://username:password@cluster.mongodb.net/crushit
4. Set as MONGODB_URI environment variable
```

### 3. Initialize Database in Node.js
```typescript
import { connectMongoDB, initializeDatabase } from '@/database/mongodb';

// Connect and initialize
async function setupDB() {
  try {
    await connectMongoDB();
    await initializeDatabase();
    console.log('✅ Database ready!');
  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupDB();
```

### 4. Environment Variables
```
# .env file
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=crushit
NODE_ENV=development
```

---

## Usage Examples

### Using Repositories
```typescript
import {
  UserRepository,
  ArenaRepository,
  BookingRepository,
  PaymentRepository,
  WalletRepository,
} from '@/database/repositories';

// Example: Create a user
const userRepo = new UserRepository();
const newUser = await userRepo.create({
  email: 'user@example.com',
  password: hashedPassword,
  name: 'John Doe',
  phone: '+91 9876543210',
});

// Example: Find nearby arenas
const arenaRepo = new ArenaRepository();
const nearbyArenas = await arenaRepo.findNearby(28.7041, 77.1025, 5); // 5km radius

// Example: Get user bookings
const bookingRepo = new BookingRepository();
const userBookings = await bookingRepo.findByUser(userId);

// Example: Get average rating
const reviewRepo = new ReviewRepository();
const avgRating = await reviewRepo.getAverageRating(arenaId);

// Example: Pagination
const arenas = await arenaRepo.paginate(
  { status: 'active' },
  page = 1,
  pageSize = 10,
  sort = { rating: -1 }
);
```

---

## Performance Optimization

### Query Optimization Tips
1. **Use indexes** - All collections have proper indexes defined
2. **Paginate results** - Use pagination for large datasets
3. **Projection** - Select only needed fields
4. **Aggregation** - Use MongoDB aggregation pipeline for complex queries

### Example - Aggregation Pipeline
```typescript
const collection = db.collection('bookings');
const results = await collection.aggregate([
  { $match: { status: 'completed', createdAt: { $gte: startDate } } },
  { $group: { _id: '$arenaId', totalBookings: { $sum: 1 }, totalRevenue: { $sum: '$cost.totalAmount' } } },
  { $sort: { totalRevenue: -1 } },
  { $limit: 10 },
]).toArray();
```

---

## Best Practices

1. **Always validate data** - Use schema validation at collection level
2. **Use transactions** - For multi-document operations
3. **Index strategically** - Don't over-index, monitor performance
4. **Archive old data** - Move old records to archive collections
5. **Backup regularly** - Set up MongoDB backups
6. **Use connection pooling** - Reuse database connections
7. **Error handling** - Proper error handling in repositories
8. **Security** - Hash passwords, validate inputs, use prepared statements

---

## Monitoring & Maintenance

### Check Collection Stats
```typescript
import { getDatabaseStats } from '@/database/mongodb';

const stats = await getDatabaseStats();
console.log(stats);
// Output:
// {
//   database: 'crushit',
//   collections: [
//     { name: 'users', documents: 1000, indexes: 6 },
//     { name: 'arenas', documents: 50, indexes: 7 },
//     ...
//   ],
//   totalCollections: 12
// }
```

### Create Backups
```bash
# Backup to file
mongodump --db crushit --out ./backup

# Restore from backup
mongorestore --db crushit ./backup/crushit
```

---

## Troubleshooting

### Connection Issues
```
Error: MongoDB connection refused
Solution: Ensure MongoDB service is running
- Windows: Services > MongoDB > Start
- Mac: brew services start mongodb-community
- Linux: sudo systemctl start mongod
```

### Index Not Used
```
Check index usage:
db.collection('arenas').getIndexes()
db.collection('arenas').explain("executionStats").find({ type: 'cricket' })
```

### Out of Memory
```
Solution: Configure wiredTiger cache size
mongod --wiredTigerCacheSizeGB 2
```

---

## Conclusion

This MongoDB schema provides a robust foundation for CrushIT with:
- ✅ Comprehensive data models
- ✅ Optimized indexes
- ✅ Easy repository pattern access
- ✅ Scalable architecture
- ✅ Best practices implementation

For production, consider:
- Using MongoDB Atlas for managed hosting
- Implementing sharding for large data
- Setting up replica sets for redundancy
- Regular monitoring and backups
