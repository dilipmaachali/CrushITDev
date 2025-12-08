# CrushIT MongoDB Database Documentation Index

## 📚 Documentation Files

### 1. **MONGODB_IMPLEMENTATION_SUMMARY.md** ⭐ START HERE
   - Overview of what was created
   - 12 Collections summary
   - 8 Repositories overview
   - Quick setup (4 steps)
   - File structure
   - Usage examples
   - Quality checklist
   - **Best for:** Understanding the complete system

### 2. **MONGODB_QUICK_START.md** 🚀 QUICK REFERENCE
   - 5-minute quick start
   - Common operations
   - Query examples
   - Troubleshooting
   - Production checklist
   - Useful commands
   - **Best for:** Getting started quickly

### 3. **MONGODB_SCHEMA.md** 📖 DETAILED REFERENCE
   - Complete schema documentation
   - All 12 collections in detail
   - Field definitions
   - Index explanations
   - Relationships & foreign keys
   - Setup instructions
   - Usage examples
   - Performance optimization
   - **Best for:** Understanding schema design

### 4. **.env.example** ⚙️ CONFIGURATION
   - Environment variables template
   - MongoDB connection settings
   - API keys configuration
   - Email & payment setup
   - **Best for:** Setting up configuration

---

## 📂 Source Code Files

### Database Layer (`src/database/`)

#### 1. **schema.ts** (650+ lines)
   - 12 Collection schema definitions
   - Schema validation rules
   - Index specifications
   - Field validations
   - **Contains:** 
     - usersSchema
     - arenasSchema
     - bookingsSchema
     - paymentsSchema
     - walletsSchema
     - reviewsSchema
     - productsSchema
     - petCareSchema
     - chatMessagesSchema
     - notificationsSchema
     - transactionsSchema
     - promotionsSchema

#### 2. **mongodb.ts** (350+ lines)
   - MongoDB connection management
   - Schema initialization
   - Index creation
   - Database statistics
   - **Functions:**
     - `connectMongoDB()` - Establish connection
     - `initializeDatabase()` - Create collections & indexes
     - `getDatabase()` - Get DB instance
     - `getCollection()` - Get collection
     - `disconnectMongoDB()` - Close connection
     - `dropDatabase()` - Drop all data
     - `getDatabaseStats()` - Get stats

#### 3. **repositories.ts** (600+ lines)
   - BaseRepository abstract class
   - 8 Specialized repositories
   - CRUD operations
   - **Repositories:**
     - UserRepository
     - ArenaRepository
     - BookingRepository
     - PaymentRepository
     - ReviewRepository
     - WalletRepository
     - NotificationRepository
     - ChatRepository

#### 4. **init.ts** (350+ lines)
   - Database initialization script
   - Sample data creation
   - User setup
   - Arena seeding
   - Review creation
   - **Run with:** `npx ts-node src/database/init.ts`

---

## 🎯 Collections Quick Reference

### User Management
- **users** - User accounts, profiles, authentication
- **wallets** - Wallet balance, transactions, rewards

### Bookings & Reservations
- **arenas** - Sports venues, pricing, availability
- **bookings** - Arena reservations, status
- **payments** - Payment records, Razorpay integration

### Social & Reviews
- **reviews** - User ratings and feedback
- **notifications** - User notifications, alerts
- **chatMessages** - User-to-user messaging

### Business
- **products** - Sports equipment store
- **petCare** - Pet care services
- **promotions** - Discount codes and offers
- **transactions** - Transaction audit trail

---

## 🔍 Repository Methods Quick Reference

### UserRepository
```
findById(id)
findOne(filter)
find(filter)
count(filter)
create(data)
updateById(id, updates)
deleteById(id)
findByEmail(email)
findByPhone(phone)
findNearby(lat, lng, radius)
updateWalletBalance(userId, amount)
incrementStats(userId, stat, value)
```

### ArenaRepository
```
findById(id)
find(filter)
count(filter)
create(data)
updateById(id, updates)
deleteById(id)
findByType(type)
findNearby(lat, lng, radius)
findByCity(city)
searchByName(name)
getTopRated(limit)
```

### BookingRepository
```
findById(id)
find(filter)
count(filter)
create(data)
updateById(id, updates)
deleteById(id)
findByUser(userId)
findByArena(arenaId)
findByDateRange(start, end)
checkAvailability(arenaId, start, end)
getUserUpcomingBookings(userId)
getUserPastBookings(userId, limit)
```

### PaymentRepository
```
findById(id)
find(filter)
count(filter)
create(data)
updateById(id, updates)
deleteById(id)
findByUser(userId)
findByBooking(bookingId)
findByRazorpayOrderId(orderId)
getTotalRevenue(start, end)
```

### ReviewRepository
```
findById(id)
find(filter)
count(filter)
create(data)
updateById(id, updates)
deleteById(id)
findByArena(arenaId)
findByUser(userId)
getAverageRating(arenaId)
```

### WalletRepository
```
findById(id)
find(filter)
count(filter)
create(data)
updateById(id, updates)
deleteById(id)
findByUser(userId)
addTransaction(userId, transaction)
updateBalance(userId, newBalance)
addRewardPoints(userId, points)
```

### NotificationRepository
```
findById(id)
find(filter)
count(filter)
create(data)
updateById(id, updates)
deleteById(id)
findByUser(userId)
findUnread(userId)
markAsRead(notificationId)
markAllAsRead(userId)
```

### ChatRepository
```
findById(id)
find(filter)
count(filter)
create(data)
updateById(id, updates)
deleteById(id)
findConversation(userId1, userId2)
findUnreadMessages(receiverId)
markConversationAsRead(userId, senderId)
```

---

## 🚀 Setup Timeline

### Phase 1: Preparation (5 minutes)
```
1. Install MongoDB
2. Create .env file
3. Configure MONGODB_URI
```

### Phase 2: Initialization (2 minutes)
```
1. npm install
2. npx ts-node src/database/init.ts
```

### Phase 3: Integration (10 minutes)
```
1. Update backend index.ts
2. Add connection to startup
3. Test API endpoints
```

### Phase 4: Production (30 minutes)
```
1. Set up MongoDB Atlas
2. Configure backup schedule
3. Set up monitoring
4. Deploy backend
```

---

## 📊 Collections Statistics

| Collection | Collections | Indexes | Key Fields |
|-----------|-------------|---------|-----------|
| users | 1 | 5 | email, phone, status |
| arenas | 1 | 7 | type, location, rating |
| bookings | 1 | 6 | userId, arenaId, status |
| payments | 1 | 5 | userId, status, razorpayOrderId |
| wallets | 1 | 2 | userId (unique) |
| reviews | 1 | 5 | arenaId, userId, rating |
| products | 1 | 6 | category, price, rating |
| petCare | 1 | 5 | serviceType, location |
| chatMessages | 1 | 5 | conversationId, senderId |
| notifications | 1 | 4 | userId, isRead, expiresAt (TTL) |
| transactions | 1 | 5 | userId, transactionId, status |
| promotions | 1 | 4 | code (unique), status |
| **TOTAL** | **12** | **56** | - |

---

## ✅ Implementation Checklist

- ✅ Database schema created (12 collections)
- ✅ Connection manager implemented
- ✅ 8 Repositories with CRUD operations
- ✅ Indexes optimized for performance
- ✅ Schema validation configured
- ✅ Database initialization script
- ✅ Sample data seeding
- ✅ TypeScript support
- ✅ Error handling
- ✅ Documentation complete
- ✅ Quick start guide
- ✅ Environment template
- ✅ Usage examples
- ✅ Troubleshooting guide
- ✅ Production checklist

---

## 🎓 Learning Path

### Beginner
1. Read: **MONGODB_IMPLEMENTATION_SUMMARY.md** (10 min)
2. Setup: **MONGODB_QUICK_START.md** (5 min)
3. Try: Run init script and test sample queries

### Intermediate
1. Study: **MONGODB_SCHEMA.md** (30 min)
2. Review: Repository implementations (20 min)
3. Practice: Write custom queries

### Advanced
1. Optimize: Index usage and query performance
2. Scale: Implement sharding strategy
3. Monitor: Set up database monitoring & alerts

---

## 🔗 File Dependencies

```
src/database/
├── schema.ts          (independent)
├── mongodb.ts         (imports schema.ts)
├── repositories.ts    (imports mongodb.ts)
└── init.ts           (imports repositories.ts)

All files use:
- mongoose/mongodb library
- TypeScript interfaces
- Error handling
```

---

## 💡 Common Tasks

### Task: Add New Collection
1. Define schema in `schema.ts`
2. Create indexes in schema definition
3. Add collection to `allSchemas` export
4. Create Repository class in `repositories.ts`
5. Update `initializeDatabase()` in `mongodb.ts`

### Task: Add New Repository Method
1. Extend BaseRepository method or create custom
2. Use MongoDB query operators
3. Add TypeScript types
4. Test with sample data
5. Document in README

### Task: Create Backup
```bash
mongodump --db crushit --out ./backup
```

### Task: Restore from Backup
```bash
mongorestore --db crushit ./backup/crushit
```

### Task: Monitor Performance
```bash
# Check slow queries
db.system.profile.find().pretty()

# Check indexes
db.collection.getIndexes()
```

---

## 🎯 Next Steps

1. **Immediate** (Today)
   - [ ] Read MONGODB_IMPLEMENTATION_SUMMARY.md
   - [ ] Run init script
   - [ ] Test sample queries

2. **Short-term** (This week)
   - [ ] Integrate with backend routes
   - [ ] Test all repository methods
   - [ ] Set up error handling

3. **Medium-term** (This month)
   - [ ] Implement caching layer
   - [ ] Set up monitoring
   - [ ] Performance optimization

4. **Long-term** (Production)
   - [ ] Deploy to MongoDB Atlas
   - [ ] Set up backups
   - [ ] Configure alerts
   - [ ] Scale as needed

---

## 📞 Quick Help

### Connection Issues?
→ See **MONGODB_QUICK_START.md** "Troubleshooting" section

### Schema Questions?
→ See **MONGODB_SCHEMA.md** for detailed field definitions

### Need Examples?
→ See **MONGODB_QUICK_START.md** "Common Operations" section

### Want to customize?
→ Read **schema.ts** and **repositories.ts** for implementation details

---

## 🌟 Features Implemented

- ✅ Complete schema with 12 collections
- ✅ 56 optimized indexes
- ✅ 8 repository classes
- ✅ 40+ repository methods
- ✅ Geospatial queries (nearby locations)
- ✅ Full-text search
- ✅ Pagination support
- ✅ Transaction audit trail
- ✅ Soft deletes via status
- ✅ TTL auto-deletion (notifications)
- ✅ Connection pooling
- ✅ Schema validation
- ✅ TypeScript support
- ✅ Error handling
- ✅ Sample data seeding
- ✅ Production-ready code

---

**MongoDB Database Implementation Complete! 🚀**

Start with **MONGODB_IMPLEMENTATION_SUMMARY.md** for a quick overview.
