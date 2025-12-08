export interface ChatMessage {
  id: string;
  userId: string;
  userMessage: string;
  botResponse: string;
  intent: 'booking' | 'cancel' | 'modify' | 'view' | 'help' | 'other';
  bookingId?: string;
  arenaId?: string;
  timestamp: Date;
}

export interface BookingCommand {
  action: 'book' | 'cancel' | 'modify' | 'view';
  arenaName?: string;
  date?: string;
  time?: string;
  duration?: number;
  bookingId?: string;
}
