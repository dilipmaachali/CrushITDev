/**
 * MongoDB Connection & Database Initialization
 * Handles connection, schema validation, and index creation
 */

import { MongoClient, Db, MongoClientOptions } from 'mongodb';
import {
  usersSchema,
  arenasSchema,
  bookingsSchema,
  paymentsSchema,
  walletsSchema,
  reviewsSchema,
  productsSchema,
  petCareSchema,
  chatMessagesSchema,
  notificationsSchema,
  transactionsSchema,
  promotionsSchema,
} from './schema';

const MONGODB_URI = process.env.MONGODB_URI ;
const DATABASE_NAME = process.env.DATABASE_NAME ;

if (!process.env.MONGODB_URI) {
  console.log(' MONGODB_URI not set in environment variables');
}else{
  console.log("Railway MONGODB_URI:", process.env.MONGODB_URI);
}
if (!process.env.DATABASE_NAME) {
  console.log('DATABASE_NAME not set in environment variables');
}else{
  console.log("Railway DATABASE_NAME:", process.env.DATABASE_NAME);
}

let mongoClient: MongoClient;
let database: Db;

interface SchemaConfig {
  collectionName: string;
  validator?: any;
  indexes?: any[];
}

/**
 * Connect to MongoDB
 */
export async function connectMongoDB(): Promise<Db> {
  if (database) {
    return database;
  }

  try {
    const options: MongoClientOptions = {
      maxPoolSize: 10,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    mongoClient = new MongoClient(MONGODB_URI, options);
    await mongoClient.connect();

    database = mongoClient.db(DATABASE_NAME);

    console.log(`✅ Connected to MongoDB: ${DATABASE_NAME}`);
    return database;
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error.message);
    throw error;
  }
}

/**
 * Initialize Database Schema & Indexes
 */
export async function initializeDatabase(): Promise<void> {
  try {
    const db = await connectMongoDB();

    const schemas: SchemaConfig[] = [
      usersSchema,
      arenasSchema,
      bookingsSchema,
      paymentsSchema,
      walletsSchema,
      reviewsSchema,
      productsSchema,
      petCareSchema,
      chatMessagesSchema,
      notificationsSchema,
      transactionsSchema,
      promotionsSchema,
    ];

    for (const schema of schemas) {
      await createCollectionWithValidation(db, schema);
    }

    console.log('✅ Database initialization complete!');
  } catch (error: any) {
    console.error('❌ Database initialization failed:', error.message);
    throw error;
  }
}

/**
 * Create Collection with Validation & Indexes
 */
async function createCollectionWithValidation(db: Db, schema: SchemaConfig): Promise<void> {
  const collectionName = schema.collectionName;

  try {
    // Check if collection exists
    const collections = await db.listCollections({ name: collectionName }).toArray();

    if (collections.length === 0) {
      // Create collection with schema validation
      if (schema.validator) {
        await db.createCollection(collectionName, {
          validator: schema.validator,
          validationLevel: 'moderate',
          validationAction: 'warn',
        });
        console.log(`📦 Created collection: ${collectionName} (with schema validation)`);
      } else {
        await db.createCollection(collectionName);
        console.log(`📦 Created collection: ${collectionName}`);
      }
    } else {
      console.log(`📦 Collection already exists: ${collectionName}`);
    }

    // Create indexes
    if (schema.indexes && schema.indexes.length > 0) {
      const collection = db.collection(collectionName);

      for (const indexConfig of schema.indexes) {
        try {
          await collection.createIndex(indexConfig.key, {
            unique: indexConfig.unique || false,
            sparse: indexConfig.sparse || false,
            expireAfterSeconds: indexConfig.expireAfterSeconds,
          });

          const indexName = Object.keys(indexConfig.key).join('_');
          console.log(`  ├─ Index created: ${indexName}`);
        } catch (error: any) {
          if (error.code === 85 || error.message.includes('already exists')) {
            // Index already exists, skip
            const indexName = Object.keys(indexConfig.key).join('_');
            console.log(`  ├─ Index already exists: ${indexName}`);
          } else {
            throw error;
          }
        }
      }
    }
  } catch (error: any) {
    console.error(`❌ Error creating collection ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Get Database Instance
 */
export function getDatabase(): Db {
  if (!database) {
    throw new Error('Database not connected. Call connectMongoDB() first.');
  }
  return database;
}

/**
 * Get Collection
 */
export function getCollection(collectionName: string) {
  const db = getDatabase();
  return db.collection(collectionName);
}

/**
 * Disconnect from MongoDB
 */
export async function disconnectMongoDB(): Promise<void> {
  if (mongoClient) {
    await mongoClient.close();
    console.log('🔌 Disconnected from MongoDB');
  }
}

/**
 * Drop Database (Use with caution!)
 */
export async function dropDatabase(): Promise<void> {
  try {
    const db = getDatabase();
    await db.dropDatabase();
    console.log('⚠️  Database dropped successfully');
  } catch (error: any) {
    console.error('❌ Error dropping database:', error.message);
    throw error;
  }
}

/**
 * Clear Collection Data (Use with caution!)
 */
export async function clearCollection(collectionName: string): Promise<void> {
  try {
    const collection = getCollection(collectionName);
    await collection.deleteMany({});
    console.log(`⚠️  Collection ${collectionName} cleared`);
  } catch (error: any) {
    console.error(`❌ Error clearing collection ${collectionName}:`, error.message);
    throw error;
  }
}

/**
 * Get Database Statistics
 */
export async function getDatabaseStats() {
  try {
    const db = getDatabase();
    const stats = await db.stats();

    const collections = await db.listCollections().toArray();
    const collectionStats = [];

    for (const collection of collections) {
      const col = db.collection(collection.name);
      const count = await col.countDocuments();
      const size = await col.estimatedDocumentCount();
      collectionStats.push({
        name: collection.name,
        documents: count,
        indexes: (await col.indexes()).length,
      });
    }

    return {
      database: DATABASE_NAME,
      collections: collectionStats,
      totalCollections: collections.length,
    };
  } catch (error: any) {
    console.error('❌ Error getting database stats:', error.message);
    throw error;
  }
}
