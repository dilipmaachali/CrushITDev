import express from 'express';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

const router = express.Router();

// In-memory storage for matches (replace with MongoDB models later)
interface Match {
  id: string;
  userId: string;
  sport: string; // Any sport: cricket, badminton, football, tennis, basketball, squash, etc.
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

    if (!sport || typeof sport !== 'string') {
      return res.status(400).json({ error: 'Sport is required and must be a string' });
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
    console.log('DELETE /matches/:id called');
    console.log('Match ID from URL:', req.params.id);
    console.log('User ID from auth:', req.userId);
    
    if (!req.userId) {
      console.log('No userId in request');
      return res.status(401).json({ error: 'Not authenticated' });
    }

    console.log('Searching for match with id:', req.params.id, 'and userId:', req.userId);
    const index = matches.findIndex(m => {
      const isMatch = m.id === req.params.id && m.userId === req.userId;
      console.log(`Checking match ${m.id}: id match=${m.id === req.params.id}, userId match=${m.userId === req.userId}`);
      return isMatch;
    });
    
    console.log('Match index found:', index);
    
    if (index === -1) {
      console.log('Match not found');
      return res.status(404).json({ error: 'Match not found' });
    }

    const deletedMatch = matches[index];
    matches.splice(index, 1);
    console.log('Match deleted:', deletedMatch.id);
    res.json({ message: 'Match deleted successfully' });
  } catch (error: any) {
    console.error('Delete error:', error);
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
