export interface Review {
  id: string;
  arenaId: string;
  userId: string;
  rating: number; // 1-5
  title: string;
  comment: string;
  images?: string[];
  helpful: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'booking' | 'cancellation' | 'promotion' | 'message' | 'payment';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
}

export interface SearchFilters {
  search?: string;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  amenities?: string[];
  minRating?: number;
  type?: string;
  sortBy?: 'price' | 'rating' | 'distance' | 'newest';
  sortOrder?: 'asc' | 'desc';
}

export interface TimeSlot {
  id: string;
  arenaId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  booked: boolean;
  bookingId?: string;
  price: number;
}

export interface UserPreferences {
  userId: string;
  favoriteArenas: string[];
  favoriteTypes: string[];
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  paymentMethod: 'wallet' | 'card' | 'upi';
}
