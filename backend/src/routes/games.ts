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
    
    // Allow access if game is public or user is host/player
    const isHost = game.userId === req.userId || game.hostId === req.userId;
    const isPlayer = game.currentPlayers?.some(p => p.userId === req.userId);
    const isCoHost = game.coHosts?.some(ch => ch.userId === req.userId);
    
    if (!game.isPublic && !isHost && !isPlayer && !isCoHost) {
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

    // Use userName from auth middleware, fallback to request body or 'User'
    const userName = req.userName || req.body.userName || 'User';
    const sportName = req.body.sportName || req.body.sport || 'Game';
    const gameTitle = `${userName} ${sportName} Game`;

    const gameData: Game = {
      id: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: req.userId,
      ...req.body,
      title: gameTitle,  // Override title with formatted version
      hostId: req.userId,
      hostName: req.body.hostName || userName,
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

// Join game
router.post('/:id/join', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = games.find(g => g.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (!game.currentPlayers) game.currentPlayers = [];

    // Check if already joined
    if (game.currentPlayers.some(p => p.userId === req.userId)) {
      return res.status(400).json({ error: 'Already joined this game' });
    }

    // Check if game is full
    if (game.currentPlayers.length >= (game.maxPlayers || 4)) {
      return res.status(400).json({ error: 'Game is full' });
    }

    // Add player
    game.currentPlayers.push({
      userId: req.userId!,
      userName: req.userName || 'Player',
      status: 'joined',
    });

    game.updatedAt = new Date();
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Leave game
router.post('/:id/leave', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = games.find(g => g.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (!game.currentPlayers) game.currentPlayers = [];

    // Remove player
    game.currentPlayers = game.currentPlayers.filter(p => p.userId !== req.userId);
    game.updatedAt = new Date();
    
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add co-host (host only)
router.post('/:id/add-cohost', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = games.find(g => g.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host
    if (game.hostId !== req.userId && game.userId !== req.userId) {
      return res.status(403).json({ error: 'Only host can add co-hosts' });
    }

    if (!game.coHosts) game.coHosts = [];

    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }

    // Check if already co-host
    if (game.coHosts.some(ch => ch.userId === playerId)) {
      return res.status(400).json({ error: 'Already a co-host' });
    }

    // Find player in current players
    const player = game.currentPlayers?.find(p => p.userId === playerId);
    if (!player) {
      return res.status(400).json({ error: 'Player not in game' });
    }

    // Add as co-host
    game.coHosts.push({
      userId: player.userId,
      userName: player.userName,
    });

    game.updatedAt = new Date();
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove co-host (host only)
router.post('/:id/remove-cohost', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = games.find(g => g.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host
    if (game.hostId !== req.userId && game.userId !== req.userId) {
      return res.status(403).json({ error: 'Only host can remove co-hosts' });
    }

    if (!game.coHosts) game.coHosts = [];

    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }

    // Remove co-host
    game.coHosts = game.coHosts.filter(ch => ch.userId !== playerId);
    game.updatedAt = new Date();
    
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove player (host or co-host only)
router.post('/:id/remove-player', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = games.find(g => g.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host or co-host
    const isHost = game.hostId === req.userId || game.userId === req.userId;
    const isCoHost = game.coHosts?.some(ch => ch.userId === req.userId);

    if (!isHost && !isCoHost) {
      return res.status(403).json({ error: 'Only host or co-host can remove players' });
    }

    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }

    // Cannot remove host
    if (playerId === game.hostId || playerId === game.userId) {
      return res.status(400).json({ error: 'Cannot remove host' });
    }

    // Remove player
    if (game.currentPlayers) {
      game.currentPlayers = game.currentPlayers.filter(p => p.userId !== playerId);
    }

    // Also remove from co-hosts if present
    if (game.coHosts) {
      game.coHosts = game.coHosts.filter(ch => ch.userId !== playerId);
    }

    game.updatedAt = new Date();
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark game as full/open (host or co-host only)
router.post('/:id/mark-full', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = games.find(g => g.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host or co-host
    const isHost = game.hostId === req.userId || game.userId === req.userId;
    const isCoHost = game.coHosts?.some(ch => ch.userId === req.userId);

    if (!isHost && !isCoHost) {
      return res.status(403).json({ error: 'Only host or co-host can manage game status' });
    }

    // Toggle between full and scheduled
    game.status = game.status === 'full' ? 'scheduled' : 'full';
    game.updatedAt = new Date();
    
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Accept join request (host or co-host only)
router.post('/:id/accept-request', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = games.find(g => g.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host or co-host
    const isHost = game.hostId === req.userId || game.userId === req.userId;
    const isCoHost = game.coHosts?.some(ch => ch.userId === req.userId);

    if (!isHost && !isCoHost) {
      return res.status(403).json({ error: 'Only host or co-host can accept requests' });
    }

    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }

    if (!game.inviteRequests) game.inviteRequests = [];
    if (!game.currentPlayers) game.currentPlayers = [];

    // Find request
    const request = game.inviteRequests.find(r => r.userId === playerId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check if game is full
    if (game.currentPlayers.length >= (game.maxPlayers || 4)) {
      return res.status(400).json({ error: 'Game is full' });
    }

    // Move from requests to players
    game.currentPlayers.push({
      ...request,
      status: 'joined',
    });

    game.inviteRequests = game.inviteRequests.filter(r => r.userId !== playerId);
    game.updatedAt = new Date();
    
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reject join request (host or co-host only)
router.post('/:id/reject-request', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = games.find(g => g.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host or co-host
    const isHost = game.hostId === req.userId || game.userId === req.userId;
    const isCoHost = game.coHosts?.some(ch => ch.userId === req.userId);

    if (!isHost && !isCoHost) {
      return res.status(403).json({ error: 'Only host or co-host can reject requests' });
    }

    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }

    if (!game.inviteRequests) game.inviteRequests = [];

    // Remove request
    game.inviteRequests = game.inviteRequests.filter(r => r.userId !== playerId);
    game.updatedAt = new Date();
    
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Chat storage
interface ChatMessage {
  id: string;
  gameId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
}

let chatMessages: ChatMessage[] = [];

// Get chat messages for a game
router.get('/:id/chat', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = games.find(g => g.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Get messages for this game
    const messages = chatMessages
      .filter(m => m.gameId === req.params.id)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send chat message
router.post('/:id/chat', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = games.find(g => g.id === req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message required' });
    }

    const chatMessage: ChatMessage = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      gameId: req.params.id,
      userId: req.userId!,
      userName: req.userName || 'User',
      message: message.trim(),
      timestamp: new Date(),
    };

    chatMessages.push(chatMessage);
    res.status(201).json(chatMessage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
