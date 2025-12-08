import type { Review, Notification, TimeSlot, UserPreferences } from '../models';

export const reviewsData: Review[] = [
  {
    id: 'review1',
    arenaId: '1',
    userId: 'user1',
    rating: 5,
    title: 'Excellent cricket ground',
    comment: 'Perfect pitch quality, well maintained facilities. Highly recommended!',
    helpful: 12,
    createdAt: new Date('2025-12-01'),
    updatedAt: new Date('2025-12-01'),
  },
  {
    id: 'review2',
    arenaId: '1',
    userId: 'user2',
    rating: 4,
    title: 'Good experience',
    comment: 'Great amenities and friendly staff. Could improve parking.',
    helpful: 8,
    createdAt: new Date('2025-11-28'),
    updatedAt: new Date('2025-11-28'),
  },
  {
    id: 'review3',
    arenaId: '2',
    userId: 'user3',
    rating: 5,
    title: 'Best football ground in Delhi',
    comment: 'Professional level ground with excellent floodlights and maintenance.',
    helpful: 15,
    createdAt: new Date('2025-11-25'),
    updatedAt: new Date('2025-11-25'),
  },
];

export const notificationsData: Notification[] = [
  {
    id: 'notif1',
    userId: 'user1',
    type: 'booking',
    title: 'Booking Confirmed',
    message: 'Your booking at Elite Cricket Turf on Dec 10 at 6 PM is confirmed',
    read: false,
    createdAt: new Date(),
  },
  {
    id: 'notif2',
    userId: 'user1',
    type: 'promotion',
    title: 'Special Offer',
    message: 'Get 20% off on your next booking. Use code: CRUSH20',
    read: false,
    createdAt: new Date(Date.now() - 3600000),
  },
];

export const timeSlotsData: TimeSlot[] = [
  {
    id: 'slot1',
    arenaId: '1',
    date: '2025-12-10',
    startTime: '06:00',
    endTime: '07:00',
    booked: false,
    price: 500,
  },
  {
    id: 'slot2',
    arenaId: '1',
    date: '2025-12-10',
    startTime: '17:00',
    endTime: '18:00',
    booked: true,
    bookingId: 'BK123',
    price: 500,
  },
  {
    id: 'slot3',
    arenaId: '1',
    date: '2025-12-10',
    startTime: '18:00',
    endTime: '19:00',
    booked: false,
    price: 600,
  },
];

export const userPreferencesData: UserPreferences[] = [
  {
    userId: 'user1',
    favoriteArenas: ['1', '2'],
    favoriteTypes: ['cricket', 'football'],
    notificationsEnabled: true,
    emailNotifications: true,
    paymentMethod: 'wallet',
  },
];
