import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

const router = Router();

// In-memory storage (TODO: Replace with MongoDB once connected)
interface Game {
  id: string;
  userId: string;
  title?: string;
  sport: string;
  scheduledDate: string;
  startTime: string;
  endTime?: string;
  location?: any;
  maxPlayers?: number;
  minPlayers?: number;
  currentPlayers?: any[];
  status?: string;
  paymentType?: string;
  costPerPlayer?: number;
  isPublic?: boolean;
  genderRestriction?: string;
  shareCode?: string;
  hostId?: string;
  hostName?: string;
  coHosts?: any[];
  inviteRequests?: any[];
  sentInvites?: any[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

let games: Game[] = [];

// Get all games (user's games only)
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId;
    
    // Filter games by user
    const userGames = userId 
      ? games.filter(g => g.userId === userId || g.hostId === userId)
      : [];

    res.json(userGames);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get game by ID
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = games.find(g => g.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Check if user has access
    if (game.userId !== req.userId && game.hostId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create new game (requires auth)
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const gameData: Game = {
      id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: req.userId,
      ...req.body,
      hostId: req.userId,
      hostName: req.body.hostName || 'Unknown',
      currentPlayers: req.body.currentPlayers || [],
      coHosts: req.body.coHosts || [],
      inviteRequests: req.body.inviteRequests || [],
      sentInvites: req.body.sentInvites || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    games.push(gameData);
    res.status(201).json(gameData);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Update game (host or co-host only)
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const gameIndex = games.findIndex(g => g.id === req.params.id);
    if (gameIndex === -1) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const game = games[gameIndex];

    // Check if user is host or owner
    const isHost = game.hostId === req.userId || game.userId === req.userId;
    const isCoHost = game.coHosts?.some(ch => ch.userId === req.userId);

    if (!isHost && !isCoHost) {
      return res.status(403).json({ error: 'Only host or co-host can update game' });
    }

    // Update game
    const updatedGame = {
      ...game,
      ...req.body,
      id: game.id, // Keep original ID
      userId: game.userId, // Keep original userId
      updatedAt: new Date()
    };

    games[gameIndex] = updatedGame;
    res.json(updatedGame);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete game (host only)
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const gameIndex = games.findIndex(g => g.id === req.params.id);
    if (gameIndex === -1) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const game = games[gameIndex];

    if (game.hostId !== req.userId && game.userId !== req.userId) {
      return res.status(403).json({ error: 'Only host can delete game' });
    }

    // Remove from array
    games.splice(gameIndex, 1);

    res.json({ message: 'Game deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
