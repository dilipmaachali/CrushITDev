import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';
import { TOUCH_TARGET } from '@/constants/accessibility';

interface PlayerProfile {
  userId: string;
  userName: string;
  gender: 'male' | 'female' | 'other';
  location: {
    city?: string;
    area?: string;
  };
  sports: Array<{
    sport: string;
    skillLevel: string;
  }>;
  stats: {
    gamesPlayed: number;
    rating: number;
  };
  lookingForPlayers: boolean;
  openToInvites: boolean;
  bio?: string;
}

export default function FindPlayersScreen({ navigation }: any) {
  const [players, setPlayers] = useState<PlayerProfile[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedGender, setSelectedGender] = useState<'all' | 'male' | 'female'>('all');
  const [showLadiesOnly, setShowLadiesOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPlayers();
  }, []);

  const loadPlayers = async () => {
    // Mock data - replace with API call
    const mockPlayers: PlayerProfile[] = [
      {
        userId: 'PLAYER1',
        userName: 'Sarah Johnson',
        gender: 'female',
        location: { city: 'Mumbai', area: 'Andheri' },
        sports: [
          { sport: 'badminton', skillLevel: 'intermediate' },
          { sport: 'tennis', skillLevel: 'beginner' },
        ],
        stats: { gamesPlayed: 15, rating: 4.5 },
        lookingForPlayers: true,
        openToInvites: true,
        bio: 'Love playing badminton on weekends!',
      },
      {
        userId: 'PLAYER2',
        userName: 'Mike Smith',
        gender: 'male',
        location: { city: 'Mumbai', area: 'Bandra' },
        sports: [
          { sport: 'cricket', skillLevel: 'advanced' },
          { sport: 'football', skillLevel: 'intermediate' },
        ],
        stats: { gamesPlayed: 45, rating: 4.8 },
        lookingForPlayers: true,
        openToInvites: true,
        bio: 'Cricket enthusiast, available most evenings',
      },
      {
        userId: 'PLAYER3',
        userName: 'Priya Patel',
        gender: 'female',
        location: { city: 'Mumbai', area: 'Powai' },
        sports: [
          { sport: 'basketball', skillLevel: 'intermediate' },
          { sport: 'badminton', skillLevel: 'advanced' },
        ],
        stats: { gamesPlayed: 32, rating: 4.6 },
        lookingForPlayers: true,
        openToInvites: true,
        bio: 'Looking for regular badminton partners',
      },
      {
        userId: 'PLAYER4',
        userName: 'Anjali Sharma',
        gender: 'female',
        location: { city: 'Mumbai', area: 'Goregaon' },
        sports: [
          { sport: 'tennis', skillLevel: 'intermediate' },
          { sport: 'badminton', skillLevel: 'beginner' },
        ],
        stats: { gamesPlayed: 12, rating: 4.3 },
        lookingForPlayers: true,
        openToInvites: true,
        bio: 'New to the area, looking for tennis buddies!',
      },
    ];

    setPlayers(mockPlayers);
  };

  const sports = [
    { id: 'all', name: 'All Sports', icon: '🎮' },
    { id: 'cricket', name: 'Cricket', icon: '🏏' },
    { id: 'football', name: 'Football', icon: '⚽' },
    { id: 'badminton', name: 'Badminton', icon: '🏸' },
    { id: 'tennis', name: 'Tennis', icon: '🎾' },
    { id: 'basketball', name: 'Basketball', icon: '🏀' },
  ];

  const filteredPlayers = players.filter(player => {
    // Gender filter
    if (showLadiesOnly && player.gender !== 'female') return false;
    if (selectedGender !== 'all' && player.gender !== selectedGender) return false;

    // Sport filter
    if (selectedSport !== 'all') {
      const hasSport = player.sports.some(s => s.sport === selectedSport);
      if (!hasSport) return false;
    }

    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        player.userName.toLowerCase().includes(query) ||
        player.location.city?.toLowerCase().includes(query) ||
        player.location.area?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const ladiesCount = players.filter(p => p.gender === 'female').length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Find Players</Text>
        <Text style={styles.subtitle}>{filteredPlayers.length} players available</Text>
      </View>

      {/* Search */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or location..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        accessibilityLabel="Search players"
      />

      {/* Ladies Only Toggle */}
      <View style={styles.ladiesToggle}>
        <View style={{ flex: 1 }}>
          <Text style={styles.ladiesText}>👩 Ladies Only</Text>
          <Text style={styles.ladiesSubtext}>{ladiesCount} female players available</Text>
        </View>
        <Switch
          value={showLadiesOnly}
          onValueChange={setShowLadiesOnly}
          trackColor={{ false: colors.border, true: '#E91E63' }}
          thumbColor={showLadiesOnly ? '#FFFFFF' : '#CCCCCC'}
        />
      </View>

      {/* Sport Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sportFilter}
        contentContainerStyle={styles.sportFilterContent}
      >
        {sports.map(sport => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportChip,
              selectedSport === sport.id && styles.sportChipActive,
            ]}
            onPress={() => setSelectedSport(sport.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedSport === sport.id }}
          >
            <Text style={styles.sportIcon}>{sport.icon}</Text>
            <Text
              style={[
                styles.sportChipText,
                selectedSport === sport.id && styles.sportChipTextActive,
              ]}
            >
              {sport.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Gender Filter */}
      {!showLadiesOnly && (
        <View style={styles.genderFilter}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              selectedGender === 'all' && styles.genderButtonActive,
            ]}
            onPress={() => setSelectedGender('all')}
          >
            <Text style={styles.genderButtonText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              selectedGender === 'male' && styles.genderButtonActive,
            ]}
            onPress={() => setSelectedGender('male')}
          >
            <Text style={styles.genderButtonText}>👨 Men</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              selectedGender === 'female' && styles.genderButtonActive,
            ]}
            onPress={() => setSelectedGender('female')}
          >
            <Text style={styles.genderButtonText}>👩 Women</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Players List */}
      <ScrollView style={styles.playersList} showsVerticalScrollIndicator={false}>
        {filteredPlayers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyText}>No players found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
          </View>
        ) : (
          filteredPlayers.map(player => (
            <PlayerCard
              key={player.userId}
              player={player}
              onConnect={() => navigation.navigate('PlayerProfile', { userId: player.userId })}
            />
          ))
        )}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

function PlayerCard({ player, onConnect }: any) {
  return (
    <View style={styles.playerCard}>
      <View style={styles.playerHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.playerNameRow}>
            <Text style={styles.playerName}>{player.userName}</Text>
            {player.gender === 'female' && (
              <Text style={styles.femaleBadge}>👩</Text>
            )}
          </View>
          <Text style={styles.playerLocation}>
            📍 {player.location.area}, {player.location.city}
          </Text>
        </View>
        <View style={styles.ratingCard}>
          <Text style={styles.rating}>⭐ {player.stats.rating.toFixed(1)}</Text>
          <Text style={styles.gamesCount}>{player.stats.gamesPlayed} games</Text>
        </View>
      </View>

      {player.bio && <Text style={styles.playerBio}>"{player.bio}"</Text>}

      <View style={styles.sportsRow}>
        {player.sports.map((sport, index) => (
          <View key={index} style={styles.sportTag}>
            <Text style={styles.sportTagText}>
              {sport.sport} • {sport.skillLevel}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.playerStatus}>
        {player.lookingForPlayers && (
          <Text style={styles.statusText}>🎯 Looking for players</Text>
        )}
        {player.openToInvites && (
          <Text style={styles.statusText}>✉️ Open to invites</Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.connectButton}
        onPress={onConnect}
        accessibilityRole="button"
        accessibilityLabel={`Connect with ${player.userName}`}
      >
        <Text style={styles.connectButtonText}>Connect</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  searchInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: colors.text.primary,
    marginHorizontal: 16,
    marginBottom: 16,
    minHeight: TOUCH_TARGET.MINIMUM,
  },
  ladiesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E91E6310',
    borderWidth: 1,
    borderColor: '#E91E6330',
    borderRadius: 12,
    padding: 14,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  ladiesText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E91E63',
    marginBottom: 2,
  },
  ladiesSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  sportFilter: {
    marginBottom: 12,
  },
  sportFilterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  sportChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sportIcon: {
    fontSize: 16,
  },
  sportChipText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  sportChipTextActive: {
    color: '#FFFFFF',
  },
  genderFilter: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderButtonText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  playersList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  playerCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playerHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  playerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  femaleBadge: {
    fontSize: 14,
  },
  playerLocation: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  ratingCard: {
    alignItems: 'flex-end',
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },
  gamesCount: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  playerBio: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  sportsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  sportTag: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  sportTagText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  playerStatus: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  connectButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: TOUCH_TARGET.MINIMUM,
  },
  connectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.text.secondary,
  },
});
