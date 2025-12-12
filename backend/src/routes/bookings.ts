import express from 'express';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

const router = express.Router();

// In-memory storage (replace with MongoDB models later)
interface Booking {
  id: string;
  userId: string;
  arenaId: string;
  arenaName: string;
  sport: string;
  date: string;
  time: string;
  duration: number;
  totalCost: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  players?: string[];
  notes?: string;
}

let bookings: Booking[] = [];

// Get all bookings for authenticated user
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const userBookings = bookings.filter(b => b.userId === req.userId);
    res.json(userBookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single booking
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const booking = bookings.find(b => b.id === req.params.id && b.userId === req.userId);
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new booking
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const booking: Booking = {
      id: Date.now().toString(),
      userId: req.userId,
      ...req.body,
      status: req.body.status || 'pending',
      createdAt: new Date().toISOString(),
    };

    bookings.push(booking);
    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update booking
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const index = bookings.findIndex(b => b.id === req.params.id && b.userId === req.userId);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    bookings[index] = { ...bookings[index], ...req.body, id: req.params.id, userId: req.userId };
    res.json(bookings[index]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete booking
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const index = bookings.findIndex(b => b.id === req.params.id && b.userId === req.userId);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    bookings.splice(index, 1);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
