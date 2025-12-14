import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import mongoose, { Schema, Document } from 'mongoose';
import { JWTPayload } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

// MongoDB User Interface
export interface IAuthUser extends Document {
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

// MongoDB User Schema
const AuthUserSchema = new Schema<IAuthUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update timestamp before saving
AuthUserSchema.pre('save', function() {
  this.updatedAt = new Date();
});

const AuthUser = mongoose.model<IAuthUser>('User', AuthUserSchema);

// Add default test users on startup
const initializeDefaultUsers = async () => {
  const testUserPassword = await AuthService.hashPassword('password123');
  
  const defaultUsers = [
    {
      email: 'user@example.com',
      password: testUserPassword,
      name: 'John Doe',
      phone: '+91 9876543210',
      address: '123 Main St, Bangalore',
    },
    {
      email: 'demo@test.com',
      password: testUserPassword,
      name: 'Demo User',
      phone: '+91 9123456789',
      address: '456 Park Ave, Delhi',
    },
    {
      email: 'test@crushit.com',
      password: testUserPassword,
      name: 'Test Player',
      phone: '+91 8765432100',
      address: '789 Sports Complex, Mumbai',
    },
  ];

  for (const userData of defaultUsers) {
    const existingUser = await AuthUser.findOne({ email: userData.email });
    if (!existingUser) {
      await AuthUser.create(userData);
      console.log(`   ✅ Created default user: ${userData.email}`);
    }
  }
};

export class AuthService {
  // Initialize default users on service startup
  static async initialize() {
    await initializeDefaultUsers();
  }

  // Generate JWT token
  static generateToken(userId: string, email: string): string {
    const payload: JWTPayload = { userId, email };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
  }

  // Verify JWT token
  static verifyToken(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
      return decoded;
    } catch (error) {
      return null;
    }
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  // Compare password
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Register user
  static async registerUser(email: string, password: string, name: string) {
    // Check if user exists
    const existingUser = await AuthUser.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await this.hashPassword(password);

    const newUser = await AuthUser.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
    });

    return newUser;
  }

  // Login user
  static async loginUser(email: string, password: string) {
    const user = await AuthUser.findOne({ email: email.toLowerCase() });
    
    if (!user || !user.password) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user._id.toString(), user.email);
    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;

    return { token, user: { ...userWithoutPassword, id: user._id.toString() } };
  }

  // Get user by ID
  static async getUserById(userId: string) {
    const user = await AuthUser.findById(userId);
    if (!user) return null;
    
    const userObj = user.toObject();
    const { password, ...userWithoutPassword } = userObj;
    return { ...userWithoutPassword, id: user._id.toString() };
  }

  // Update user profile
  static async updateUserProfile(userId: string, updates: Partial<IAuthUser>) {
    const user = await AuthUser.findByIdAndUpdate(
      userId,
      { ...updates, updatedAt: new Date() },
      { new: true }
    );
    
    if (!user) return null;

    const userObj = user.toObject();
    const { password, ...userWithoutPassword } = userObj;
    return { ...userWithoutPassword, id: user._id.toString() };
  }
}
