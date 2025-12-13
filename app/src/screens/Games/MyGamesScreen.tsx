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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import GameChatModal from './GameChatModal';

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

const MyGamesScreen = () => {
  const navigation = useNavigation();
  const [games, setGames] = useState<ScheduledGame[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      loadGames();
    }, [])
  );

  const loadGames = async () => {
    try {
      const response = await api.get('/api/games');
      console.log('MyGamesScreen - Loaded games:', response.data);
      setGames(response.data);
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGames();
    setRefreshing(false);
  };

  const now = new Date();
  
  const upcomingGames = games.filter(g => {
    const gameDate = new Date(g.scheduledDate);
    const [hours, minutes] = g.endTime.split(':').map(Number);
    gameDate.setHours(hours, minutes);
    return gameDate >= now && (g.status === 'scheduled' || g.status === 'ongoing');
  }).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const pastGames = games.filter(g => {
    const gameDate = new Date(g.scheduledDate);
    const [hours, minutes] = g.endTime.split(':').map(Number);
    gameDate.setHours(hours, minutes);
    return gameDate < now || g.status === 'completed' || g.status === 'cancelled';
  }).sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

  console.log(`MyGamesScreen - Total: ${games.length}, Upcoming: ${upcomingGames.length}, Past: ${pastGames.length}`);

  const displayedGames = selectedFilter === 'upcoming' ? upcomingGames : pastGames;

  const renderGameCard = (game: ScheduledGame) => (
    <View key={game.id} style={styles.gameCard}>
      <TouchableOpacity
        style={styles.gameCardMain}
        onPress={() => (navigation as any).navigate('GameDetails', { gameId: game.id })}
      >
        <View style={styles.gameHeader}>
          <Text style={styles.gameTitle}>{game.title || `${game.sportName} Game`}</Text>
          <View style={[
          styles.statusBadge,
          game.status === 'scheduled' && styles.statusScheduled,
          game.status === 'ongoing' && styles.statusOngoing,
          game.status === 'completed' && styles.statusCompleted,
          game.status === 'cancelled' && styles.statusCancelled,
        ]}>
          <Text style={styles.statusText}>{game.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.gameSport}>
        {game.sport === 'Badminton' && '🏸'}
        {game.sport === 'Football' && '⚽'}
        {game.sport === 'Cricket' && '🏏'}
        {game.sport === 'Pickleball' && '🎾'}
        {game.sport === 'Table Tennis' && '🏓'}
        {' '}{game.sportName || game.sport}
      </Text>
      
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
        {game.skillLevel && (
          <Text style={styles.skillText}>{game.skillLevel}</Text>
        )}
      </View>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.chatIconButton}
        onPress={(e) => {
          e.stopPropagation();
          // Open chat modal directly without navigating
          setSelectedGameId(game.id);
          setShowChatModal(true);
        }}
      >
        <Text style={styles.chatIcon}>💬</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Quick Access Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'upcoming' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('upcoming')}
        >
          <Text style={[styles.filterText, selectedFilter === 'upcoming' && styles.filterTextActive]}>
            Upcoming ({upcomingGames.length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'past' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('past')}
        >
          <Text style={[styles.filterText, selectedFilter === 'past' && styles.filterTextActive]}>
            Past ({pastGames.length})
          </Text>
        </TouchableOpacity>
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
        {displayedGames.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>
              {selectedFilter === 'upcoming' ? '📅' : '🏆'}
            </Text>
            <Text style={styles.emptyStateTitle}>
              {selectedFilter === 'upcoming' 
                ? 'No Upcoming Games' 
                : 'No Past Games'}
            </Text>
            <Text style={styles.emptyStateText}>
              {selectedFilter === 'upcoming'
                ? 'Create a new game to get started!'
                : 'Your completed games will appear here'}
            </Text>
          </View>
        ) : (
          displayedGames.map(renderGameCard)
        )}
      </ScrollView>

      {/* Chat Modal */}
      {selectedGameId && (
        <GameChatModal
          visible={showChatModal}
          gameId={selectedGameId}
          onClose={() => {
            setShowChatModal(false);
            setSelectedGameId(null);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary + '15',
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  filterTextActive: {
    color: colors.primary,
    fontWeight: '700',
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  gameCardMain: {
    padding: 16,
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
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusScheduled: {
    backgroundColor: colors.primary + '20',
  },
  statusOngoing: {
    backgroundColor: colors.success + '20',
  },
  statusCompleted: {
    backgroundColor: colors.text.tertiary + '20',
  },
  statusCancelled: {
    backgroundColor: colors.error + '20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.primary,
  },
  gameSport: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
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
  skillText: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  chatIconButton: {
    backgroundColor: colors.primary + '15',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  chatIcon: {
    fontSize: 18,
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

export default MyGamesScreen;
