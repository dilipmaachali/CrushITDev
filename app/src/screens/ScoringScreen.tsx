import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  Switch,
  Share,
  AccessibilityInfo,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';
import { useAccessibility } from '@/hooks/useAccessibility';
import { TOUCH_TARGET } from '@/constants/accessibility';

interface Player {
  id: string;
  name: string;
  score: number;
  stats?: any;
}

interface Game {
  id: string;
  type: 'tournament' | 'practice';
  sport: string;
  name: string;
  players: Player[];
  createdAt: string;
  completedAt?: string;
  status: 'active' | 'completed';
  createdBy: string;
}

export default function ScoringScreen({ navigation }: any) {
  const [games, setGames] = useState<Game[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [gameType, setGameType] = useState<'tournament' | 'practice'>('practice');
  const [selectedSport, setSelectedSport] = useState('cricket');
  const [gameName, setGameName] = useState('');
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [scoringEnabled, setScoringEnabled] = useState(true);

  useEffect(() => {
    loadGames();
    loadScoringSettings();
  }, []);

  const loadGames = async () => {
    try {
      const savedGames = await AsyncStorage.getItem('scoringGames');
      if (savedGames) {
        setGames(JSON.parse(savedGames));
      }
    } catch (error) {
      console.log('Error loading games:', error);
    }
  };

  const loadScoringSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem('scoringEnabled');
      if (enabled !== null) {
        setScoringEnabled(JSON.parse(enabled));
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const toggleScoring = async (value: boolean) => {
    setScoringEnabled(value);
    await AsyncStorage.setItem('scoringEnabled', JSON.stringify(value));
  };

  const createGame = async () => {
    if (!gameName.trim()) {
      Alert.alert('Required', 'Please enter a game name');
      return;
    }

    const validPlayers = playerNames.filter(name => name.trim() !== '');
    if (validPlayers.length < 2) {
      Alert.alert('Required', 'Please add at least 2 players');
      return;
    }

    const newGame: Game = {
      id: `GAME${Date.now()}`,
      type: gameType,
      sport: selectedSport,
      name: gameName,
      players: validPlayers.map((name, index) => ({
        id: `P${index + 1}`,
        name,
        score: 0,
      })),
      createdAt: new Date().toISOString(),
      status: 'active',
      createdBy: 'Current User',
    };

    const updatedGames = [newGame, ...games];
    setGames(updatedGames);
    await AsyncStorage.setItem('scoringGames', JSON.stringify(updatedGames));

    setShowCreateModal(false);
    setGameName('');
    setPlayerNames(['', '']);
    
    navigation.navigate('ScoreEntry', { game: newGame });
  };

  const addPlayerField = () => {
    setPlayerNames([...playerNames, '']);
  };

  const updatePlayerName = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const sports = [
    { id: 'cricket', name: 'Cricket', emoji: '🏏' },
    { id: 'football', name: 'Football', emoji: '⚽' },
    { id: 'badminton', name: 'Badminton', emoji: '🏸' },
    { id: 'tennis', name: 'Tennis', emoji: '🎾' },
    { id: 'basketball', name: 'Basketball', emoji: '🏀' },
  ];

  const activeGames = games.filter(g => g.status === 'active');
  const completedGames = games.filter(g => g.status === 'completed');

  if (!scoringEnabled) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Score Tracking</Text>
        </View>
        <View style={styles.disabledContainer}>
          <Text style={styles.disabledIcon}>📊</Text>
          <Text style={styles.disabledTitle}>Score Tracking Disabled</Text>
          <Text style={styles.disabledText}>
            Enable score tracking in Settings to create and manage game scores
          </Text>
          <TouchableOpacity
            style={styles.enableButton}
            onPress={() => navigation.navigate('Settings')}
            accessibilityRole="button"
            accessibilityLabel="Go to Settings to enable score tracking"
          >
            <Text style={styles.enableButtonText}>Go to Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Score Tracking</Text>
          <Text style={styles.subtitle}>{games.length} games tracked</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Create new game"
          accessibilityHint="Opens form to create a new tournament or practice game"
        >
          <Text style={styles.createButtonText}>+ New Game</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeGames.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Active Games ({activeGames.length})
            </Text>
            {activeGames.map(game => (
              <TouchableOpacity
                key={game.id}
                style={styles.gameCard}
                onPress={() => navigation.navigate('ScoreEntry', { game })}
                accessibilityRole="button"
                accessibilityLabel={`${game.name}, ${game.sport}, ${game.type}, ${game.players.length} players`}
              >
                <View style={styles.gameHeader}>
                  <Text style={styles.gameSportEmoji}>
                    {sports.find(s => s.id === game.sport)?.emoji}
                  </Text>
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameName}>{game.name}</Text>
                    <Text style={styles.gameDetails}>
                      {game.sport} • {game.players.length} players
                    </Text>
                  </View>
                  <View style={[
                    styles.typeBadge,
                    game.type === 'tournament' && styles.tournamentBadge
                  ]}>
                    <Text style={[
                      styles.typeBadgeText,
                      game.type === 'tournament' && styles.tournamentBadgeText
                    ]}>
                      {game.type === 'tournament' ? '🏆 Tournament' : '⚡ Practice'}
                    </Text>
                  </View>
                </View>
                <View style={styles.playersPreview}>
                  {game.players.slice(0, 3).map((player, idx) => (
                    <Text key={player.id} style={styles.playerPreviewText}>
                      {player.name}: {player.score}
                      {idx < Math.min(game.players.length - 1, 2) ? ' • ' : ''}
                    </Text>
                  ))}
                  {game.players.length > 3 && (
                    <Text style={styles.playerPreviewText}>+{game.players.length - 3} more</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {completedGames.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Completed Games ({completedGames.length})
            </Text>
            {completedGames.map(game => (
              <TouchableOpacity
                key={game.id}
                style={[styles.gameCard, styles.completedCard]}
                onPress={() => navigation.navigate('GameSummary', { game })}
                accessibilityRole="button"
                accessibilityLabel={`Completed game: ${game.name}`}
              >
                <View style={styles.gameHeader}>
                  <Text style={styles.gameSportEmoji}>
                    {sports.find(s => s.id === game.sport)?.emoji}
                  </Text>
                  <View style={styles.gameInfo}>
                    <Text style={styles.gameName}>{game.name}</Text>
                    <Text style={styles.gameDetails}>
                      Completed • {new Date(game.completedAt!).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {games.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No Games Yet</Text>
            <Text style={styles.emptyText}>
              Create your first game to start tracking scores
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Create Game Modal */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Create New Game</Text>
            <TouchableOpacity 
              onPress={() => setShowCreateModal(false)}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Game Type */}
            <Text style={styles.label}>Game Type</Text>
            <View style={styles.typeButtons}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  gameType === 'practice' && styles.typeButtonActive
                ]}
                onPress={() => setGameType('practice')}
                accessibilityRole="radio"
                accessibilityState={{ checked: gameType === 'practice' }}
                accessibilityLabel="Practice mode"
              >
                <Text style={[
                  styles.typeButtonText,
                  gameType === 'practice' && styles.typeButtonTextActive
                ]}>⚡ Practice</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  gameType === 'tournament' && styles.typeButtonActive
                ]}
                onPress={() => setGameType('tournament')}
                accessibilityRole="radio"
                accessibilityState={{ checked: gameType === 'tournament' }}
                accessibilityLabel="Tournament mode with leaderboard"
              >
                <Text style={[
                  styles.typeButtonText,
                  gameType === 'tournament' && styles.typeButtonTextActive
                ]}>🏆 Tournament</Text>
              </TouchableOpacity>
            </View>

            {/* Sport Selection */}
            <Text style={styles.label}>Select Sport</Text>
            <View style={styles.sportsGrid}>
              {sports.map(sport => (
                <TouchableOpacity
                  key={sport.id}
                  style={[
                    styles.sportButton,
                    selectedSport === sport.id && styles.sportButtonActive
                  ]}
                  onPress={() => setSelectedSport(sport.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: selectedSport === sport.id }}
                  accessibilityLabel={`${sport.name} sport`}
                >
                  <Text style={styles.sportEmoji}>{sport.emoji}</Text>
                  <Text style={[
                    styles.sportName,
                    selectedSport === sport.id && styles.sportNameActive
                  ]}>{sport.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Game Name */}
            <Text style={styles.label}>Game Name</Text>
            <TextInput
              style={styles.input}
              value={gameName}
              onChangeText={setGameName}
              placeholder="e.g., Weekend Cricket Match"
              placeholderTextColor={colors.text.tertiary}
              accessibilityLabel="Game name input"
              accessibilityHint="Enter a name for this game"
            />

            {/* Players */}
            <Text style={styles.label}>Players</Text>
            {playerNames.map((name, index) => (
              <TextInput
                key={index}
                style={styles.input}
                value={name}
                onChangeText={(text) => updatePlayerName(index, text)}
                placeholder={`Player ${index + 1} name`}
                placeholderTextColor={colors.text.tertiary}
                accessibilityLabel={`Player ${index + 1} name input`}
              />
            ))}
            <TouchableOpacity
              style={styles.addPlayerButton}
              onPress={addPlayerField}
              accessibilityRole="button"
              accessibilityLabel="Add another player"
            >
              <Text style={styles.addPlayerText}>+ Add Player</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createGameButton}
              onPress={createGame}
              accessibilityRole="button"
              accessibilityLabel="Create game"
            >
              <Text style={styles.createGameButtonText}>Create Game</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 120,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  gameCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 88,
  },
  completedCard: {
    opacity: 0.7,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameSportEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  gameDetails: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  typeBadge: {
    backgroundColor: colors.secondary + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  tournamentBadge: {
    backgroundColor: colors.accent + '20',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.secondary,
  },
  tournamentBadgeText: {
    color: colors.accent,
  },
  playersPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  playerPreviewText: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  disabledContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  disabledIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  disabledTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  disabledText: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  enableButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minHeight: 48,
  },
  enableButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: 28,
    color: colors.text.tertiary,
    paddingHorizontal: 8,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 16,
  },
  typeButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  typeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  typeButtonTextActive: {
    color: colors.primary,
  },
  sportsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sportButton: {
    width: '30%',
    padding: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  sportButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  sportEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  sportName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  sportNameActive: {
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    minHeight: 48,
  },
  addPlayerButton: {
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    borderStyle: 'dashed',
    marginBottom: 24,
    minHeight: 48,
    justifyContent: 'center',
  },
  addPlayerText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  createGameButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 52,
    justifyContent: 'center',
  },
  createGameButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
