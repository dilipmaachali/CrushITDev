import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { arenas, products, petcarePartners, users, chatMessages, chatTemplates, reviews, notifications, timeSlots, userPreferences, payments, wallets } from '@/data';
import { ChatMessage, BookingCommand, AuthRequest, Review, Notification } from '@/models';
import { AuthService } from '@/services/AuthService';
import PaymentService from '@/services/PaymentService';
import LocationService from '@/services/LocationService';
import { authMiddleware, errorHandler, AuthenticatedRequest } from '@/middleware/auth';
import gamesRouter from '@/routes/games';
import playersRouter from '@/routes/players';
import bookingsRouter from '@/routes/bookings';
import matchesRouter from '@/routes/matches';

// Load environment variables
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '4000', 10);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/crushit';

app.use(cors());
app.use(express.json());

// Mount routers
app.use('/api/games', gamesRouter);
app.use('/api/players', playersRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/matches', matchesRouter);

// Health & Status
app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'CrushIT Backend', version: '1.0.0' });
});

// ============ AUTHENTICATION ENDPOINTS ============

// Register
app.post('/auth/register', async (req, res) => {
  try {
    console.log('📝 Register request received:', { email: req.body.email, name: req.body.name });
    const { email, password, name } = req.body as AuthRequest & { name: string };

    if (!email || !password || !name) {
      console.log('❌ Missing fields:', { email: !!email, password: !!password, name: !!name });
      return res.status(400).json({ error: 'Email, password, and name required' });
    }

    const user = await AuthService.registerUser(email, password, name);
    const token = AuthService.generateToken(user._id.toString(), user.email);

    const userObj = user.toObject();
    const { password: _, ...userWithoutPassword } = userObj;
    console.log('✅ User registered successfully:', userWithoutPassword.email);
    res.status(201).json({ token, user: { ...userWithoutPassword, id: user._id.toString() } });
  } catch (error: any) {
    console.log('❌ Registration error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post('/auth/login', async (req, res) => {
  try {
    console.log('🔐 Login request received:', { email: req.body.email });
    const { email, password } = req.body as AuthRequest;

    if (!email || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await AuthService.loginUser(email, password);
    console.log('✅ Login successful:', email);
    res.json(result);
  } catch (error: any) {
    console.log('❌ Login failed:', error.message);
    res.status(401).json({ error: error.message });
  }
});

// Get current user profile
app.get('/auth/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
  
  const user = await AuthService.getUserById(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  
  res.json(user);
});

// Update user profile
app.put('/auth/profile', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });

    const updated = await AuthService.updateUserProfile(req.userId, req.body);
    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json(updated);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============ REVIEWS ENDPOINTS ============

// Get reviews for an arena
app.get('/reviews/arena/:arenaId', (req, res) => {
  const arenaReviews = reviews.filter(r => r.arenaId === req.params.arenaId);
  const avgRating = arenaReviews.length > 0
    ? (arenaReviews.reduce((sum, r) => sum + r.rating, 0) / arenaReviews.length).toFixed(1)
    : 0;
  
  res.json({
    reviews: arenaReviews,
    averageRating: avgRating,
    totalReviews: arenaReviews.length
  });
});

// Create review (requires auth)
app.post('/reviews', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });

    const { arenaId, rating, title, comment } = req.body;
    const newReview: Review = {
      id: `review_${Date.now()}`,
      arenaId,
      userId: req.userId,
      rating,
      title,
      comment,
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    reviews.push(newReview);
    res.status(201).json(newReview);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============ NOTIFICATIONS ENDPOINTS ============

// Get user notifications
app.get('/notifications/:userId', (req, res) => {
  const userNotifs = notifications.filter(n => n.userId === req.params.userId);
  res.json(userNotifs);
});

// Mark notification as read
app.put('/notifications/:id/read', (req, res) => {
  const notif = notifications.find(n => n.id === req.params.id);
  if (!notif) return res.status(404).json({ error: 'Notification not found' });

  notif.read = true;
  res.json(notif);
});

// ============ TIME SLOTS ENDPOINTS ============

// Get available time slots for arena on specific date
app.get('/timeslots/:arenaId/:date', (req, res) => {
  const slots = timeSlots.filter(s => s.arenaId === req.params.arenaId && s.date === req.params.date);
  res.json(slots);
});

// ============ SEARCH & FILTER ENDPOINTS ============

// Advanced arena search with filters
app.get('/arenas/search', (req, res) => {
  const { search, minPrice, maxPrice, minRating, type, sortBy } = req.query;

  let filtered = [...arenas];

  if (search) {
    filtered = filtered.filter(a =>
      a.name.toLowerCase().includes((search as string).toLowerCase()) ||
      a.description.toLowerCase().includes((search as string).toLowerCase())
    );
  }

  if (minPrice) {
    filtered = filtered.filter(a => a.pricing >= parseInt(minPrice as string));
  }

  if (maxPrice) {
    filtered = filtered.filter(a => a.pricing <= parseInt(maxPrice as string));
  }

  if (minRating) {
    filtered = filtered.filter(a => a.rating >= parseFloat(minRating as string));
  }

  if (type) {
    filtered = filtered.filter(a => a.type === type);
  }

  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => a.pricing - b.pricing);
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => b.pricing - a.pricing);
  } else if (sortBy === 'rating') {
    filtered.sort((a, b) => b.rating - a.rating);
  }

  res.json(filtered);
});

// Arenas
app.get('/arenas', (_req, res) => {
  res.json(arenas);
});

app.get('/arenas/:id', (req, res) => {
  const arena = arenas.find(a => a.id === req.params.id);
  if (!arena) return res.status(404).json({ error: 'Arena not found' });
  res.json(arena);
});

// Products
app.get('/products', (_req, res) => {
  res.json(products);
});

app.get('/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json(product);
});

// PetCare Services
app.get('/petcare', (_req, res) => {
  res.json(petcarePartners);
});

app.get('/petcare/:id', (req, res) => {
  const service = petcarePartners.find(s => s.id === req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });
  res.json(service);
});

// Users
app.get('/users/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Bookings (Mock endpoints)
app.post('/bookings', (req, res) => {
  const { arenaId, userId, bookingDate, startTime, endTime, players } = req.body;
  const newBooking = {
    id: `BK${Date.now()}`,
    arenaId,
    userId,
    bookingDate,
    startTime,
    endTime,
    players,
    totalAmount: 500, // mock
    status: 'confirmed',
    createdAt: new Date(),
  };
  res.status(201).json(newBooking);
});

app.get('/bookings/:userId', (req, res) => {
  res.json([]);
});

// Wallet
app.get('/wallet/:userId', (req, res) => {
  const wallet = wallets.get(req.params.userId);
  if (!wallet) {
    return res.json({
      userId: req.params.userId,
      balance: 0,
      currency: 'INR',
      transactions: [],
    });
  }
  res.json(wallet);
});

app.post('/wallet/:userId/recharge', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });
    
    const { amount, method } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    let wallet = wallets.get(req.params.userId);
    if (!wallet) {
      wallet = {
        userId: req.params.userId,
        balance: 0,
        transactions: [],
        updatedAt: new Date(),
      };
    }

    const balanceBefore = wallet.balance;
    const transaction = PaymentService.createTransaction(
      req.params.userId,
      'credit',
      amount,
      `Wallet recharge via ${method || 'razorpay'}`,
      balanceBefore,
    );

    wallet.balance += amount;
    wallet.transactions.push(transaction);
    wallet.updatedAt = new Date();
    wallets.set(req.params.userId, wallet);

    res.json({ 
      success: true, 
      newBalance: wallet.balance,
      transaction 
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============ PAYMENT ENDPOINTS ============

// Create Razorpay order
app.post('/payments/create-order', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });

    const { amount, bookingId, description } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }

    const order = await PaymentService.createRazorpayOrder(amount);
    
    const payment = {
      id: `payment_${Date.now()}`,
      userId: req.userId,
      orderId: order.id,
      amount,
      currency: 'INR',
      status: 'pending' as const,
      method: 'razorpay' as const,
      description: description || 'Arena booking payment',
      bookingId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    payments.set(payment.id, payment);
    res.status(201).json({ orderId: order.id, amount, paymentId: payment.id });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Verify payment
app.post('/payments/verify', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const isValid = PaymentService.verifyPaymentSignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    // Update payment status
    const paymentEntry = Array.from(payments.values()).find(p => p.orderId === razorpay_order_id);
    if (paymentEntry) {
      paymentEntry.status = 'success';
      paymentEntry.paymentId = razorpay_payment_id;
      paymentEntry.razorpaySignature = razorpay_signature;
      paymentEntry.updatedAt = new Date();
      payments.set(paymentEntry.id, paymentEntry);
    }

    res.json({ success: true, message: 'Payment verified successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get payment history
app.get('/payments/history/:userId', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });

    const userPayments = Array.from(payments.values())
      .filter(p => p.userId === req.params.userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json(userPayments);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Process wallet payment
app.post('/payments/wallet', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });

    const { amount, bookingId, description } = req.body;
    const wallet = wallets.get(req.userId);

    if (!wallet || wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient wallet balance' });
    }

    const transaction = PaymentService.createTransaction(
      req.userId,
      'debit',
      amount,
      description || 'Booking payment',
      wallet.balance,
      undefined,
      bookingId,
    );

    wallet.balance = transaction.balanceAfter;
    wallet.transactions.push(transaction);
    wallet.updatedAt = new Date();
    wallets.set(req.userId, wallet);

    const payment = {
      id: `payment_${Date.now()}`,
      userId: req.userId,
      amount,
      currency: 'INR',
      status: 'success' as const,
      method: 'wallet' as const,
      description: description || 'Booking payment via wallet',
      bookingId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    payments.set(payment.id, payment);
    res.status(201).json({ success: true, payment, newBalance: wallet.balance });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get transaction history
app.get('/transactions/:userId', authMiddleware, (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) return res.status(401).json({ error: 'Not authenticated' });

    const wallet = wallets.get(req.params.userId);
    if (!wallet) {
      return res.json([]);
    }

    const transactions = PaymentService.getTransactionHistory(wallet.transactions);
    res.json(transactions);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============ LOCATION & MAPS ENDPOINTS ============

// Get nearby arenas
app.get('/arenas/nearby', (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const userLocation = {
      latitude: parseFloat(latitude as string),
      longitude: parseFloat(longitude as string),
    };

    if (!LocationService.validateCoordinates(userLocation)) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    const nearbyArenas = LocationService.findNearbyArenas(
      userLocation,
      arenas,
      parseInt(radius as string) || 5,
    );

    res.json(nearbyArenas);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Calculate distance between two locations
app.post('/location/distance', (req, res) => {
  try {
    const { fromLatitude, fromLongitude, toLatitude, toLongitude, mode } = req.body;

    if (!fromLatitude || !fromLongitude || !toLatitude || !toLongitude) {
      return res.status(400).json({ error: 'All coordinates required' });
    }

    const distanceMatrix = LocationService.calculateDistanceMatrix(
      { latitude: fromLatitude, longitude: fromLongitude },
      { latitude: toLatitude, longitude: toLongitude },
      mode || 'driving',
    );

    res.json(distanceMatrix);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get directions URL
app.post('/location/directions', (req, res) => {
  try {
    const { fromLatitude, fromLongitude, toLatitude, toLongitude, mode } = req.body;

    if (!fromLatitude || !fromLongitude || !toLatitude || !toLongitude) {
      return res.status(400).json({ error: 'All coordinates required' });
    }

    const directionsUrl = LocationService.getDirectionsUrl(
      { latitude: fromLatitude, longitude: fromLongitude },
      { latitude: toLatitude, longitude: toLongitude },
      mode || 'driving',
    );

    res.json({ directionsUrl });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Search locations nearby
app.get('/location/search', (req, res) => {
  try {
    const { latitude, longitude, radius, type, minRating, query } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude required' });
    }

    const userLocation = {
      latitude: parseFloat(latitude as string),
      longitude: parseFloat(longitude as string),
    };

    const searchParams = {
      query: (query as string) || '',
      location: userLocation,
      radius: parseInt(radius as string) || 5,
      type: type as string,
      minRating: minRating ? parseFloat(minRating as string) : undefined,
    };

    const results = LocationService.searchNearbyLocations(userLocation, arenas, searchParams);
    res.json(results);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Transactions
app.get('/transactions/:userId', (req, res) => {
  res.json([]);
});

// Chatbot endpoints
app.post('/chat/message', (req, res) => {
  const { userId, userMessage } = req.body;

  if (!userMessage) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Parse user intent from message
  const intent = parseIntent(userMessage);
  let botResponse = '';

  switch (intent) {
    case 'booking':
      botResponse = handleBookingIntent(userMessage);
      break;
    case 'cancel':
      botResponse = handleCancelIntent(userMessage);
      break;
    case 'modify':
      botResponse = handleModifyIntent(userMessage);
      break;
    case 'view':
      botResponse = handleViewIntent(userMessage);
      break;
    case 'help':
      botResponse = chatTemplates.help;
      break;
    default:
      botResponse = chatTemplates.greeting;
  }

  const chatMessage: ChatMessage = {
    id: `msg${Date.now()}`,
    userId,
    userMessage,
    botResponse,
    intent,
    timestamp: new Date(),
  };

  res.json(chatMessage);
});

app.get('/chat/history/:userId', (req, res) => {
  const userChats = chatMessages.filter(m => m.userId === req.params.userId);
  res.json(userChats);
});

// Chatbot intent parsing
function parseIntent(message: string): 'booking' | 'cancel' | 'modify' | 'view' | 'help' | 'other' {
  const msg = message.toLowerCase();
  if (msg.includes('book') || msg.includes('reserve') || msg.includes('court') || msg.includes('slot')) {
    return 'booking';
  }
  if (msg.includes('cancel') || msg.includes('delete')) {
    return 'cancel';
  }
  if (msg.includes('modify') || msg.includes('change') || msg.includes('update')) {
    return 'modify';
  }
  if (msg.includes('view') || msg.includes('show') || msg.includes('my bookings')) {
    return 'view';
  }
  if (msg.includes('help') || msg.includes('what can you do') || msg.includes('commands')) {
    return 'help';
  }
  return 'other';
}

// Booking intent handler
function handleBookingIntent(message: string): string {
  const arenaMatch = message.match(/(badminton|tennis|basketball|football|cricket|squash|volleyball)/i);
  const dateMatch = message.match(/(tomorrow|today|next week|\d{1,2}\/\d{1,2})/i);
  const timeMatch = message.match(/(\d{1,2})\s*(am|pm|:|\d{2})?/i);

  if (!arenaMatch && !dateMatch && !timeMatch) {
    return chatTemplates.booking.start;
  }

  if (dateMatch && !timeMatch) {
    return chatTemplates.booking.selectTime;
  }

  if (dateMatch && timeMatch) {
    return chatTemplates.booking.selectDuration;
  }

  const arenaName = arenaMatch ? arenaMatch[0] : 'the selected arena';
  const date = dateMatch ? dateMatch[0] : 'your preferred date';
  const time = timeMatch ? timeMatch[0] : 'your preferred time';

  return `Perfect! I can book ${arenaName} for ${date} at ${time}. How long would you like to book?`;
}

// Cancel intent handler
function handleCancelIntent(message: string): string {
  const bookingIdMatch = message.match(/booking\s*#?(\w+)/i);
  if (bookingIdMatch) {
    const bookingId = bookingIdMatch[1];
    return `Are you sure you want to cancel booking #${bookingId}? You will receive a refund.`;
  }
  return chatTemplates.cancel.start;
}

// Modify intent handler
function handleModifyIntent(message: string): string {
  const bookingIdMatch = message.match(/booking\s*#?(\w+)/i);
  if (!bookingIdMatch) {
    return chatTemplates.modify.start;
  }
  return chatTemplates.modify.options;
}

// View intent handler
function handleViewIntent(message: string): string {
  return 'Here are your upcoming bookings:\n1. Badminton Court - Dec 10, 6:00 PM\n2. Tennis Court - Dec 12, 10:00 AM\n\nWould you like more details on any booking?';
}

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and start server
(async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully');
    
    // Initialize AuthService with default users
    await AuthService.initialize();
    console.log('✅ AuthService initialized with default test users');
    
    // Listen on 0.0.0.0 to accept connections from network (required for Expo Go)
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 CrushIT backend running on:`);
      console.log(`   Local:   http://localhost:${PORT}`);
      console.log(`   Network: http://192.168.29.41:${PORT} (for Expo Go)`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`✅ Default test accounts ready:`);
      console.log(`   - user@example.com (password: password123)`);
      console.log(`   - demo@test.com (password: password123)`);
      console.log(`   - test@crushit.com (password: password123)`);
    });
  } catch (err) {
    console.error('❌ Failed to initialize backend:', err);
    process.exit(1);
  }
})();
