import { Router } from 'express';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/auth';

const router = Router();

// In-memory storage (TODO: Replace with MongoDB once connected)
interface PlayerProfile {
  id: string;
  userId: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  location?: {
    city?: string;
    area?: string;
  };
  sports?: Array<{
    sport: string;
    skillLevel: string;
  }>;
  isPublicProfile: boolean;
  lookingForPlayers?: boolean;
  openToInvites?: boolean;
  genderPreference?: string;
  stats?: {
    rating: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

let players: PlayerProfile[] = [];

// Discover players with filters
router.get('/', async (req, res) => {
  try {
    let filteredPlayers = players.filter(p => p.isPublicProfile);

    const {
      sport,
      gender,
      city,
      skillLevel,
      lookingForPlayers,
      openToInvites,
      search
    } = req.query;

    if (sport) {
      filteredPlayers = filteredPlayers.filter(p =>
        p.sports?.some(s => s.sport === sport && (!skillLevel || s.skillLevel === skillLevel))
      );
    }

    if (gender) {
      filteredPlayers = filteredPlayers.filter(p => p.gender === gender);
    }

    if (city) {
      filteredPlayers = filteredPlayers.filter(p =>
        p.location?.city?.toLowerCase().includes((city as string).toLowerCase())
      );
    }

    if (lookingForPlayers === 'true') {
      filteredPlayers = filteredPlayers.filter(p => p.lookingForPlayers);
    }

    if (openToInvites === 'true') {
      filteredPlayers = filteredPlayers.filter(p => p.openToInvites);
    }

    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredPlayers = filteredPlayers.filter(p =>
        p.userName?.toLowerCase().includes(searchLower) ||
        p.firstName?.toLowerCase().includes(searchLower) ||
        p.lastName?.toLowerCase().includes(searchLower)
      );
    }

    res.json({ players: filteredPlayers });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get player profile by ID
router.get('/:id', async (req, res) => {
  try {
    const player = players.find(p => p.userId === req.params.id);
    
    if (!player) {
      return res.status(404).json({ error: 'Player not found' });
    }

    if (!player.isPublicProfile) {
      return res.status(403).json({ error: 'This profile is private' });
    }

    res.json(player);
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

    const existingIndex = players.findIndex(p => p.userId === req.userId);

    const profileData: PlayerProfile = {
      id: existingIndex >= 0 ? players[existingIndex].id : `player_${Date.now()}`,
      userId: req.userId,
      ...req.body,
      updatedAt: new Date(),
      createdAt: existingIndex >= 0 ? players[existingIndex].createdAt : new Date()
    };

    if (existingIndex >= 0) {
      players[existingIndex] = profileData;
    } else {
      players.push(profileData);
    }

    res.json(profileData);
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

    const player = players.find(p => p.userId === req.userId);

    if (!player) {
      return res.status(404).json({ 
        error: 'Profile not found',
        message: 'Create your profile first'
      });
    }

    res.json(player);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
