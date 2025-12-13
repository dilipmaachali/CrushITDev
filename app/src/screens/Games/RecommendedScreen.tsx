import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { colors } from '@/theme';
import { api } from '@/services';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

interface ScheduledGame {
  id: string;
  sport: string;
  sportName: string;
  title: string;
  description: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  location: {
    address: string;
    arenaName?: string;
  };
  hostId: string;
  hostName: string;
  maxPlayers: number;
  currentPlayers: Array<{ userId: string; userName: string; gender: string; status: string }>;
  paymentType: 'prepaid' | 'pay_later' | 'free';
  costPerPlayer?: number;
  isPublic: boolean;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  shareCode: string;
  skillLevel?: string;
}

const SPORTS = [
  { id: 'Badminton', name: 'Badminton', emoji: '🏸' },
  { id: 'Football', name: 'Football', emoji: '⚽' },
  { id: 'Pickleball', name: 'Pickleball', emoji: '🎾' },
  { id: 'Table Tennis', name: 'Table Tennis', emoji: '🏓' },
  { id: 'Cricket', name: 'Cricket', emoji: '🏏' },
];

const RecommendedScreen = () => {
  const navigation = useNavigation();
  const [allGames, setAllGames] = useState<ScheduledGame[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('Badminton');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadAllGames();
    }, [])
  );

  const loadAllGames = async () => {
    try {
      // In a real app, this would fetch all public games from all users
      // For now, we'll fetch and show all games as "recommended"
      const response = await api.get('/api/games');
      const publicGames = response.data.filter((g: ScheduledGame) => 
        g.isPublic && 
        g.status === 'scheduled' &&
        new Date(g.scheduledDate) >= new Date()
      );
      setAllGames(publicGames);
    } catch (error) {
      console.error('Error loading games:', error);
      setAllGames([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAllGames();
    setRefreshing(false);
  };

  const gamesBySport = SPORTS.map(sport => ({
    ...sport,
    games: allGames.filter(g => 
      g.sport === sport.id || g.sportName === sport.name
    ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()),
  }));

  const currentSportGames = gamesBySport.find(s => s.id === selectedSport)?.games || [];

  const renderGameCard = (game: ScheduledGame) => (
    <TouchableOpacity
      key={game.id}
      style={styles.gameCard}
      onPress={() => (navigation as any).navigate('GameDetails', { gameId: game.id })}
    >
      <View style={styles.gameHeader}>
        <Text style={styles.gameTitle}>{game.title || `${game.sportName} Game`}</Text>
        {game.skillLevel && (
          <View style={styles.skillBadge}>
            <Text style={styles.skillText}>{game.skillLevel}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.hostText}>👤 Hosted by {game.hostName || 'Unknown'}</Text>
      
      <View style={styles.gameDetails}>
        <Text style={styles.detailText}>
          📅 {new Date(game.scheduledDate).toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
          })}
        </Text>
        <Text style={styles.detailText}>
          🕐 {game.startTime} - {game.endTime}
        </Text>
      </View>
      
      <Text style={styles.locationText}>
        📍 {game.location?.arenaName || game.location?.address || 'Location TBD'}
      </Text>
      
      <View style={styles.gameFooter}>
        <Text style={styles.playersText}>
          👥 {game.currentPlayers?.length || 0}/{game.maxPlayers || 4} Players
        </Text>
        {game.paymentType !== 'free' && game.costPerPlayer && (
          <Text style={styles.costText}>₹{game.costPerPlayer}</Text>
        )}
        {game.isPublic && (
          <View style={styles.publicBadge}>
            <Text style={styles.publicText}>Public</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Sport Filter Tabs */}
      <View style={styles.sportTabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.sportTabs}
        >
          {SPORTS.map(sport => (
            <TouchableOpacity
              key={sport.id}
              style={[
                styles.sportTab,
                selectedSport === sport.id && styles.sportTabActive
              ]}
              onPress={() => setSelectedSport(sport.id)}
            >
              <Text style={styles.sportEmoji}>{sport.emoji}</Text>
              <Text style={[
                styles.sportTabText,
                selectedSport === sport.id && styles.sportTabTextActive
              ]}>
                {sport.name}
              </Text>
              <View style={[
                styles.countBadge,
                selectedSport === sport.id && styles.countBadgeActive
              ]}>
                <Text style={[
                  styles.countText,
                  selectedSport === sport.id && styles.countTextActive
                ]}>
                  {gamesBySport.find(s => s.id === sport.id)?.games.length || 0}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Games List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {currentSportGames.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>
              {SPORTS.find(s => s.id === selectedSport)?.emoji}
            </Text>
            <Text style={styles.emptyStateTitle}>
              No {selectedSport} Games Available
            </Text>
            <Text style={styles.emptyStateText}>
              Check back later or create your own game!
            </Text>
          </View>
        ) : (
          currentSportGames.map(renderGameCard)
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  sportTabsContainer: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sportTabs: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  sportTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 8,
    gap: 8,
  },
  sportTabActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  sportEmoji: {
    fontSize: 20,
  },
  sportTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  sportTabTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: colors.border,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 24,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: colors.primary,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.text.secondary,
  },
  countTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  gameCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
  },
  skillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.primary + '20',
    marginLeft: 8,
  },
  skillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    textTransform: 'capitalize',
  },
  hostText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  gameDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  locationText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  gameFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  playersText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  costText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
  publicBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: colors.success + '20',
  },
  publicText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.success,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});

export default RecommendedScreen;
