export interface PetCare {
  id: string;
  name: string;
  serviceType: 'grooming' | 'training' | 'veterinary' | 'daycare' | 'other';
  description: string;
  provider: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  pricing: {
    amount: number;
    unit: 'per_hour' | 'per_session' | 'per_day';
  };
  availability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
  }[];
  images: string[];
  rating: number;
  reviews: number;
  createdAt: Date;
  updatedAt: Date;
}
