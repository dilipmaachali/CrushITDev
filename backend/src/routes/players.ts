import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';
import PlayerProfile from '@/models/PlayerProfile';

const router = Router();

// Discover players with filters
router.get('/', async (req, res) => {
  try {
    const {
      sport,
      gender,
      city,
      area,
      skillLevel,
      lookingForPlayers,
      openToInvites,
      genderPreference,
      search,
      limit = '50',
      page = '1'
    } = req.query;

    const filter: any = { isPublicProfile: true };

    // Sport filter
    if (sport) {
      filter['sports.sport'] = sport;
      if (skillLevel) {
        filter['sports.skillLevel'] = skillLevel;
      }
    }

    // Gender filter
    if (gender) {
      filter.gender = gender;
    }

    // Location filters
    if (city) {
      filter['location.city'] = { $regex: city, $options: 'i' };
    }
    if (area) {
      filter['location.area'] = { $regex: area, $options: 'i' };
    }

    // Availability filters
    if (lookingForPlayers === 'true') {
      filter.lookingForPlayers = true;
    }
    if (openToInvites === 'true') {
      filter.openToInvites = true;
    }

    // Gender preference filter
    if (genderPreference) {
      filter.genderPreference = genderPreference;
    }

    // Search by name
    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const limitNum = parseInt(limit as string);
    const pageNum = parseInt(page as string);
    const skip = (pageNum - 1) * limitNum;

    const players = await PlayerProfile.find(filter)
      .sort({ 'stats.rating': -1 }) // Sort by rating
      .skip(skip)
      .limit(limitNum)
      .select('-email -phoneNumber'); // Don't expose sensitive info

    const total = await PlayerProfile.countDocuments(filter);

    res.json({
      players,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get player profile by ID
router.get('/:id', async (req, res) => {
  try {
    const player = await PlayerProfile.findOne({ userId: req.params.id });
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (!player.isPublicProfile) {
      return res.status(403).json({ error: 'This profile is private' });
    }

    // Don't expose sensitive info for public view
    const publicProfile = player.toObject();
    delete publicProfile.email;
    delete publicProfile.phoneNumber;

    res.json(publicProfile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update player profile (requires auth)
router.put('/profile', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const profileData = {
      ...req.body,
      userId: req.userId,
      userName: req.user?.name || req.body.userName
    };

    const player = await PlayerProfile.findOneAndUpdate(
      { userId: req.userId },
      profileData,
      { new: true, upsert: true, runValidators: true }
    );

    res.json(player);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Get my player profile (requires auth)
router.get('/me/profile', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const player = await PlayerProfile.findOne({ userId: req.userId });
    
    if (!player) {
      return res.status(404).json({ error: 'Profile not found. Create one first.' });
    }

    res.json(player);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update player stats (internal use)
router.put('/:id/stats', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { gamesPlayed, gamesWon, gamesHosted, totalScore, averageScore } = req.body;

    const player = await PlayerProfile.findOne({ userId: req.params.id });
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (gamesPlayed !== undefined) player.stats.gamesPlayed = gamesPlayed;
    if (gamesWon !== undefined) player.stats.gamesWon = gamesWon;
    if (gamesHosted !== undefined) player.stats.gamesHosted = gamesHosted;
    if (totalScore !== undefined) player.stats.totalScore = totalScore;
    if (averageScore !== undefined) player.stats.averageScore = averageScore;

    await player.save();
    res.json(player);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Add sport to player profile
router.post('/me/sports', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const player = await PlayerProfile.findOne({ userId: req.userId });
    if (!player) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { sport, skillLevel, preferredPosition, yearsOfExperience } = req.body;

    // Check if sport already exists
    if (player.sports.some(s => s.sport === sport)) {
      return res.status(400).json({ error: 'Sport already added to profile' });
    }

    player.sports.push({
      sport,
      skillLevel,
      preferredPosition,
      yearsOfExperience
    });

    await player.save();
    res.json(player);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// Remove sport from player profile
router.delete('/me/sports/:sport', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const player = await PlayerProfile.findOne({ userId: req.userId });
    if (!player) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    player.sports = player.sports.filter(s => s.sport !== req.params.sport);

    await player.save();
    res.json(player);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Send connection request
router.post('/connect', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { targetUserId, message } = req.body;

    if (targetUserId === req.userId) {
      return res.status(400).json({ error: 'Cannot connect with yourself' });
    }

    const targetPlayer = await PlayerProfile.findOne({ userId: targetUserId });
    if (!targetPlayer) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (!targetPlayer.openToInvites) {
      return res.status(400).json({ error: 'Player is not open to connection requests' });
    }

    // In a real app, this would create a notification/connection request
    // For now, we'll just return success
    res.json({ 
      message: 'Connection request sent successfully',
      targetUser: {
        userId: targetPlayer.userId,
        userName: targetPlayer.userName
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
