import { ChatMessage } from '../models';

export const chatMessages: ChatMessage[] = [
  {
    id: 'chat1',
    userId: 'user1',
    userMessage: 'Hi, I want to book a badminton court',
    botResponse: 'Great! I can help you book a badminton court. Which date and time would you prefer?',
    intent: 'booking',
    arenaId: 'arena1',
    timestamp: new Date('2025-12-05T10:00:00'),
  },
  {
    id: 'chat2',
    userId: 'user1',
    userMessage: 'I need to cancel my booking for tomorrow',
    botResponse: 'I found your booking for tomorrow. Would you like to cancel it? This action cannot be undone.',
    intent: 'cancel',
    bookingId: 'booking1',
    timestamp: new Date('2025-12-05T11:00:00'),
  },
];

export const chatTemplates = {
  greeting: 'Hello! 👋 Welcome to CrushIT. I can help you book arenas, manage bookings, shop for sports gear, and more. What would you like to do?',
  booking: {
    start: 'Which arena would you like to book? You can say the name or I can show available options.',
    selectDate: 'What date would you like to book? (e.g., Tomorrow, Dec 10, 2025)',
    selectTime: 'What time would you prefer? (e.g., 6 PM, 18:00)',
    selectDuration: 'How long would you like to book? (e.g., 1 hour, 2 hours)',
    confirm: 'Perfect! Confirming your booking:\n• Arena: {arena}\n• Date: {date}\n• Time: {time}\n• Duration: {duration}\n\nShall I proceed?',
    success: '✅ Your booking is confirmed! Booking ID: {bookingId}',
    error: '❌ Sorry, this time slot is not available. Would you like to try another time?',
  },
  cancel: {
    start: 'I can help you cancel a booking. Which booking would you like to cancel?',
    confirm: 'Are you sure you want to cancel booking {bookingId}? You will receive a refund.',
    success: '✅ Booking cancelled successfully. Refund has been processed.',
    error: '❌ Could not cancel booking. Please try again.',
  },
  modify: {
    start: 'Which booking would you like to modify?',
    options: 'What would you like to change?\n1. Date\n2. Time\n3. Duration',
    success: '✅ Your booking has been updated!',
    error: '❌ Could not modify booking. Please try again.',
  },
  help: "Here is what I can help you with:\n📍 Book arenas\n❌ Cancel bookings\n✏️ Modify bookings\n👀 View your bookings\n🛒 Shop sports gear\n💰 Check wallet\n⭐ Pet care services\nWhat would you like to do?",
};
