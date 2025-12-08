/**
 * MongoDB Initialization & Seed Script
 * Run this script to create collections with sample data
 * Usage: npx ts-node src/database/init.ts
 */

import { connectMongoDB, initializeDatabase, getDatabaseStats, getCollection } from './mongodb';
import {
  UserRepository,
  ArenaRepository,
  BookingRepository,
  PaymentRepository,
  WalletRepository,
  ReviewRepository,
} from './repositories';
import bcrypt from 'bcryptjs';

const sampleUsers = [
  {
    email: 'user@example.com',
    password: 'password123',
    name: 'John Doe',
    phone: '+91 9876543210',
    address: '123 Main St, Bangalore',
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
    },
    preferences: {
      favoriteArenas: [],
      preferredSports: ['cricket', 'badminton'],
      notificationsEnabled: true,
      newsletter: true,
    },
    wallet: {
      balance: 5000,
      currency: 'INR',
      rewardPoints: 100,
    },
    stats: {
      bookingsCount: 5,
      totalSpent: 15000,
      gamesPlayed: 10,
      averageRating: 4.5,
      totalReviews: 3,
    },
    status: 'active',
  },
  {
    email: 'player@crushit.com',
    password: 'password123',
    name: 'Akhil Kumar',
    phone: '+91 9123456789',
    address: '456 Park Ave, Delhi',
    location: {
      latitude: 28.7041,
      longitude: 77.1025,
      address: 'Delhi',
      city: 'Delhi',
      state: 'Delhi',
    },
    preferences: {
      favoriteArenas: [],
      preferredSports: ['football', 'cricket'],
      notificationsEnabled: true,
      newsletter: false,
    },
    wallet: {
      balance: 3000,
      currency: 'INR',
      rewardPoints: 50,
    },
    stats: {
      bookingsCount: 8,
      totalSpent: 24000,
      gamesPlayed: 15,
      averageRating: 4.2,
      totalReviews: 2,
    },
    status: 'active',
  },
];

const sampleArenas = [
  {
    name: 'Cricket Supreme Arena',
    type: 'cricket',
    description: 'Professional cricket pitch with international standards',
    ownerId: null as any, // Will be set later
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Indiranagar, Bangalore',
      city: 'Bangalore',
      state: 'Karnataka',
      country: 'India',
      postalCode: '560038',
    },
    pricing: {
      hourly: 2000,
      daily: 15000,
      currency: 'INR',
      discountPercentage: 10,
    },
    availability: [
      { dayOfWeek: 1, startTime: '06:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '06:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '06:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '06:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '06:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 6, startTime: '07:00', endTime: '23:00', isAvailable: true },
      { dayOfWeek: 0, startTime: '07:00', endTime: '23:00', isAvailable: true },
    ],
    amenities: ['Parking', 'WiFi', 'Lockers', 'Floodlights', 'Practice Area', 'Snack Bar'],
    images: [
      { url: 'https://via.placeholder.com/400x300?text=Cricket+Arena', caption: 'Main Pitch', isPrimary: true },
      { url: 'https://via.placeholder.com/400x300?text=Practice+Area', caption: 'Practice Area', isPrimary: false },
    ],
    rating: 4.8,
    reviewCount: 45,
    capacity: 30,
    contactPerson: {
      name: 'Rajesh Kumar',
      phone: '+91 9999999999',
      email: 'cricket@arena.com',
    },
    status: 'active',
  },
  {
    name: 'Football Field Pro',
    type: 'football',
    description: 'International standard football field with modern facilities',
    ownerId: null as any,
    location: {
      latitude: 28.7041,
      longitude: 77.1025,
      address: 'Connaught Place, Delhi',
      city: 'Delhi',
      state: 'Delhi',
      country: 'India',
      postalCode: '110001',
    },
    pricing: {
      hourly: 3000,
      daily: 20000,
      currency: 'INR',
      discountPercentage: 15,
    },
    availability: [
      { dayOfWeek: 1, startTime: '07:00', endTime: '23:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '07:00', endTime: '23:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '07:00', endTime: '23:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '07:00', endTime: '23:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '07:00', endTime: '00:00', isAvailable: true },
      { dayOfWeek: 6, startTime: '06:00', endTime: '00:00', isAvailable: true },
      { dayOfWeek: 0, startTime: '06:00', endTime: '23:00', isAvailable: true },
    ],
    amenities: ['Parking', 'Locker Room', 'Floodlights', 'Canteen', 'Medical Staff', 'DJ System'],
    images: [
      { url: 'https://via.placeholder.com/400x300?text=Football+Field', caption: 'Main Field', isPrimary: true },
    ],
    rating: 4.6,
    reviewCount: 32,
    capacity: 22,
    contactPerson: {
      name: 'Vikram Singh',
      phone: '+91 8888888888',
      email: 'football@arena.com',
    },
    status: 'active',
  },
  {
    name: 'Badminton Court Elite',
    type: 'badminton',
    description: 'Premier badminton facility with professional courts',
    ownerId: null as any,
    location: {
      latitude: 19.076,
      longitude: 72.8479,
      address: 'Bandra, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      postalCode: '400050',
    },
    pricing: {
      hourly: 800,
      daily: 5000,
      currency: 'INR',
      discountPercentage: 5,
    },
    availability: [
      { dayOfWeek: 1, startTime: '06:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 2, startTime: '06:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 3, startTime: '06:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 4, startTime: '06:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 5, startTime: '06:00', endTime: '22:00', isAvailable: true },
      { dayOfWeek: 6, startTime: '08:00', endTime: '20:00', isAvailable: true },
      { dayOfWeek: 0, startTime: '08:00', endTime: '20:00', isAvailable: true },
    ],
    amenities: ['AC Courts', 'WiFi', 'Coaching Available', 'Snacks', 'Shuttles Provided'],
    images: [
      { url: 'https://via.placeholder.com/400x300?text=Badminton+Court', caption: 'Court A', isPrimary: true },
    ],
    rating: 4.4,
    reviewCount: 28,
    capacity: 4,
    contactPerson: {
      name: 'Priya Sharma',
      phone: '+91 7777777777',
      email: 'badminton@arena.com',
    },
    status: 'active',
  },
];

const sampleReviews = [
  {
    userId: null as any,
    arenaId: null as any,
    bookingId: null as any,
    rating: 5,
    title: 'Excellent facility!',
    comment: 'Best cricket arena in Bangalore. Well maintained, great staff!',
    images: [],
    helpfulCount: 12,
    status: 'approved',
  },
  {
    userId: null as any,
    arenaId: null as any,
    bookingId: null as any,
    rating: 4,
    title: 'Good experience',
    comment: 'Nice football field, good lighting. Slightly expensive but worth it.',
    images: [],
    helpfulCount: 8,
    status: 'approved',
  },
];

/**
 * Main Initialization Function
 */
async function initDB() {
  try {
    console.log('🚀 Starting MongoDB initialization...\n');

    // Connect and initialize schema
    await connectMongoDB();
    await initializeDatabase();

    console.log('\n📝 Seeding sample data...\n');

    // Create sample users
    const userRepo = new UserRepository();
    const hashedPassword = await bcrypt.hash('password123', 10);

    const createdUsers = await Promise.all(
      sampleUsers.map((user) =>
        userRepo.create({
          ...user,
          password: hashedPassword,
        })
      )
    );

    console.log(`✅ Created ${createdUsers.length} sample users`);
    console.log(`   - ${createdUsers[0].email}`);
    console.log(`   - ${createdUsers[1].email}\n`);

    // Create sample arenas
    const arenaRepo = new ArenaRepository();
    const arenasWithOwner = sampleArenas.map((arena) => ({
      ...arena,
      ownerId: createdUsers[0]._id,
    }));

    const createdArenas = await Promise.all(arenasWithOwner.map((arena) => arenaRepo.create(arena)));

    console.log(`✅ Created ${createdArenas.length} sample arenas`);
    createdArenas.forEach((arena) => {
      console.log(`   - ${arena.name} (${arena.type})`);
    });
    console.log();

    // Create sample wallets for users
    const walletRepo = new WalletRepository();
    const createdWallets = await Promise.all(
      createdUsers.map((user) =>
        walletRepo.create({
          userId: user._id,
          balance: 5000,
          rewardPoints: 100,
          currency: 'INR',
          transactions: [],
        })
      )
    );

    console.log(`✅ Created ${createdWallets.length} wallets\n`);

    // Create sample reviews
    const reviewRepo = new ReviewRepository();
    const reviewsWithRefs = sampleReviews.map((review, index) => ({
      ...review,
      userId: createdUsers[index % createdUsers.length]._id,
      arenaId: createdArenas[index % createdArenas.length]._id,
    }));

    const createdReviews = await Promise.all(reviewsWithRefs.map((review) => reviewRepo.create(review)));

    console.log(`✅ Created ${createdReviews.length} sample reviews\n`);

    // Get database stats
    console.log('📊 Database Statistics:');
    const stats = await getDatabaseStats();
    console.log(`   Database: ${stats.database}`);
    console.log(`   Total Collections: ${stats.totalCollections}`);
    console.log(`\n   Collection Stats:`);
    stats.collections.forEach((col) => {
      console.log(`   - ${col.name}: ${col.documents} documents, ${col.indexes} indexes`);
    });

    console.log('\n✅ Database initialization completed successfully!\n');
    console.log('🔑 Sample Login Credentials:');
    console.log(`   Email: ${createdUsers[0].email}`);
    console.log(`   Email: ${createdUsers[1].email}`);
    console.log(`   Password: password123\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Initialization failed:', error);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  initDB();
}

export { initDB };
