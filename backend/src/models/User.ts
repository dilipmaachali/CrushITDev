export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  wallet: {
    balance: number;
    currency: string;
  };
  stats: {
    bookingsCount: number;
    totalSpent: number;
    gamesPlayed: number;
  };
  createdAt: Date;
  updatedAt: Date;
}
