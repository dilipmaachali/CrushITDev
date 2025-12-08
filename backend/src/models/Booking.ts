export interface Booking {
  id: string;
  userId: string;
  arenaId: string;
  bookingDate: Date;
  startTime: string;
  endTime: string;
  players: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentId?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
