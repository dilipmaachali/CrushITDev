/**
 * MongoDB Repository Pattern Implementation
 * Provides easy data access methods for all collections
 */

import { ObjectId, Filter, UpdateFilter } from 'mongodb';
import { getCollection } from './mongodb';

/**
 * Base Repository Class
 */
export class BaseRepository<T> {
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  /**
   * Find by ID
   */
  async findById(id: string | ObjectId): Promise<T | null> {
    const collection = getCollection(this.collectionName);
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return collection.findOne({ _id: objectId } as any);
  }

  /**
   * Find one document
   */
  async findOne(filter: Filter<T>): Promise<T | null> {
    const collection = getCollection(this.collectionName);
    return collection.findOne(filter as any);
  }

  /**
   * Find multiple documents
   */
  async find(filter: Filter<T> = {}, options?: any): Promise<T[]> {
    const collection = getCollection(this.collectionName);
    const query = collection.find(filter as any);

    if (options?.sort) {
      query.sort(options.sort);
    }
    if (options?.skip) {
      query.skip(options.skip);
    }
    if (options?.limit) {
      query.limit(options.limit);
    }

    return query.toArray() as any;
  }

  /**
   * Count documents
   */
  async count(filter: Filter<T> = {}): Promise<number> {
    const collection = getCollection(this.collectionName);
    return collection.countDocuments(filter as any);
  }

  /**
   * Create document
   */
  async create(data: Omit<T, '_id'>): Promise<T> {
    const collection = getCollection(this.collectionName);
    const result = await collection.insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    return {
      _id: result.insertedId,
      ...data,
    } as T;
  }

  /**
   * Create multiple documents
   */
  async createMany(dataArray: Omit<T, '_id'>[]): Promise<T[]> {
    const collection = getCollection(this.collectionName);
    const docs = dataArray.map((data) => ({
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    const result = await collection.insertMany(docs as any);

    return result.insertedIds.map((id, index) => ({
      _id: id,
      ...dataArray[index],
    })) as T[];
  }

  /**
   * Update by ID
   */
  async updateById(id: string | ObjectId, updates: Partial<T>): Promise<T | null> {
    const collection = getCollection(this.collectionName);
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;

    const result = await collection.findOneAndUpdate(
      { _id: objectId } as any,
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      } as any,
      { returnDocument: 'after' }
    );

    return result.value as any;
  }

  /**
   * Update many
   */
  async updateMany(filter: Filter<T>, updates: Partial<T>): Promise<number> {
    const collection = getCollection(this.collectionName);

    const result = await collection.updateMany(
      filter as any,
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      } as any
    );

    return result.modifiedCount;
  }

  /**
   * Delete by ID
   */
  async deleteById(id: string | ObjectId): Promise<boolean> {
    const collection = getCollection(this.collectionName);
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;

    const result = await collection.deleteOne({ _id: objectId } as any);
    return result.deletedCount > 0;
  }

  /**
   * Delete many
   */
  async deleteMany(filter: Filter<T>): Promise<number> {
    const collection = getCollection(this.collectionName);
    const result = await collection.deleteMany(filter as any);
    return result.deletedCount;
  }

  /**
   * Paginated find
   */
  async paginate(
    filter: Filter<T> = {},
    page: number = 1,
    pageSize: number = 10,
    sort?: any
  ): Promise<{ data: T[]; total: number; page: number; pageSize: number }> {
    const collection = getCollection(this.collectionName);

    const total = await collection.countDocuments(filter as any);
    const skip = (page - 1) * pageSize;

    const query = collection.find(filter as any).skip(skip).limit(pageSize);

    if (sort) {
      query.sort(sort);
    }

    const data = (await query.toArray()) as any;

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  /**
   * Bulk operations
   */
  async bulk(operations: any[]): Promise<any> {
    const collection = getCollection(this.collectionName);
    const bulkOps = collection.initializeUnorderedBulkOp();

    for (const op of operations) {
      if (op.type === 'insert') {
        bulkOps.insert({ ...op.data, createdAt: new Date(), updatedAt: new Date() });
      } else if (op.type === 'update') {
        bulkOps.find({ _id: new ObjectId(op.id) }).updateOne({
          $set: { ...op.data, updatedAt: new Date() },
        });
      } else if (op.type === 'delete') {
        bulkOps.find({ _id: new ObjectId(op.id) }).deleteOne();
      }
    }

    return bulkOps.execute();
  }
}

/**
 * User Repository
 */
export class UserRepository extends BaseRepository<any> {
  constructor() {
    super('users');
  }

  async findByEmail(email: string): Promise<any | null> {
    return this.findOne({ email } as any);
  }

  async findByPhone(phone: string): Promise<any | null> {
    return this.findOne({ phone } as any);
  }

  async findNearby(latitude: number, longitude: number, radiusKm: number = 10): Promise<any[]> {
    const collection = getCollection(this.collectionName);
    return collection
      .find({
        'location.latitude': {
          $gte: latitude - radiusKm / 111,
          $lte: latitude + radiusKm / 111,
        },
        'location.longitude': {
          $gte: longitude - radiusKm / 111,
          $lte: longitude + radiusKm / 111,
        },
      } as any)
      .toArray();
  }

  async updateWalletBalance(userId: string, amount: number): Promise<any | null> {
    return this.updateById(userId, { 'wallet.balance': amount } as any);
  }

  async incrementStats(userId: string, stat: string, value: number = 1): Promise<any | null> {
    const collection = getCollection(this.collectionName);
    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(userId) },
      {
        $inc: {
          [`stats.${stat}`]: value,
        },
        $set: { updatedAt: new Date() },
      } as any,
      { returnDocument: 'after' }
    );
    return result.value;
  }
}

/**
 * Arena Repository
 */
export class ArenaRepository extends BaseRepository<any> {
  constructor() {
    super('arenas');
  }

  async findByType(type: string): Promise<any[]> {
    return this.find({ type } as any);
  }

  async findNearby(latitude: number, longitude: number, radiusKm: number = 5): Promise<any[]> {
    const collection = getCollection(this.collectionName);
    return collection
      .find({
        'location.latitude': {
          $gte: latitude - radiusKm / 111,
          $lte: latitude + radiusKm / 111,
        },
        'location.longitude': {
          $gte: longitude - radiusKm / 111,
          $lte: longitude + radiusKm / 111,
        },
        status: 'active',
      } as any)
      .sort({ rating: -1 })
      .toArray();
  }

  async findByCity(city: string): Promise<any[]> {
    return this.find({ 'location.city': city, status: 'active' } as any);
  }

  async searchByName(name: string): Promise<any[]> {
    const collection = getCollection(this.collectionName);
    return collection
      .find({
        $or: [
          { name: { $regex: name, $options: 'i' } },
          { description: { $regex: name, $options: 'i' } },
        ],
      } as any)
      .toArray();
  }

  async getTopRated(limit: number = 10): Promise<any[]> {
    return this.find({ status: 'active' } as any, {
      sort: { rating: -1 },
      limit,
    });
  }
}

/**
 * Booking Repository
 */
export class BookingRepository extends BaseRepository<any> {
  constructor() {
    super('bookings');
  }

  async findByUser(userId: string, options?: any): Promise<any[]> {
    return this.find({ userId: new ObjectId(userId) } as any, options);
  }

  async findByArena(arenaId: string, options?: any): Promise<any[]> {
    return this.find({ arenaId: new ObjectId(arenaId) } as any, options);
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<any[]> {
    return this.find({
      $or: [
        { startTime: { $gte: startDate, $lte: endDate } },
        { endTime: { $gte: startDate, $lte: endDate } },
      ],
    } as any);
  }

  async checkAvailability(arenaId: string, startTime: Date, endTime: Date): Promise<boolean> {
    const count = await this.count({
      arenaId: new ObjectId(arenaId),
      status: { $in: ['confirmed', 'pending'] },
      $or: [
        { startTime: { $lt: endTime }, endTime: { $gt: startTime } },
      ],
    } as any);

    return count === 0;
  }

  async getUserUpcomingBookings(userId: string): Promise<any[]> {
    const collection = getCollection(this.collectionName);
    return collection
      .find({
        userId: new ObjectId(userId),
        startTime: { $gt: new Date() },
        status: { $in: ['confirmed', 'pending'] },
      } as any)
      .sort({ startTime: 1 })
      .toArray();
  }

  async getUserPastBookings(userId: string, limit: number = 10): Promise<any[]> {
    const collection = getCollection(this.collectionName);
    return collection
      .find({
        userId: new ObjectId(userId),
        endTime: { $lt: new Date() },
        status: 'completed',
      } as any)
      .sort({ endTime: -1 })
      .limit(limit)
      .toArray();
  }
}

/**
 * Payment Repository
 */
export class PaymentRepository extends BaseRepository<any> {
  constructor() {
    super('payments');
  }

  async findByUser(userId: string): Promise<any[]> {
    return this.find({ userId: new ObjectId(userId) } as any, {
      sort: { createdAt: -1 },
    });
  }

  async findByBooking(bookingId: string): Promise<any | null> {
    return this.findOne({ bookingId: new ObjectId(bookingId) } as any);
  }

  async findByRazorpayOrderId(orderId: string): Promise<any | null> {
    return this.findOne({ razorpayOrderId: orderId } as any);
  }

  async getTotalRevenue(startDate?: Date, endDate?: Date): Promise<number> {
    const collection = getCollection(this.collectionName);
    const pipeline: any[] = [
      { $match: { status: 'completed' } },
    ];

    if (startDate || endDate) {
      const dateMatch: any = {};
      if (startDate) dateMatch.$gte = startDate;
      if (endDate) dateMatch.$lte = endDate;
      pipeline.push({ $match: { createdAt: dateMatch } });
    }

    pipeline.push({ $group: { _id: null, total: { $sum: '$amount' } } });

    const result = await collection.aggregate(pipeline).toArray();
    return result[0]?.total || 0;
  }
}

/**
 * Review Repository
 */
export class ReviewRepository extends BaseRepository<any> {
  constructor() {
    super('reviews');
  }

  async findByArena(arenaId: string): Promise<any[]> {
    return this.find({ arenaId: new ObjectId(arenaId), status: 'approved' } as any, {
      sort: { createdAt: -1 },
    });
  }

  async findByUser(userId: string): Promise<any[]> {
    return this.find({ userId: new ObjectId(userId) } as any);
  }

  async getAverageRating(arenaId: string): Promise<number> {
    const collection = getCollection(this.collectionName);
    const result = await collection
      .aggregate([
        { $match: { arenaId: new ObjectId(arenaId), status: 'approved' } },
        { $group: { _id: null, avgRating: { $avg: '$rating' } } },
      ])
      .toArray();

    return result[0]?.avgRating || 0;
  }
}

/**
 * Wallet Repository
 */
export class WalletRepository extends BaseRepository<any> {
  constructor() {
    super('wallets');
  }

  async findByUser(userId: string): Promise<any | null> {
    return this.findOne({ userId: new ObjectId(userId) } as any);
  }

  async addTransaction(userId: string, transaction: any): Promise<any | null> {
    const collection = getCollection(this.collectionName);
    return collection.findOneAndUpdate(
      { userId: new ObjectId(userId) },
      {
        $push: { transactions: { ...transaction, timestamp: new Date() } },
        $set: { updatedAt: new Date() },
      } as any,
      { returnDocument: 'after' }
    );
  }

  async updateBalance(userId: string, newBalance: number): Promise<any | null> {
    return this.updateById(userId, { balance: newBalance } as any);
  }

  async addRewardPoints(userId: string, points: number): Promise<any | null> {
    const collection = getCollection(this.collectionName);
    return collection.findOneAndUpdate(
      { userId: new ObjectId(userId) },
      {
        $inc: { rewardPoints: points },
        $set: { updatedAt: new Date() },
      } as any,
      { returnDocument: 'after' }
    );
  }
}

/**
 * Notification Repository
 */
export class NotificationRepository extends BaseRepository<any> {
  constructor() {
    super('notifications');
  }

  async findByUser(userId: string): Promise<any[]> {
    return this.find({ userId: new ObjectId(userId) } as any, {
      sort: { createdAt: -1 },
    });
  }

  async findUnread(userId: string): Promise<any[]> {
    return this.find({ userId: new ObjectId(userId), isRead: false } as any);
  }

  async markAsRead(notificationId: string): Promise<any | null> {
    return this.updateById(notificationId, {
      isRead: true,
      readAt: new Date(),
    } as any);
  }

  async markAllAsRead(userId: string): Promise<number> {
    return this.updateMany(
      { userId: new ObjectId(userId), isRead: false } as any,
      { isRead: true, readAt: new Date() } as any
    );
  }
}

/**
 * Chat Repository
 */
export class ChatRepository extends BaseRepository<any> {
  constructor() {
    super('chatMessages');
  }

  async findConversation(userId1: string, userId2: string): Promise<any[]> {
    const oid1 = new ObjectId(userId1);
    const oid2 = new ObjectId(userId2);

    return this.find({
      $or: [
        { senderId: oid1, receiverId: oid2 },
        { senderId: oid2, receiverId: oid1 },
      ],
    } as any, {
      sort: { createdAt: 1 },
    });
  }

  async findUnreadMessages(receiverId: string): Promise<any[]> {
    return this.find({
      receiverId: new ObjectId(receiverId),
      isRead: false,
    } as any);
  }

  async markConversationAsRead(userId: string, senderId: string): Promise<number> {
    return this.updateMany(
      {
        receiverId: new ObjectId(userId),
        senderId: new ObjectId(senderId),
        isRead: false,
      } as any,
      { isRead: true, readAt: new Date() } as any
    );
  }
}
