import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { JWTPayload, AuthUser } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRY = '7d';

// Mock user storage (in real app, use database)
const users: Map<string, AuthUser> = new Map();

// Add default test users on startup
const initializeDefaultUsers = async () => {
  const testUserPassword = await AuthService.hashPassword('password123');
  
  const defaultUsers: AuthUser[] = [
    {
      id: 'user_default_1',
      email: 'user@example.com',
      password: testUserPassword,
      name: 'John Doe',
      phone: '+91 9876543210',
      address: '123 Main St, Bangalore',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'user_default_2',
      email: 'demo@test.com',
      password: testUserPassword,
      name: 'Demo User',
      phone: '+91 9123456789',
      address: '456 Park Ave, Delhi',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
    {
      id: 'user_default_3',
      email: 'test@crushit.com',
      password: testUserPassword,
      name: 'Test Player',
      phone: '+91 8765432100',
      address: '789 Sports Complex, Mumbai',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    },
  ];

  defaultUsers.forEach(user => users.set(user.id, user));
};

export class AuthService {
  // Initialize default users on service startup
  static async initialize() {
    if (users.size === 0) {
      await initializeDefaultUsers();
    }
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
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await this.hashPassword(password);
    const userId = `user_${Date.now()}`;

    const newUser: AuthUser = {
      id: userId,
      email,
      password: hashedPassword,
      name,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    users.set(userId, newUser);
    return newUser;
  }

  // Login user
  static async loginUser(email: string, password: string) {
    const user = Array.from(users.values()).find(u => u.email === email);
    
    if (!user || !user.password) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = this.generateToken(user.id, user.email);
    const { password: _, ...userWithoutPassword } = user;

    return { token, user: userWithoutPassword };
  }

  // Get user by ID
  static getUserById(userId: string) {
    const user = users.get(userId);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Update user profile
  static updateUserProfile(userId: string, updates: Partial<AuthUser>) {
    const user = users.get(userId);
    if (!user) return null;

    const updated = { ...user, ...updates, updatedAt: new Date() };
    users.set(userId, updated);

    const { password, ...userWithoutPassword } = updated;
    return userWithoutPassword;
  }
}
