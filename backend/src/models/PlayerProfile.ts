import mongoose, { Schema, Document } from 'mongoose';

export interface IPlayerProfile extends Document {
  userId: string;
  userName: string;
  email: string;
  
  // Personal Details
  firstName: string;
  lastName: string;
  gender: 'male' | 'female' | 'other';
  dateOfBirth?: Date;
  phone?: string;
  
  // Location
  location: {
    city?: string;
    area?: string;
    latitude?: number;
    longitude?: number;
  };
  
  // Player Preferences
  sports: Array<{
    sport: 'cricket' | 'football' | 'badminton' | 'tennis' | 'basketball';
    skillLevel: 'beginner' | 'intermediate' | 'advanced';
    preferredPosition?: string;
    yearsOfExperience?: number;
  }>;
  
  // Availability
  availability: {
    preferredDays: string[]; // ['Monday', 'Tuesday', etc.]
    preferredTimes: string[]; // ['morning', 'afternoon', 'evening', 'night']
    willingToTravel: boolean;
    maxTravelDistance?: number; // in km
  };
  
  // Player Stats
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    gamesHosted: number;
    totalScore: number;
    averageScore: number;
    rating: number; // 0-5
    reviews: number;
  };
  
  // Visibility & Discovery
  isPublicProfile: boolean;
  lookingForPlayers: boolean;
  openToInvites: boolean;
  genderPreference: 'all' | 'male_only' | 'female_only' | 'same_gender';
  
  // Verification
  isVerified: boolean;
  verificationDocuments?: Array<{
    type: string;
    url: string;
    verifiedAt?: Date;
  }>;
  
  // Social
  profilePicture?: string;
  bio?: string;
  achievements: string[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  lastActive?: Date;
}

const PlayerProfileSchema = new Schema<IPlayerProfile>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    
    // Personal Details
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    gender: {
      type: String,
      required: true,
      enum: ['male', 'female', 'other'],
    },
    dateOfBirth: Date,
    phone: String,
    
    // Location
    location: {
      city: String,
      area: String,
      latitude: Number,
      longitude: Number,
    },
    
    // Player Preferences
    sports: [
      {
        sport: {
          type: String,
          enum: ['cricket', 'football', 'badminton', 'tennis', 'basketball'],
          required: true,
        },
        skillLevel: {
          type: String,
          enum: ['beginner', 'intermediate', 'advanced'],
          required: true,
        },
        preferredPosition: String,
        yearsOfExperience: Number,
      },
    ],
    
    // Availability
    availability: {
      preferredDays: [String],
      preferredTimes: [String],
      willingToTravel: { type: Boolean, default: true },
      maxTravelDistance: Number,
    },
    
    // Player Stats
    stats: {
      gamesPlayed: { type: Number, default: 0 },
      gamesWon: { type: Number, default: 0 },
      gamesHosted: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      rating: { type: Number, default: 0, min: 0, max: 5 },
      reviews: { type: Number, default: 0 },
    },
    
    // Visibility & Discovery
    isPublicProfile: {
      type: Boolean,
      default: true,
    },
    lookingForPlayers: {
      type: Boolean,
      default: false,
    },
    openToInvites: {
      type: Boolean,
      default: true,
    },
    genderPreference: {
      type: String,
      enum: ['all', 'male_only', 'female_only', 'same_gender'],
      default: 'all',
    },
    
    // Verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationDocuments: [
      {
        type: String,
        url: String,
        verifiedAt: Date,
      },
    ],
    
    // Social
    profilePicture: String,
    bio: String,
    achievements: [String],
    
    lastActive: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for player discovery
PlayerProfileSchema.index({ gender: 1, isPublicProfile: 1 });
PlayerProfileSchema.index({ 'sports.sport': 1, 'sports.skillLevel': 1 });
PlayerProfileSchema.index({ lookingForPlayers: 1, openToInvites: 1 });
PlayerProfileSchema.index({ 'location.city': 1 });
PlayerProfileSchema.index({ 'stats.rating': -1 });

export const PlayerProfile = mongoose.model<IPlayerProfile>('PlayerProfile', PlayerProfileSchema);
