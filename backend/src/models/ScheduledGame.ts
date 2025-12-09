import mongoose, { Schema, Document } from 'mongoose';

export interface IScheduledGame extends Document {
  gameId: string;
  sport: 'cricket' | 'football' | 'badminton' | 'tennis' | 'basketball';
  title: string;
  description: string;
  
  // Host and Co-hosts
  hostId: string;
  hostName: string;
  coHosts: Array<{
    userId: string;
    userName: string;
    addedAt: Date;
  }>;
  
  // Game Details
  scheduledDate: Date;
  startTime: string;
  endTime: string;
  location: {
    arenaId?: string;
    arenaName?: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };
  
  // Player Management
  maxPlayers: number;
  minPlayers: number;
  currentPlayers: Array<{
    userId: string;
    userName: string;
    gender: 'male' | 'female' | 'other';
    skillLevel?: 'beginner' | 'intermediate' | 'advanced';
    joinedAt: Date;
    status: 'confirmed' | 'pending';
  }>;
  
  // Invite Requests
  inviteRequests: Array<{
    userId: string;
    userName: string;
    gender: 'male' | 'female' | 'other';
    requestedAt: Date;
    status: 'pending' | 'accepted' | 'rejected';
    message?: string;
  }>;
  
  // Invitations Sent
  sentInvites: Array<{
    userId: string;
    userName: string;
    invitedAt: Date;
    status: 'pending' | 'accepted' | 'declined';
  }>;
  
  // Payment Options
  paymentType: 'prepaid' | 'pay_later' | 'free';
  costPerPlayer?: number;
  currency: string;
  paymentDeadline?: Date;
  paymentDetails?: {
    totalAmount?: number;
    paidPlayers: Array<{
      userId: string;
      amount: number;
      paidAt: Date;
      transactionId: string;
    }>;
  };
  
  // Game Settings
  isPublic: boolean;
  allowJoinRequests: boolean;
  genderRestriction?: 'all' | 'male_only' | 'female_only' | 'mixed';
  skillLevelRequired?: 'beginner' | 'intermediate' | 'advanced';
  
  // Game Status
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  gameResult?: {
    winnerId?: string;
    winnerName?: string;
    scores: Array<{
      userId: string;
      userName: string;
      score: number;
    }>;
  };
  
  // Share Settings
  shareableLink?: string;
  shareCode?: string;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

const ScheduledGameSchema = new Schema<IScheduledGame>(
  {
    gameId: {
      type: String,
      required: true,
      unique: true,
      default: () => `GAME${Date.now()}`,
    },
    sport: {
      type: String,
      required: true,
      enum: ['cricket', 'football', 'badminton', 'tennis', 'basketball'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    
    // Host and Co-hosts
    hostId: {
      type: String,
      required: true,
    },
    hostName: {
      type: String,
      required: true,
    },
    coHosts: [
      {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        addedAt: { type: Date, default: Date.now },
      },
    ],
    
    // Game Details
    scheduledDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    location: {
      arenaId: String,
      arenaName: String,
      address: { type: String, required: true },
      latitude: Number,
      longitude: Number,
    },
    
    // Player Management
    maxPlayers: {
      type: Number,
      required: true,
      min: 2,
    },
    minPlayers: {
      type: Number,
      required: true,
      min: 2,
    },
    currentPlayers: [
      {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        gender: {
          type: String,
          enum: ['male', 'female', 'other'],
          required: true,
        },
        skillLevel: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced'],
        },
        joinedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['confirmed', 'pending'],
          default: 'confirmed',
        },
      },
    ],
    
    // Invite Requests
    inviteRequests: [
      {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        gender: {
          type: String,
          enum: ['male', 'female', 'other'],
          required: true,
        },
        requestedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'rejected'],
          default: 'pending',
        },
        message: String,
      },
    ],
    
    // Invitations Sent
    sentInvites: [
      {
        userId: { type: String, required: true },
        userName: { type: String, required: true },
        invitedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['pending', 'accepted', 'declined'],
          default: 'pending',
        },
      },
    ],
    
    // Payment Options
    paymentType: {
      type: String,
      required: true,
      enum: ['prepaid', 'pay_later', 'free'],
      default: 'free',
    },
    costPerPlayer: {
      type: Number,
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    paymentDeadline: Date,
    paymentDetails: {
      totalAmount: Number,
      paidPlayers: [
        {
          userId: String,
          amount: Number,
          paidAt: Date,
          transactionId: String,
        },
      ],
    },
    
    // Game Settings
    isPublic: {
      type: Boolean,
      default: true,
    },
    allowJoinRequests: {
      type: Boolean,
      default: true,
    },
    genderRestriction: {
      type: String,
      enum: ['all', 'male_only', 'female_only', 'mixed'],
      default: 'all',
    },
    skillLevelRequired: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
    },
    
    // Game Status
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    gameResult: {
      winnerId: String,
      winnerName: String,
      scores: [
        {
          userId: String,
          userName: String,
          score: Number,
        },
      ],
    },
    
    // Share Settings
    shareableLink: String,
    shareCode: String,
    
    cancelledAt: Date,
    cancellationReason: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ScheduledGameSchema.index({ hostId: 1, status: 1 });
ScheduledGameSchema.index({ scheduledDate: 1, status: 1 });
ScheduledGameSchema.index({ sport: 1, status: 1 });
ScheduledGameSchema.index({ shareCode: 1 });
ScheduledGameSchema.index({ 'location.arenaId': 1 });
ScheduledGameSchema.index({ genderRestriction: 1, isPublic: 1 });

export const ScheduledGame = mongoose.model<IScheduledGame>('ScheduledGame', ScheduledGameSchema);
