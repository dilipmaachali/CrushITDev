import type { User } from '@/models/User';

export const usersData: User[] = [
  {
    id: '1',
    email: 'john@crushit.app',
    phone: '+919876543210',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://via.placeholder.com/100x100?text=John',
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
    },
    wallet: { balance: 5000, currency: 'INR' },
    stats: {
      bookingsCount: 12,
      totalSpent: 8500,
      gamesPlayed: 45,
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
