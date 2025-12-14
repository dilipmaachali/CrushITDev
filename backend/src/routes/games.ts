import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';
import { ScheduledGame } from '@/models/ScheduledGame';
import { GameChat } from '@/models/GameChat';

const router = Router();

// Get all games (user's games only)
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.userId;
    
    // Find games where user is host, co-host, or player
    const userGames = await ScheduledGame.find({
      $or: [
        { hostId: userId },
        { 'coHosts.userId': userId },
        { 'currentPlayers.userId': userId }
      ]
    }).sort({ scheduledDate: 1 });

    res.json(userGames);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get game by ID
router.get('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = await ScheduledGame.findOne({ gameId: req.params.id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    // Allow access if game is public or user is host/player
    const isHost = game.hostId === req.userId;
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

    const gameData = new ScheduledGame({
      gameId: `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...req.body,
      title: gameTitle,
      hostId: req.userId,
      hostName: req.body.hostName || userName,
      currentPlayers: req.body.currentPlayers || [],
      coHosts: req.body.coHosts || [],
      inviteRequests: req.body.inviteRequests || [],
      sentInvites: req.body.sentInvites || [],
      status: req.body.status || 'scheduled',
      currency: req.body.currency || 'INR',
      isPublic: req.body.isPublic !== undefined ? req.body.isPublic : true,
      allowJoinRequests: req.body.allowJoinRequests !== undefined ? req.body.allowJoinRequests : true,
    });

    await gameData.save();
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

    const game = await ScheduledGame.findOne({ gameId: req.params.id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host or co-host
    const isHost = game.hostId === req.userId;
    const isCoHost = game.coHosts?.some(ch => ch.userId === req.userId);

    if (!isHost && !isCoHost) {
      return res.status(403).json({ error: 'Only host or co-host can update game' });
    }

    // Update game
    Object.assign(game, req.body);
    await game.save();
    
    res.json(game);
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

    const game = await ScheduledGame.findOne({ gameId: req.params.id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.hostId !== req.userId) {
      return res.status(403).json({ error: 'Only host can delete game' });
    }

    await ScheduledGame.deleteOne({ gameId: req.params.id });
    res.json({ message: 'Game deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Join game
router.post('/:id/join', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = await ScheduledGame.findOne({ gameId: req.params.id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if already joined
    if (game.currentPlayers.some(p => p.userId === req.userId)) {
      return res.status(400).json({ error: 'Already joined this game' });
    }

    // Check if game is full
    if (game.currentPlayers.length >= game.maxPlayers) {
      return res.status(400).json({ error: 'Game is full' });
    }

    // Add player
    game.currentPlayers.push({
      userId: req.userId!,
      userName: req.body.userName || req.userName || 'Player',
      gender: req.body.gender || 'other',
      joinedAt: new Date(),
      status: 'confirmed',
    });

    await game.save();
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Leave game
router.post('/:id/leave', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = await ScheduledGame.findOne({ gameId: req.params.id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Remove player
    game.currentPlayers = game.currentPlayers.filter(p => p.userId !== req.userId);
    await game.save();
    
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add co-host (host only)
router.post('/:id/add-cohost', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = await ScheduledGame.findOne({ gameId: req.params.id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host
    if (game.hostId !== req.userId) {
      return res.status(403).json({ error: 'Only host can add co-hosts' });
    }

    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }

    // Check if already co-host
    if (game.coHosts.some(ch => ch.userId === playerId)) {
      return res.status(400).json({ error: 'Already a co-host' });
    }

    // Find player in current players
    const player = game.currentPlayers.find(p => p.userId === playerId);
    if (!player) {
      return res.status(400).json({ error: 'Player not in game' });
    }

    // Add as co-host
    game.coHosts.push({
      userId: player.userId,
      userName: player.userName,
      addedAt: new Date(),
    });

    await game.save();
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove co-host (host only)
router.post('/:id/remove-cohost', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = await ScheduledGame.findOne({ gameId: req.params.id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host
    if (game.hostId !== req.userId) {
      return res.status(403).json({ error: 'Only host can remove co-hosts' });
    }

    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }

    // Remove co-host
    game.coHosts = game.coHosts.filter(ch => ch.userId !== playerId);
    await game.save();
    
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove player (host or co-host only)
router.post('/:id/remove-player', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = await ScheduledGame.findOne({ gameId: req.params.id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host or co-host
    const isHost = game.hostId === req.userId;
    const isCoHost = game.coHosts.some(ch => ch.userId === req.userId);

    if (!isHost && !isCoHost) {
      return res.status(403).json({ error: 'Only host or co-host can remove players' });
    }

    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }

    // Cannot remove host
    if (playerId === game.hostId) {
      return res.status(400).json({ error: 'Cannot remove host' });
    }

    // Remove player
    game.currentPlayers = game.currentPlayers.filter(p => p.userId !== playerId);
    // Also remove from co-hosts if present
    game.coHosts = game.coHosts.filter(ch => ch.userId !== playerId);

    await game.save();
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mark game as full/open (host or co-host only)
router.post('/:id/mark-full', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = await ScheduledGame.findOne({ gameId: req.params.id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host or co-host
    const isHost = game.hostId === req.userId;
    const isCoHost = game.coHosts.some(ch => ch.userId === req.userId);

    if (!isHost && !isCoHost) {
      return res.status(403).json({ error: 'Only host or co-host can manage game status' });
    }

    // Toggle between scheduled and completed (or implement your logic)
    const currentlyFull = game.currentPlayers.length >= game.maxPlayers;
    game.status = currentlyFull ? 'scheduled' : 'completed';
    await game.save();
    
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Accept join request (host or co-host only)
router.post('/:id/accept-request', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = await ScheduledGame.findOne({ gameId: req.params.id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host or co-host
    const isHost = game.hostId === req.userId;
    const isCoHost = game.coHosts.some(ch => ch.userId === req.userId);

    if (!isHost && !isCoHost) {
      return res.status(403).json({ error: 'Only host or co-host can accept requests' });
    }

    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }

    // Find request
    const request = game.inviteRequests.find(r => r.userId === playerId);
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check if game is full
    if (game.currentPlayers.length >= game.maxPlayers) {
      return res.status(400).json({ error: 'Game is full' });
    }

    // Move from requests to players
    game.currentPlayers.push({
      userId: request.userId,
      userName: request.userName,
      gender: request.gender,
      joinedAt: new Date(),
      status: 'confirmed',
    });

    game.inviteRequests = game.inviteRequests.filter(r => r.userId !== playerId);
    await game.save();
    
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Reject join request (host or co-host only)
router.post('/:id/reject-request', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = await ScheduledGame.findOne({ gameId: req.params.id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host or co-host
    const isHost = game.hostId === req.userId;
    const isCoHost = game.coHosts.some(ch => ch.userId === req.userId);

    if (!isHost && !isCoHost) {
      return res.status(403).json({ error: 'Only host or co-host can reject requests' });
    }

    const { playerId } = req.body;
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID required' });
    }

    // Remove request
    game.inviteRequests = game.inviteRequests.filter(r => r.userId !== playerId);
    await game.save();
    
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get chat messages for a game
router.get('/:id/chat', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = await ScheduledGame.findOne({ gameId: req.params.id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Get messages for this game from MongoDB
    const messages = await GameChat.find({ gameId: req.params.id })
      .sort({ createdAt: 1 })
      .limit(100);

    res.json(messages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send chat message
router.post('/:id/chat', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const game = await ScheduledGame.findOne({ gameId: req.params.id });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: 'Message required' });
    }

    const chatMessage = new GameChat({
      gameId: req.params.id,
      userId: req.userId!,
      userName: req.body.userName || req.userName || 'User',
      message: message.trim(),
    });

    await chatMessage.save();
    res.status(201).json(chatMessage);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
