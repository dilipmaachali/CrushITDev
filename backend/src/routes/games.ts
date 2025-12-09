import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';
import ScheduledGame from '@/models/ScheduledGame';

const router = Router();

// Get all games with optional filters
router.get('/', async (req, res) => {
  try {
    const { 
      sport, 
      status, 
      genderRestriction, 
      isPublic, 
      paymentType,
      startDate,
      endDate,
      city,
      userId // to get user's games
    } = req.query;

    const filter: any = {};

    if (sport) filter.sport = sport;
    if (status) filter.status = status;
    if (genderRestriction) filter.genderRestriction = genderRestriction;
    if (isPublic !== undefined) filter.isPublic = isPublic === 'true';
    if (paymentType) filter.paymentType = paymentType;

    // Date range filter
    if (startDate || endDate) {
      filter.scheduledDate = {};
      if (startDate) filter.scheduledDate.$gte = new Date(startDate as string);
      if (endDate) filter.scheduledDate.$lte = new Date(endDate as string);
    }

    // Location filter
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };

    // User's games (hosted, co-hosted, or joined)
    if (userId) {
      filter.$or = [
        { hostId: userId },
        { 'coHosts.userId': userId },
        { 'currentPlayers.userId': userId }
      ];
    }

    const games = await ScheduledGame.find(filter)
      .sort({ scheduledDate: 1 })
      .limit(100);

    res.json({ games, count: games.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get game by ID
router.get('/:id', async (req, res) => {
  try {
    const game = await ScheduledGame.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get game by share code
router.get('/share/:shareCode', async (req, res) => {
  try {
    const game = await ScheduledGame.findOne({ shareCode: req.params.shareCode });
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
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

    const gameData = {
      ...req.body,
      hostId: req.userId,
      hostName: req.user?.name || 'Unknown',
      currentPlayers: [{
        userId: req.userId,
        userName: req.user?.name || 'Unknown',
        gender: req.user?.gender || 'other',
        joinedAt: new Date(),
        status: 'confirmed'
      }]
    };

    const game = new ScheduledGame(gameData);
    await game.save();

    res.status(201).json(game);
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

    const game = await ScheduledGame.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host or co-host
    const isHost = game.hostId === req.userId;
    const isCoHost = game.coHosts.some(ch => ch.userId === req.userId);

    if (!isHost && !isCoHost) {
      return res.status(403).json({ error: 'Only host or co-host can update game' });
    }

    // Update allowed fields
    const allowedUpdates = [
      'title', 'description', 'scheduledDate', 'startTime', 'endTime',
      'location', 'maxPlayers', 'minPlayers', 'paymentType', 'costPerPlayer',
      'isPublic', 'allowJoinRequests', 'genderRestriction', 'status'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        (game as any)[field] = req.body[field];
      }
    });

    await game.save();
    res.json(game);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Delete/Cancel game (host only)
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const game = await ScheduledGame.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.hostId !== req.userId) {
      return res.status(403).json({ error: 'Only host can cancel game' });
    }

    game.status = 'cancelled';
    await game.save();

    res.json({ message: 'Game cancelled successfully', game });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ PLAYER MANAGEMENT ============

// Add player to game
router.post('/:id/players', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const game = await ScheduledGame.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    const { userId, userName, gender, skillLevel } = req.body;

    // Check if game is full
    if (game.currentPlayers.length >= game.maxPlayers) {
      return res.status(400).json({ error: 'Game is full' });
    }

    // Check if player already in game
    if (game.currentPlayers.some(p => p.userId === userId)) {
      return res.status(400).json({ error: 'Player already in game' });
    }

    // Check gender restriction
    if (game.genderRestriction !== 'all') {
      if (game.genderRestriction === 'male_only' && gender !== 'male') {
        return res.status(400).json({ error: 'This game is for men only' });
      }
      if (game.genderRestriction === 'female_only' && gender !== 'female') {
        return res.status(400).json({ error: 'This game is for women only' });
      }
    }

    game.currentPlayers.push({
      userId,
      userName,
      gender,
      skillLevel,
      joinedAt: new Date(),
      status: 'confirmed'
    });

    await game.save();
    res.json(game);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Remove player from game (host/co-host only)
router.delete('/:id/players/:userId', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const game = await ScheduledGame.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host or co-host
    const isHost = game.hostId === req.userId;
    const isCoHost = game.coHosts.some(ch => ch.userId === req.userId);

    if (!isHost && !isCoHost) {
      return res.status(403).json({ error: 'Only host or co-host can remove players' });
    }

    // Remove player
    game.currentPlayers = game.currentPlayers.filter(p => p.userId !== req.params.userId);

    await game.save();
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ JOIN REQUESTS ============

// Create join request
router.post('/:id/requests', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const game = await ScheduledGame.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (!game.allowJoinRequests) {
      return res.status(400).json({ error: 'This game does not accept join requests' });
    }

    // Check if already in game
    if (game.currentPlayers.some(p => p.userId === req.userId)) {
      return res.status(400).json({ error: 'You are already in this game' });
    }

    // Check if request already exists
    if (game.inviteRequests.some(r => r.userId === req.userId)) {
      return res.status(400).json({ error: 'You have already requested to join' });
    }

    const { message, gender } = req.body;

    game.inviteRequests.push({
      userId: req.userId!,
      userName: req.user?.name || 'Unknown',
      gender,
      requestedAt: new Date(),
      status: 'pending',
      message
    });

    await game.save();
    res.json(game);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Accept/reject join request (host/co-host only)
router.put('/:id/requests/:userId', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const game = await ScheduledGame.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host or co-host
    const isHost = game.hostId === req.userId;
    const isCoHost = game.coHosts.some(ch => ch.userId === req.userId);

    if (!isHost && !isCoHost) {
      return res.status(403).json({ error: 'Only host or co-host can manage requests' });
    }

    const { action } = req.body; // 'accept' or 'reject'
    const requestIndex = game.inviteRequests.findIndex(r => r.userId === req.params.userId);

    if (requestIndex === -1) {
      return res.status(404).json({ error: 'Request not found' });
    }

    const request = game.inviteRequests[requestIndex];

    if (action === 'accept') {
      // Check if game is full
      if (game.currentPlayers.length >= game.maxPlayers) {
        return res.status(400).json({ error: 'Game is full' });
      }

      // Add player to game
      game.currentPlayers.push({
        userId: request.userId,
        userName: request.userName,
        gender: request.gender,
        joinedAt: new Date(),
        status: 'confirmed'
      });

      // Update request status
      game.inviteRequests[requestIndex].status = 'accepted';
    } else if (action === 'reject') {
      game.inviteRequests[requestIndex].status = 'rejected';
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    await game.save();
    res.json(game);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// ============ CO-HOST MANAGEMENT ============

// Add co-host (host only)
router.post('/:id/cohost', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const game = await ScheduledGame.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.hostId !== req.userId) {
      return res.status(403).json({ error: 'Only host can add co-hosts' });
    }

    const { userId, userName } = req.body;

    // Check if user is already co-host
    if (game.coHosts.some(ch => ch.userId === userId)) {
      return res.status(400).json({ error: 'User is already a co-host' });
    }

    // Check if user is in game
    if (!game.currentPlayers.some(p => p.userId === userId)) {
      return res.status(400).json({ error: 'User must be a player in the game' });
    }

    game.coHosts.push({
      userId,
      userName,
      addedAt: new Date()
    });

    await game.save();
    res.json(game);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Remove co-host (host only)
router.delete('/:id/cohost/:userId', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const game = await ScheduledGame.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    if (game.hostId !== req.userId) {
      return res.status(403).json({ error: 'Only host can remove co-hosts' });
    }

    game.coHosts = game.coHosts.filter(ch => ch.userId !== req.params.userId);

    await game.save();
    res.json(game);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ============ INVITES ============

// Send invite to user
router.post('/:id/invite', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const game = await ScheduledGame.findById(req.params.id);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Check if user is host or co-host
    const isHost = game.hostId === req.userId;
    const isCoHost = game.coHosts.some(ch => ch.userId === req.userId);

    if (!isHost && !isCoHost) {
      return res.status(403).json({ error: 'Only host or co-host can send invites' });
    }

    const { userId, userName } = req.body;

    // Check if already invited
    if (game.sentInvites.some(i => i.userId === userId)) {
      return res.status(400).json({ error: 'User already invited' });
    }

    // Check if already in game
    if (game.currentPlayers.some(p => p.userId === userId)) {
      return res.status(400).json({ error: 'User already in game' });
    }

    game.sentInvites.push({
      userId,
      userName,
      invitedAt: new Date(),
      status: 'pending'
    });

    await game.save();
    res.json(game);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
