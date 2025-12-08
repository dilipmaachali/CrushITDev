# CrushIT MongoDB Setup Quick Reference

## Quick Start (5 minutes)

### 1. Install MongoDB

**Windows:**
```bash
# Using Chocolatey
choco install mongodb-community

# Or download from https://www.mongodb.com/try/download/community
```

**Mac:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install -y mongodb
sudo systemctl start mongod
```

### 2. Set Environment Variables

Create `.env` file in backend root:
```
MONGODB_URI=mongodb://localhost:27017
DATABASE_NAME=crushit
NODE_ENV=development
```

**For MongoDB Atlas (Cloud):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/crushit
DATABASE_NAME=crushit
```

### 3. Initialize Database

```bash
cd backend

# Install dependencies
npm install

# Run initialization script
npx ts-node src/database/init.ts
```

**Expected Output:**
```
🚀 Starting MongoDB initialization...
✅ Connected to MongoDB: crushit
📦 Created collection: users (with schema validation)
  ├─ Index created: email
  ├─ Index created: phone
  ...
✅ Created 2 sample users
✅ Created 3 sample arenas
✅ Created 2 wallets
✅ Created 2 sample reviews

✅ Database initialization completed successfully!

🔑 Sample Login Credentials:
   Email: user@example.com
   Email: player@crushit.com
   Password: password123
```

---

## Collections Overview

| Collection | Purpose | Documents | Indexes |
|-----------|---------|-----------|---------|
| **users** | User accounts & profiles | N/A | 5 |
| **arenas** | Sports venues | N/A | 7 |
| **bookings** | Arena reservations | N/A | 6 |
| **payments** | Payment records | N/A | 5 |
| **wallets** | User wallet balances | N/A | 2 |
| **reviews** | User ratings & reviews | N/A | 5 |
| **products** | Sports equipment store | N/A | 6 |
| **petCare** | Pet services | N/A | 5 |
| **chatMessages** | Chat/messaging | N/A | 5 |
| **notifications** | User notifications | N/A | 4 |
| **transactions** | All transactions | N/A | 5 |
| **promotions** | Discount codes | N/A | 4 |

---

## Common Operations

### Create User
```typescript
import { UserRepository } from '@/database/repositories';

const userRepo = new UserRepository();
const user = await userRepo.create({
  email: 'new@user.com',
  password: hashedPassword,
  name: 'New User',
  phone: '+91 9876543210'
});
```

### Find Nearby Arenas
```typescript
import { ArenaRepository } from '@/database/repositories';

const arenaRepo = new ArenaRepository();
const nearby = await arenaRepo.findNearby(12.9716, 77.5946, 5); // 5km
```

### Get Bookings
```typescript
import { BookingRepository } from '@/database/repositories';

const bookingRepo = new BookingRepository();
const userBookings = await bookingRepo.findByUser(userId);
```

### Check Availability
```typescript
const isAvailable = await bookingRepo.checkAvailability(
  arenaId,
  new Date('2024-12-10T18:00:00'),
  new Date('2024-12-10T19:00:00')
);
```

### Paginate Results
```typescript
const result = await arenaRepo.paginate(
  { status: 'active' },
  page = 1,
  pageSize = 10,
  sort = { rating: -1 }
);

console.log(result.data);      // 10 items
console.log(result.total);     // Total count
console.log(result.page);      // 1
console.log(result.pageSize);  // 10
```

---

## Database Connection in Backend

### Using in Express Routes
```typescript
import { connectMongoDB, getCollection } from '@/database/mongodb';
import { UserRepository } from '@/database/repositories';

// In your route handler
app.get('/api/users/:id', async (req, res) => {
  try {
    const db = await connectMongoDB();
    const userRepo = new UserRepository();
    
    const user = await userRepo.findById(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Initialize in Server Startup
```typescript
import { connectMongoDB, initializeDatabase } from '@/database/mongodb';

app.listen(PORT, async () => {
  try {
    await connectMongoDB();
    await initializeDatabase();
    console.log(`✅ Server running on port ${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});
```

---

## Query Examples

### Find by Email
```typescript
const user = await userRepo.findByEmail('user@example.com');
```

### Find with Filter
```typescript
const activeUsers = await userRepo.find({ status: 'active' });
```

### Find with Sort & Limit
```typescript
const topArenas = await arenaRepo.find(
  { status: 'active' },
  { sort: { rating: -1 }, limit: 10 }
);
```

### Count Documents
```typescript
const totalBookings = await bookingRepo.count({ status: 'completed' });
```

### Update Document
```typescript
await userRepo.updateById(userId, { status: 'active' });
```

### Delete Document
```typescript
await userRepo.deleteById(userId);
```

---

## Indexing & Performance

### Check Existing Indexes
```bash
# In MongoDB shell
use crushit
db.users.getIndexes()
db.arenas.getIndexes()
```

### Monitor Query Performance
```bash
# MongoDB shell - explain query execution
db.arenas.find({ type: 'cricket' }).explain('executionStats')
```

### Common Index Usage
- **`email`** → Fast user lookup by email
- **`type`** → Filter arenas by sport
- **Geospatial** → Find nearby locations
- **`createdAt`** → Sort by date
- **`status`** → Filter active records

---

## Backup & Restore

### Backup Database
```bash
mongodump --db crushit --out ./backup
```

### Restore Database
```bash
mongorestore --db crushit ./backup/crushit
```

### Export to CSV
```bash
mongoexport --db crushit --collection users --out users.csv --csv
```

---

## Connection Issues & Troubleshooting

### Error: Connection Refused
```
✗ MongoDB connection failed: connect ECONNREFUSED 127.0.0.1:27017

Solution: Start MongoDB service
- Windows: Services > MongoDB > Start
- Mac: brew services start mongodb-community
- Linux: sudo systemctl start mongod
```

### Error: Authentication Failed
```
Solution: Check credentials in MONGODB_URI
mongodb+srv://username:password@cluster.mongodb.net/crushit
                 ^^^^^^^^  ^^^^^^^^
```

### Error: Database Not Selected
```typescript
// ✗ Wrong - missing database name
const uri = 'mongodb://localhost:27017';

// ✓ Correct
const uri = 'mongodb://localhost:27017/crushit';
```

### Check MongoDB Status
```bash
# Windows
mongosh --eval "db.adminCommand('ping')"

# Mac/Linux
mongo --eval "db.adminCommand('ping')"
```

---

## Production Checklist

- [ ] Use MongoDB Atlas for production
- [ ] Enable authentication (username/password)
- [ ] Set up SSL/TLS encryption
- [ ] Configure backup schedule
- [ ] Set up replica sets for redundancy
- [ ] Monitor database performance
- [ ] Set up alerts for issues
- [ ] Regular security audits
- [ ] Data retention policies
- [ ] Disaster recovery plan

---

## Useful Commands

### Connect to MongoDB Shell
```bash
# Local
mongosh

# Atlas
mongosh "mongodb+srv://username:password@cluster.mongodb.net/crushit"
```

### Basic Shell Commands
```javascript
// Show databases
show dbs

// Switch database
use crushit

// Show collections
show collections

// Find documents
db.users.find()
db.arenas.find({ type: 'cricket' })

// Count documents
db.users.countDocuments()

// Insert document
db.users.insertOne({ email: 'test@example.com', name: 'Test' })

// Update document
db.users.updateOne({ _id: ObjectId('...') }, { $set: { status: 'active' } })

// Delete document
db.users.deleteOne({ _id: ObjectId('...') })

// Get collection stats
db.users.stats()
```

---

## File Structure

```
backend/
├── src/
│   ├── database/
│   │   ├── schema.ts          # Schema definitions (12 collections)
│   │   ├── mongodb.ts         # Connection & initialization
│   │   ├── repositories.ts    # Data access layer (8 repositories)
│   │   └── init.ts            # Database seeding script
│   └── index.ts               # Main server file
├── MONGODB_SCHEMA.md          # Complete schema documentation
└── package.json
```

---

## Next Steps

1. ✅ Install MongoDB
2. ✅ Run initialization script
3. ✅ Start backend server
4. ✅ Test API endpoints
5. ✅ Connect mobile app
6. ✅ Monitor database performance

---

## Support & Documentation

- **MongoDB Official:** https://docs.mongodb.com/
- **MongoDB Node.js Driver:** https://www.mongodb.com/docs/drivers/node/
- **Schema File:** `MONGODB_SCHEMA.md`
- **API Docs:** `http://localhost:4000/api-docs`

---

**Happy coding! 🚀**
