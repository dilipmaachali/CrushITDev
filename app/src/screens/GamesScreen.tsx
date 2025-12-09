import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Share,
  Alert,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';
import { TOUCH_TARGET } from '@/constants/accessibility';

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
  coHosts: Array<{ userId: string; userName: string }>;
  maxPlayers: number;
  minPlayers: number;
  currentPlayers: Array<{ userId: string; userName: string; gender: string; status: string }>;
  inviteRequests: Array<{ userId: string; userName: string; gender: string; status: string; message?: string }>;
  paymentType: 'prepaid' | 'pay_later' | 'free';
  costPerPlayer?: number;
  isPublic: boolean;
  genderRestriction: 'all' | 'male_only' | 'female_only';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  shareCode: string;
}

export default function GamesScreen({ navigation }: any) {
  const [games, setGames] = useState<ScheduledGame[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTab, setSelectedTab] = useState<'my_games' | 'discover' | 'requests'>('my_games');
  const [currentUserId] = useState('USER123'); // Replace with actual user ID
  const [currentUserName] = useState('John Doe'); // Replace with actual user name

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const savedGames = await AsyncStorage.getItem('scheduledGames');
      if (savedGames) {
        setGames(JSON.parse(savedGames));
      }
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const saveGames = async (updatedGames: ScheduledGame[]) => {
    try {
      await AsyncStorage.setItem('scheduledGames', JSON.stringify(updatedGames));
      setGames(updatedGames);
    } catch (error) {
      console.error('Error saving games:', error);
    }
  };

  const shareGame = async (game: ScheduledGame) => {
    const shareMessage = `
🏏 Join my game on CrushIT!

${game.title}
Sport: ${game.sport}
Date: ${new Date(game.scheduledDate).toLocaleDateString()}
Time: ${game.startTime} - ${game.endTime}
Location: ${game.location.address}

Players: ${game.currentPlayers.length}/${game.maxPlayers}
${game.paymentType !== 'free' ? `Cost: ₹${game.costPerPlayer} per player` : 'Free to join!'}

Share Code: ${game.shareCode}

Download CrushIT to join!
    `;

    try {
      await Share.share({ message: shareMessage });
    } catch (error) {
      console.error('Error sharing game:', error);
    }
  };

  const myGames = games.filter(g => 
    g.hostId === currentUserId || 
    g.coHosts.some(ch => ch.userId === currentUserId) ||
    g.currentPlayers.some(p => p.userId === currentUserId)
  );

  const requestedGames = games.filter(g =>
    g.inviteRequests.some(r => r.userId === currentUserId && r.status === 'pending')
  );

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'my_games' && styles.activeTab]}
          onPress={() => setSelectedTab('my_games')}
          accessibilityRole="button"
          accessibilityLabel="My Games"
        >
          <Text style={[styles.tabText, selectedTab === 'my_games' && styles.activeTabText]}>
            My Games ({myGames.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'discover' && styles.activeTab]}
          onPress={() => setSelectedTab('discover')}
          accessibilityRole="button"
          accessibilityLabel="Discover Games"
        >
          <Text style={[styles.tabText, selectedTab === 'discover' && styles.activeTabText]}>
            Discover
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'requests' && styles.activeTab]}
          onPress={() => setSelectedTab('requests')}
          accessibilityRole="button"
          accessibilityLabel="Game Requests"
        >
          <Text style={[styles.tabText, selectedTab === 'requests' && styles.activeTabText]}>
            Requests ({requestedGames.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {selectedTab === 'my_games' && (
          <View>
            {myGames.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>🎮</Text>
                <Text style={styles.emptyText}>No games scheduled yet</Text>
                <Text style={styles.emptySubtext}>Create your first game to get started!</Text>
              </View>
            ) : (
              myGames.map(game => (
                <GameCard
                  key={game.id}
                  game={game}
                  currentUserId={currentUserId}
                  onShare={() => shareGame(game)}
                  onEdit={() => navigation.navigate('EditGame', { gameId: game.id })}
                  onManagePlayers={() => navigation.navigate('ManagePlayers', { gameId: game.id })}
                />
              ))
            )}
          </View>
        )}

        {selectedTab === 'discover' && (
          <DiscoverGames
            games={games.filter(g => g.isPublic && g.status === 'scheduled')}
            currentUserId={currentUserId}
            onRequestJoin={(gameId) => {
              // Handle join request
              navigation.navigate('RequestJoin', { gameId });
            }}
          />
        )}

        {selectedTab === 'requests' && (
          <GameRequests
            games={requestedGames}
            onAccept={(gameId) => {
              // Handle accept
            }}
            onReject={(gameId) => {
              // Handle reject
            }}
          />
        )}
      </ScrollView>

      {/* Create Game Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateGame')}
        accessibilityRole="button"
        accessibilityLabel="Create new game"
      >
        <Text style={styles.createButtonText}>+ Create Game</Text>
      </TouchableOpacity>
    </View>
  );
}

function GameCard({ game, currentUserId, onShare, onEdit, onManagePlayers }: any) {
  const isHost = game.hostId === currentUserId;
  const isCoHost = game.coHosts.some((ch: any) => ch.userId === currentUserId);
  const canManage = isHost || isCoHost;

  return (
    <View style={styles.gameCard}>
      <View style={styles.gameHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.gameTitle}>{game.title}</Text>
          <Text style={styles.gameSport}>{game.sport.toUpperCase()}</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{game.status}</Text>
        </View>
      </View>

      <View style={styles.gameDetails}>
        <Text style={styles.detailText}>📅 {new Date(game.scheduledDate).toLocaleDateString()}</Text>
        <Text style={styles.detailText}>⏰ {game.startTime} - {game.endTime}</Text>
        <Text style={styles.detailText}>📍 {game.location.address}</Text>
        <Text style={styles.detailText}>
          👥 {game.currentPlayers.length}/{game.maxPlayers} players
        </Text>
        {game.paymentType !== 'free' && (
          <Text style={styles.detailText}>
            💰 ₹{game.costPerPlayer} ({game.paymentType === 'prepaid' ? 'Pre-paid' : 'Pay Later'})
          </Text>
        )}
      </View>

      {isHost && <Text style={styles.hostBadge}>🎯 You are the host</Text>}
      {isCoHost && <Text style={styles.coHostBadge}>⭐ You are a co-host</Text>}

      <View style={styles.gameActions}>
        {canManage && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onEdit}
              accessibilityRole="button"
              accessibilityLabel="Edit game"
            >
              <Text style={styles.actionButtonText}>✏️ Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={onManagePlayers}
              accessibilityRole="button"
              accessibilityLabel="Manage players"
            >
              <Text style={styles.actionButtonText}>👥 Manage</Text>
            </TouchableOpacity>
          </>
        )}
        <TouchableOpacity
          style={[styles.actionButton, styles.shareButton]}
          onPress={onShare}
          accessibilityRole="button"
          accessibilityLabel="Share game"
        >
          <Text style={styles.actionButtonText}>📤 Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DiscoverGames({ games, currentUserId, onRequestJoin }: any) {
  const [genderFilter, setGenderFilter] = useState<'all' | 'male_only' | 'female_only'>('all');

  const filteredGames = games.filter((g: ScheduledGame) => {
    if (genderFilter === 'all') return true;
    return g.genderRestriction === genderFilter;
  });

  return (
    <View>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filter by gender:</Text>
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, genderFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setGenderFilter('all')}
          >
            <Text style={styles.filterButtonText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, genderFilter === 'male_only' && styles.filterButtonActive]}
            onPress={() => setGenderFilter('male_only')}
          >
            <Text style={styles.filterButtonText}>Men</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, genderFilter === 'female_only' && styles.filterButtonActive]}
            onPress={() => setGenderFilter('female_only')}
          >
            <Text style={styles.filterButtonText}>Women</Text>
          </TouchableOpacity>
        </View>
      </View>

      {filteredGames.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyText}>No games found</Text>
        </View>
      ) : (
        filteredGames.map((game: ScheduledGame) => (
          <View key={game.id} style={styles.gameCard}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameSport}>{game.sport.toUpperCase()}</Text>
            <Text style={styles.detailText}>📅 {new Date(game.scheduledDate).toLocaleDateString()}</Text>
            <Text style={styles.detailText}>👥 {game.currentPlayers.length}/{game.maxPlayers} players</Text>
            {game.genderRestriction === 'female_only' && (
              <Text style={styles.ladiesBadge}>👩 Ladies Only</Text>
            )}
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => onRequestJoin(game.id)}
            >
              <Text style={styles.joinButtonText}>Request to Join</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </View>
  );
}

function GameRequests({ games, onAccept, onReject }: any) {
  return (
    <View>
      {games.map((game: ScheduledGame) => (
        <View key={game.id} style={styles.requestCard}>
          <Text style={styles.gameTitle}>{game.title}</Text>
          <Text style={styles.detailText}>Host: {game.hostName}</Text>
          <Text style={styles.detailText}>📅 {new Date(game.scheduledDate).toLocaleDateString()}</Text>
          <View style={styles.requestActions}>
            <TouchableOpacity
              style={styles.acceptButton}
              onPress={() => onAccept(game.id)}
            >
              <Text style={styles.acceptButtonText}>✓ Accept</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={() => onReject(game.id)}
            >
              <Text style={styles.rejectButtonText}>✗ Reject</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  gameCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  gameSport: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  gameDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  hostBadge: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 8,
  },
  coHostBadge: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: '600',
    marginBottom: 8,
  },
  ladiesBadge: {
    fontSize: 12,
    color: '#E91E63',
    fontWeight: '600',
    backgroundColor: '#E91E6320',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  gameActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: TOUCH_TARGET.MINIMUM,
  },
  shareButton: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  createButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    minHeight: TOUCH_TARGET.LARGE,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  requestCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: colors.error,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
