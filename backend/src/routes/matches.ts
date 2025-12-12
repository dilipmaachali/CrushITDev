import express from 'express';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

const router = express.Router();

// In-memory storage for matches (replace with MongoDB models later)
interface Match {
  id: string;
  userId: string;
  sport: 'cricket' | 'badminton' | 'football';
  matchData: any;
  status: 'setup' | 'in-progress' | 'completed';
  createdAt: string;
  updatedAt: string;
}

let matches: Match[] = [];

// Get all matches for authenticated user (with optional sport filter)
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    let userMatches = matches.filter(m => m.userId === req.userId);
    
    // Filter by sport if provided
    const { sport } = req.query;
    if (sport) {
      userMatches = userMatches.filter(m => m.sport === sport);
    }

    res.json(userMatches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single match
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const match = matches.find(m => m.id === req.params.id && m.userId === req.userId);
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    res.json(match);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new match
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { sport, matchData, status } = req.body;

    if (!sport || !['cricket', 'badminton', 'football'].includes(sport)) {
      return res.status(400).json({ error: 'Invalid sport. Must be cricket, badminton, or football' });
    }

    const match: Match = {
      id: Date.now().toString(),
      userId: req.userId,
      sport,
      matchData: matchData || {},
      status: status || 'setup',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    matches.push(match);
    res.status(201).json(match);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update match (for scoring updates)
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const index = matches.findIndex(m => m.id === req.params.id && m.userId === req.userId);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Match not found' });
    }

    matches[index] = {
      ...matches[index],
      ...req.body,
      id: req.params.id,
      userId: req.userId,
      updatedAt: new Date().toISOString(),
    };

    res.json(matches[index]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete match
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const index = matches.findIndex(m => m.id === req.params.id && m.userId === req.userId);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Match not found' });
    }

    matches.splice(index, 1);
    res.json({ message: 'Match deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk operations for matches
router.post('/bulk', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { matches: newMatches } = req.body;

    if (!Array.isArray(newMatches)) {
      return res.status(400).json({ error: 'Matches must be an array' });
    }

    const createdMatches = newMatches.map(matchData => ({
      id: `${Date.now()}-${Math.random()}`,
      userId: req.userId!,
      sport: matchData.sport,
      matchData: matchData.matchData || matchData,
      status: matchData.status || 'setup',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    matches.push(...createdMatches);
    res.status(201).json(createdMatches);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
