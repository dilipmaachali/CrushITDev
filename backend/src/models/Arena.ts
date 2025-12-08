export interface Arena {
  id: string;
  name: string;
  type: 'cricket' | 'football' | 'badminton' | 'ps5' | 'vr' | 'other';
  description: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  pricing: number; // per hour
  availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  images: string[];
  rating: number;
  reviews: number;
  amenities: string[];
  createdAt: Date;
  updatedAt: Date;
}
