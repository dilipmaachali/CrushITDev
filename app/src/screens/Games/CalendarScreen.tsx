import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';
import { api } from '@/services';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

interface ScheduledGame {
  id: string;
  sport: string;
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
}

const CalendarScreen = () => {
  const navigation = useNavigation();
  const [games, setGames] = useState<ScheduledGame[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId] = useState('USER123'); // Replace with actual user ID

  useFocusEffect(
    React.useCallback(() => {
      loadGames();
    }, [])
  );

  const loadGames = async () => {
    try {
      // Fetch from backend API
      const response = await api.get('/api/games');
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

  const myGames = games.filter(g => 
    g.hostId === currentUserId || 
    g.currentPlayers.some(p => p.userId === currentUserId)
  );

  const now = new Date();
  const upcomingGames = myGames.filter(g => {
    const gameDate = new Date(g.scheduledDate);
    return gameDate >= now && g.status === 'scheduled';
  }).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const pastGames = myGames.filter(g => {
    const gameDate = new Date(g.scheduledDate);
    return gameDate < now || g.status === 'completed' || g.status === 'cancelled';
  }).sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime());

  const displayedGames = selectedFilter === 'upcoming' ? upcomingGames : pastGames;

  const renderGameCard = (game: ScheduledGame) => (
    <TouchableOpacity
      key={game.id}
      style={styles.gameCard}
      onPress={() => (navigation as any).navigate('EditGame', { gameId: game.id })}
    >
      <View style={styles.gameHeader}>
        <Text style={styles.gameTitle}>{game.title}</Text>
        <View style={[
          styles.statusBadge,
          game.status === 'scheduled' && styles.statusScheduled,
          game.status === 'completed' && styles.statusCompleted,
          game.status === 'cancelled' && styles.statusCancelled,
        ]}>
          <Text style={styles.statusText}>{game.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <Text style={styles.gameSport}>🏏 {game.sport}</Text>
      
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
      
      <Text style={styles.locationText}>📍 {game.location.arenaName || game.location.address}</Text>
      
      <View style={styles.gameFooter}>
        <Text style={styles.playersText}>
          👥 {game.currentPlayers.length}/{game.maxPlayers} Players
        </Text>
        {game.paymentType !== 'free' && (
          <Text style={styles.costText}>₹{game.costPerPlayer}</Text>
        )}
      </View>
    </TouchableOpacity>
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
            Upcoming
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.filterButton, selectedFilter === 'past' && styles.filterButtonActive]}
          onPress={() => setSelectedFilter('past')}
        >
          <Text style={[styles.filterText, selectedFilter === 'past' && styles.filterTextActive]}>
            Past
          </Text>
        </TouchableOpacity>
      </View>

      {/* Games List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {displayedGames.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {selectedFilter === 'upcoming' 
                ? 'No upcoming games. Book a court to create one!' 
                : 'No past games yet.'}
            </Text>
          </View>
        ) : (
          displayedGames.map(renderGameCard)
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
  filterContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: colors.card,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  filterTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  gameCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusScheduled: {
    backgroundColor: colors.success + '20',
  },
  statusCompleted: {
    backgroundColor: colors.textSecondary + '20',
  },
  statusCancelled: {
    backgroundColor: colors.error + '20',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.text,
  },
  gameSport: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  gameDetails: {
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  locationText: {
    fontSize: 14,
    color: colors.textSecondary,
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
    color: colors.text,
    fontWeight: '600',
  },
  costText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default CalendarScreen;
