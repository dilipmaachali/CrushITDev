/**
 * CrushIT MongoDB Schema Definition
 * Complete database schema with all collections and indexes
 */

/**
 * USERS COLLECTION
 * Stores user account information and authentication details
 */
export const usersSchema = {
  collectionName: 'users',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'name', 'createdAt'],
      properties: {
        _id: { bsonType: 'objectId' },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'User email address (unique)',
        },
        password: {
          bsonType: 'string',
          description: 'Hashed password',
        },
        name: {
          bsonType: 'string',
          description: 'Full name',
        },
        phone: {
          bsonType: 'string',
          pattern: '^\\+?[0-9]{10,15}$',
          description: 'Phone number',
        },
        avatar: {
          bsonType: 'string',
          description: 'Profile picture URL',
        },
        address: {
          bsonType: 'string',
          description: 'Home address',
        },
        location: {
          bsonType: 'object',
          properties: {
            latitude: { bsonType: 'double' },
            longitude: { bsonType: 'double' },
            address: { bsonType: 'string' },
            city: { bsonType: 'string' },
            state: { bsonType: 'string' },
          },
        },
        preferences: {
          bsonType: 'object',
          properties: {
            favoriteArenas: {
              bsonType: 'array',
              items: { bsonType: 'objectId' },
            },
            preferredSports: {
              bsonType: 'array',
              items: { bsonType: 'string' },
            },
            notificationsEnabled: { bsonType: 'bool' },
            newsletter: { bsonType: 'bool' },
          },
        },
        wallet: {
          bsonType: 'object',
          properties: {
            balance: { bsonType: 'double' },
            currency: { bsonType: 'string' },
            rewardPoints: { bsonType: 'int' },
          },
        },
        stats: {
          bsonType: 'object',
          properties: {
            bookingsCount: { bsonType: 'int' },
            totalSpent: { bsonType: 'double' },
            gamesPlayed: { bsonType: 'int' },
            averageRating: { bsonType: 'double' },
            totalReviews: { bsonType: 'int' },
          },
        },
        status: {
          enum: ['active', 'inactive', 'suspended', 'deleted'],
          description: 'Account status',
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
        lastLoginAt: { bsonType: 'date' },
      },
    },
  },
  indexes: [
    { key: { email: 1 }, unique: true },
    { key: { phone: 1 }, unique: true, sparse: true },
    { key: { createdAt: -1 } },
    { key: { 'location.latitude': 1, 'location.longitude': 1 } },
    { key: { status: 1 } },
  ],
};

/**
 * ARENAS COLLECTION
 * Stores sports venues/arenas information
 */
export const arenasSchema = {
  collectionName: 'arenas',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'type', 'location', 'pricing'],
      properties: {
        _id: { bsonType: 'objectId' },
        name: { bsonType: 'string' },
        type: {
          enum: ['cricket', 'football', 'badminton', 'tennis', 'basketball', 'squash', 'ps5', 'vr', 'other'],
          description: 'Sport type',
        },
        description: { bsonType: 'string' },
        ownerId: { bsonType: 'objectId' },
        location: {
          bsonType: 'object',
          required: ['latitude', 'longitude', 'address'],
          properties: {
            latitude: { bsonType: 'double' },
            longitude: { bsonType: 'double' },
            address: { bsonType: 'string' },
            city: { bsonType: 'string' },
            state: { bsonType: 'string' },
            country: { bsonType: 'string' },
            postalCode: { bsonType: 'string' },
          },
        },
        pricing: {
          bsonType: 'object',
          properties: {
            hourly: { bsonType: 'double' },
            daily: { bsonType: 'double' },
            currency: { bsonType: 'string' },
            discountPercentage: { bsonType: 'double' },
          },
        },
        availability: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              dayOfWeek: { bsonType: 'int' }, // 0-6 (Monday-Sunday)
              startTime: { bsonType: 'string' }, // HH:mm
              endTime: { bsonType: 'string' }, // HH:mm
              isAvailable: { bsonType: 'bool' },
            },
          },
        },
        amenities: {
          bsonType: 'array',
          items: { bsonType: 'string' },
          description: 'e.g., Parking, WiFi, Locker, Lights',
        },
        images: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              url: { bsonType: 'string' },
              caption: { bsonType: 'string' },
              isPrimary: { bsonType: 'bool' },
            },
          },
        },
        rating: {
          bsonType: 'double',
          minimum: 0,
          maximum: 5,
        },
        reviewCount: { bsonType: 'int' },
        capacity: { bsonType: 'int' },
        contactPerson: {
          bsonType: 'object',
          properties: {
            name: { bsonType: 'string' },
            phone: { bsonType: 'string' },
            email: { bsonType: 'string' },
          },
        },
        status: {
          enum: ['active', 'inactive', 'closed', 'maintenance'],
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
      },
    },
  },
  indexes: [
    { key: { type: 1 } },
    { key: { 'location.latitude': 1, 'location.longitude': 1 } },
    { key: { 'location.city': 1 } },
    { key: { rating: -1 } },
    { key: { status: 1 } },
    { key: { ownerId: 1 } },
    { key: { createdAt: -1 } },
    // Geospatial index for location-based queries
    { key: { 'location.latitude': '2dsphere', 'location.longitude': '2dsphere' } },
  ],
};

/**
 * BOOKINGS COLLECTION
 * Stores arena booking information
 */
export const bookingsSchema = {
  collectionName: 'bookings',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'arenaId', 'startTime', 'endTime', 'status'],
      properties: {
        _id: { bsonType: 'objectId' },
        bookingId: {
          bsonType: 'string',
          description: 'Unique booking reference number',
        },
        userId: { bsonType: 'objectId' },
        arenaId: { bsonType: 'objectId' },
        startTime: { bsonType: 'date' },
        endTime: { bsonType: 'date' },
        duration: {
          bsonType: 'int',
          description: 'Duration in hours',
        },
        cost: {
          bsonType: 'object',
          properties: {
            basePrice: { bsonType: 'double' },
            discount: { bsonType: 'double' },
            tax: { bsonType: 'double' },
            totalAmount: { bsonType: 'double' },
            currency: { bsonType: 'string' },
          },
        },
        status: {
          enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
        },
        paymentStatus: {
          enum: ['unpaid', 'partial', 'paid', 'refunded'],
        },
        paymentId: { bsonType: 'objectId', description: 'Reference to payments collection' },
        participants: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              userId: { bsonType: 'objectId' },
              name: { bsonType: 'string' },
              email: { bsonType: 'string' },
              isConfirmed: { bsonType: 'bool' },
            },
          },
        },
        notes: { bsonType: 'string' },
        cancellationReason: { bsonType: 'string' },
        cancellationTime: { bsonType: 'date' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
      },
    },
  },
  indexes: [
    { key: { userId: 1, createdAt: -1 } },
    { key: { arenaId: 1 } },
    { key: { status: 1 } },
    { key: { paymentStatus: 1 } },
    { key: { startTime: 1, endTime: 1 } },
    { key: { bookingId: 1 }, unique: true },
  ],
};

/**
 * PAYMENTS COLLECTION
 * Stores payment transaction information
 */
export const paymentsSchema = {
  collectionName: 'payments',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'amount', 'status'],
      properties: {
        _id: { bsonType: 'objectId' },
        userId: { bsonType: 'objectId' },
        bookingId: { bsonType: 'objectId', description: 'Associated booking' },
        amount: { bsonType: 'double' },
        currency: { bsonType: 'string' },
        paymentMethod: {
          enum: ['credit_card', 'debit_card', 'wallet', 'upi', 'bank_transfer', 'other'],
        },
        razorpayOrderId: { bsonType: 'string' },
        razorpayPaymentId: { bsonType: 'string' },
        razorpaySignature: { bsonType: 'string' },
        status: {
          enum: ['initiated', 'pending', 'completed', 'failed', 'refunded'],
        },
        refundAmount: { bsonType: 'double' },
        refundReason: { bsonType: 'string' },
        refundStatus: {
          enum: ['none', 'initiated', 'processing', 'completed', 'failed'],
        },
        metadata: {
          bsonType: 'object',
          additionalProperties: true,
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
      },
    },
  },
  indexes: [
    { key: { userId: 1, createdAt: -1 } },
    { key: { bookingId: 1 } },
    { key: { status: 1 } },
    { key: { razorpayOrderId: 1 }, unique: true, sparse: true },
    { key: { razorpayPaymentId: 1 }, unique: true, sparse: true },
  ],
};

/**
 * WALLET COLLECTION
 * Stores user wallet balance and transaction history
 */
export const walletsSchema = {
  collectionName: 'wallets',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'balance'],
      properties: {
        _id: { bsonType: 'objectId' },
        userId: { bsonType: 'objectId', description: 'User reference' },
        balance: { bsonType: 'double' },
        rewardPoints: { bsonType: 'int' },
        currency: { bsonType: 'string' },
        transactions: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              transactionId: { bsonType: 'objectId' },
              type: {
                enum: ['credit', 'debit', 'refund', 'bonus'],
              },
              amount: { bsonType: 'double' },
              description: { bsonType: 'string' },
              relatedBooking: { bsonType: 'objectId' },
              relatedPayment: { bsonType: 'objectId' },
              timestamp: { bsonType: 'date' },
            },
          },
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
      },
    },
  },
  indexes: [
    { key: { userId: 1 }, unique: true },
    { key: { updatedAt: -1 } },
  ],
};

/**
 * REVIEWS COLLECTION
 * Stores user reviews and ratings for arenas
 */
export const reviewsSchema = {
  collectionName: 'reviews',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'arenaId', 'rating', 'createdAt'],
      properties: {
        _id: { bsonType: 'objectId' },
        userId: { bsonType: 'objectId' },
        arenaId: { bsonType: 'objectId' },
        bookingId: { bsonType: 'objectId', description: 'Associated booking' },
        rating: {
          bsonType: 'int',
          minimum: 1,
          maximum: 5,
        },
        title: { bsonType: 'string' },
        comment: { bsonType: 'string' },
        images: {
          bsonType: 'array',
          items: { bsonType: 'string' },
        },
        helpfulCount: { bsonType: 'int' },
        status: {
          enum: ['pending', 'approved', 'rejected', 'reported'],
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
      },
    },
  },
  indexes: [
    { key: { arenaId: 1, rating: -1 } },
    { key: { userId: 1 } },
    { key: { bookingId: 1 } },
    { key: { status: 1 } },
    { key: { createdAt: -1 } },
  ],
};

/**
 * PRODUCTS COLLECTION
 * Stores sports equipment and merchandise products
 */
export const productsSchema = {
  collectionName: 'products',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'category', 'price'],
      properties: {
        _id: { bsonType: 'objectId' },
        name: { bsonType: 'string' },
        description: { bsonType: 'string' },
        category: { bsonType: 'string' },
        subcategory: { bsonType: 'string' },
        price: { bsonType: 'double' },
        discountPrice: { bsonType: 'double' },
        currency: { bsonType: 'string' },
        images: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              url: { bsonType: 'string' },
              alt: { bsonType: 'string' },
            },
          },
        },
        stock: { bsonType: 'int' },
        sku: { bsonType: 'string' },
        rating: { bsonType: 'double' },
        reviewCount: { bsonType: 'int' },
        vendorId: { bsonType: 'objectId' },
        tags: {
          bsonType: 'array',
          items: { bsonType: 'string' },
        },
        specifications: {
          bsonType: 'object',
          additionalProperties: true,
        },
        status: {
          enum: ['active', 'inactive', 'discontinued'],
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
      },
    },
  },
  indexes: [
    { key: { category: 1 } },
    { key: { name: 'text', description: 'text' } },
    { key: { price: 1 } },
    { key: { rating: -1 } },
    { key: { status: 1 } },
    { key: { vendorId: 1 } },
  ],
};

/**
 * PET_CARE COLLECTION
 * Stores pet care services and providers
 */
export const petCareSchema = {
  collectionName: 'petCare',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'serviceType', 'providerId'],
      properties: {
        _id: { bsonType: 'objectId' },
        name: { bsonType: 'string' },
        description: { bsonType: 'string' },
        serviceType: {
          enum: ['grooming', 'training', 'boarding', 'veterinary', 'nutrition', 'other'],
        },
        providerId: { bsonType: 'objectId' },
        location: {
          bsonType: 'object',
          properties: {
            latitude: { bsonType: 'double' },
            longitude: { bsonType: 'double' },
            address: { bsonType: 'string' },
            city: { bsonType: 'string' },
          },
        },
        pricing: {
          bsonType: 'object',
          properties: {
            basePrice: { bsonType: 'double' },
            currency: { bsonType: 'string' },
            pricingModel: {
              enum: ['hourly', 'daily', 'per_service'],
            },
          },
        },
        petTypes: {
          bsonType: 'array',
          items: { bsonType: 'string' }, // e.g., ['dog', 'cat', 'bird']
        },
        availability: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              dayOfWeek: { bsonType: 'int' },
              startTime: { bsonType: 'string' },
              endTime: { bsonType: 'string' },
            },
          },
        },
        rating: { bsonType: 'double' },
        reviewCount: { bsonType: 'int' },
        images: {
          bsonType: 'array',
          items: { bsonType: 'string' },
        },
        certifications: {
          bsonType: 'array',
          items: { bsonType: 'string' },
        },
        status: {
          enum: ['active', 'inactive', 'closed'],
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
      },
    },
  },
  indexes: [
    { key: { serviceType: 1 } },
    { key: { providerId: 1 } },
    { key: { 'location.latitude': '2dsphere', 'location.longitude': '2dsphere' } },
    { key: { rating: -1 } },
    { key: { status: 1 } },
  ],
};

/**
 * CHAT_MESSAGES COLLECTION
 * Stores chat messages between users and support
 */
export const chatMessagesSchema = {
  collectionName: 'chatMessages',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['senderId', 'message', 'createdAt'],
      properties: {
        _id: { bsonType: 'objectId' },
        conversationId: { bsonType: 'objectId' },
        senderId: { bsonType: 'objectId' },
        receiverId: { bsonType: 'objectId' },
        message: { bsonType: 'string' },
        messageType: {
          enum: ['text', 'image', 'file', 'booking_update'],
        },
        attachments: {
          bsonType: 'array',
          items: {
            bsonType: 'object',
            properties: {
              type: { bsonType: 'string' },
              url: { bsonType: 'string' },
              name: { bsonType: 'string' },
            },
          },
        },
        isRead: { bsonType: 'bool' },
        readAt: { bsonType: 'date' },
        status: {
          enum: ['sent', 'delivered', 'read', 'failed'],
        },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
      },
    },
  },
  indexes: [
    { key: { conversationId: 1, createdAt: -1 } },
    { key: { senderId: 1 } },
    { key: { receiverId: 1 } },
    { key: { isRead: 1 } },
    { key: { createdAt: -1 } },
  ],
};

/**
 * NOTIFICATIONS COLLECTION
 * Stores user notifications
 */
export const notificationsSchema = {
  collectionName: 'notifications',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'type', 'createdAt'],
      properties: {
        _id: { bsonType: 'objectId' },
        userId: { bsonType: 'objectId' },
        type: {
          enum: [
            'booking_confirmed',
            'booking_cancelled',
            'payment_received',
            'review_requested',
            'arena_update',
            'promotion',
            'reminder',
            'other',
          ],
        },
        title: { bsonType: 'string' },
        message: { bsonType: 'string' },
        relatedBooking: { bsonType: 'objectId' },
        relatedArena: { bsonType: 'objectId' },
        actionUrl: { bsonType: 'string' },
        isRead: { bsonType: 'bool' },
        readAt: { bsonType: 'date' },
        priority: {
          enum: ['low', 'medium', 'high', 'urgent'],
        },
        sentvia: {
          bsonType: 'array',
          items: {
            enum: ['in_app', 'email', 'push', 'sms'],
          },
        },
        createdAt: { bsonType: 'date' },
        expiresAt: { bsonType: 'date' },
      },
    },
  },
  indexes: [
    { key: { userId: 1, createdAt: -1 } },
    { key: { isRead: 1 } },
    { key: { type: 1 } },
    { key: { expiresAt: 1 }, expireAfterSeconds: 0 }, // TTL index
  ],
};

/**
 * TRANSACTIONS COLLECTION
 * Stores all wallet and payment transactions
 */
export const transactionsSchema = {
  collectionName: 'transactions',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'type', 'amount', 'status'],
      properties: {
        _id: { bsonType: 'objectId' },
        transactionId: {
          bsonType: 'string',
          description: 'Unique transaction reference',
        },
        userId: { bsonType: 'objectId' },
        type: {
          enum: ['booking', 'refund', 'wallet_topup', 'reward', 'penalty'],
        },
        amount: { bsonType: 'double' },
        currency: { bsonType: 'string' },
        status: {
          enum: ['pending', 'completed', 'failed', 'cancelled'],
        },
        relatedBooking: { bsonType: 'objectId' },
        relatedPayment: { bsonType: 'objectId' },
        description: { bsonType: 'string' },
        metadata: {
          bsonType: 'object',
          additionalProperties: true,
        },
        createdAt: { bsonType: 'date' },
        completedAt: { bsonType: 'date' },
      },
    },
  },
  indexes: [
    { key: { userId: 1, createdAt: -1 } },
    { key: { transactionId: 1 }, unique: true },
    { key: { status: 1 } },
    { key: { type: 1 } },
    { key: { createdAt: -1 } },
  ],
};

/**
 * PROMOTIONS_COLLECTION
 * Stores promotional offers and discounts
 */
export const promotionsSchema = {
  collectionName: 'promotions',
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['code', 'discountType', 'discountValue', 'startDate', 'endDate'],
      properties: {
        _id: { bsonType: 'objectId' },
        code: {
          bsonType: 'string',
          description: 'Unique promotion code',
        },
        description: { bsonType: 'string' },
        discountType: {
          enum: ['percentage', 'fixed_amount'],
        },
        discountValue: { bsonType: 'double' },
        maxDiscount: { bsonType: 'double' },
        minOrderValue: { bsonType: 'double' },
        usageLimit: { bsonType: 'int' },
        usedCount: { bsonType: 'int' },
        usagePerUser: { bsonType: 'int' },
        applicableArenas: {
          bsonType: 'array',
          items: { bsonType: 'objectId' },
          description: 'Empty array means applicable to all',
        },
        applicableTo: {
          enum: ['all_users', 'new_users', 'specific_users'],
        },
        specificUsers: {
          bsonType: 'array',
          items: { bsonType: 'objectId' },
        },
        startDate: { bsonType: 'date' },
        endDate: { bsonType: 'date' },
        status: {
          enum: ['active', 'inactive', 'expired'],
        },
        createdBy: { bsonType: 'objectId' },
        createdAt: { bsonType: 'date' },
        updatedAt: { bsonType: 'date' },
      },
    },
  },
  indexes: [
    { key: { code: 1 }, unique: true },
    { key: { status: 1 } },
    { key: { startDate: 1, endDate: 1 } },
    { key: { usedCount: -1 } },
  ],
};

/**
 * EXPORT ALL SCHEMAS
 */
export const allSchemas = [
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
