import type { PetCare } from '@/models/PetCare';

export const petcareData: PetCare[] = [
  {
    id: '1',
    name: 'Paws & Grooming Studio',
    serviceType: 'grooming',
    description: 'Professional pet grooming and spa services',
    provider: 'Paws Studio',
    location: {
      latitude: 12.9716,
      longitude: 77.5946,
      address: 'Bangalore, Karnataka',
    },
    pricing: { amount: 500, unit: 'per_session' },
    availability: [
      { dayOfWeek: 1, startTime: '10:00', endTime: '18:00' },
      { dayOfWeek: 6, startTime: '10:00', endTime: '16:00' },
    ],
    images: ['https://via.placeholder.com/300x200?text=Pet+Grooming'],
    rating: 4.9,
    reviews: 234,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
