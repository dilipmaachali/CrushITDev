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
import { api } from '@/services';
import { colors } from '@/theme';
import { useAccessibility } from '@/hooks/useAccessibility';
import { TOUCH_TARGET } from '@/constants/accessibility';

interface Player {
  id: string;
  name: string;
  score: number;
  stats?: any;
}

interface Match {
  _id?: string;
  id: string;
  sport: string;
  matchData: {
    type: 'tournament' | 'practice';
    name: string;
    players: Player[];
    createdBy?: string;
  };
  status: 'setup' | 'in-progress' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export default function ScoringScreen({ navigation }: any) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);
  const [gameType, setGameType] = useState<'tournament' | 'practice'>('practice');
  const [selectedSport, setSelectedSport] = useState('cricket');
  const [gameName, setGameName] = useState('');
  const [playerNames, setPlayerNames] = useState(['', '']);
  const [scoringEnabled, setScoringEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMatches();
    loadScoringSettings();
    
    // Reload when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadMatches();
    });
    
    return unsubscribe;
  }, [navigation]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      console.log('Loading matches from API...');
      const response = await api.get('/api/matches');
      console.log('Matches loaded:', response.data?.length || 0, 'matches');
      console.log('Full response:', response.data);
      setMatches(response.data || []);
    } catch (error) {
      console.log('Error loading matches:', error);
      Alert.alert('Error', 'Failed to load matches');
    } finally {
      setLoading(false);
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

  const deleteGame = async (matchId: string) => {
    console.log('Delete function called with matchId:', matchId);
    console.log('Setting showDeleteConfirm to true');
    
    if (!matchId) {
      Alert.alert('Error', 'Unable to delete: Match ID is missing');
      return;
    }

    // Show confirmation modal
    setMatchToDelete(matchId);
    setShowDeleteConfirm(true);
    console.log('showDeleteConfirm state should now be true');
  };

  const confirmDelete = async () => {
    if (!matchToDelete) return;
    
    try {
      console.log('===== DELETE CONFIRMED =====');
      console.log('Deleting match with ID:', matchToDelete);
      const deleteUrl = `/api/matches/${matchToDelete}`;
      console.log('DELETE URL:', deleteUrl);
      const response = await api.delete(deleteUrl);
      console.log('Delete response status:', response.status);
      console.log('Delete response data:', response.data);
      console.log('Reloading matches...');
      await loadMatches();
      console.log('Matches reloaded. Showing success alert.');
      setShowDeleteConfirm(false);
      setMatchToDelete(null);
      Alert.alert('Success', 'Match deleted successfully');
    } catch (error: any) {
      console.error('===== DELETE FAILED =====');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error response status:', error.response?.status);
      console.error('Error response data:', error.response?.data);
      setShowDeleteConfirm(false);
      setMatchToDelete(null);
      Alert.alert('Error', error.response?.data?.error || error.message || 'Failed to delete match');
    }
  };

  const cancelDelete = () => {
    console.log('Delete cancelled by user');
    setShowDeleteConfirm(false);
    setMatchToDelete(null);
  };

  const toggleScoring = async (value: boolean) => {
    setScoringEnabled(value);
    await AsyncStorage.setItem('scoringEnabled', JSON.stringify(value));
  };

  const createGame = async () => {
    if (!gameName.trim()) {
      Alert.alert('Required', 'Please enter a match name');
      return;
    }

    // Redirect to sport-specific setup screens for advanced scoring
    if (selectedSport === 'badminton') {
      setShowCreateModal(false);
      navigation.navigate('BadmintonMatchSetup', {
        matchName: gameName,
        matchType: gameType
      });
      // Reset form
      setGameName('');
      setPlayerNames(['', '']);
      return;
    }

    if (selectedSport === 'cricket') {
      setShowCreateModal(false);
      navigation.navigate('CricketMatchSetup', {
        matchName: gameName,
        matchType: gameType
      });
      // Reset form
      setGameName('');
      setPlayerNames(['', '']);
      return;
    }

    if (selectedSport === 'football') {
      setShowCreateModal(false);
      navigation.navigate('FootballMatchSetup', {
        matchName: gameName,
        matchType: gameType
      });
      // Reset form
      setGameName('');
      setPlayerNames(['', '']);
      return;
    }

    // For generic sports, create match with just name
    try {
      setLoading(true);
      
      const newMatch: any = {
        sport: selectedSport,
        matchData: {
          type: gameType,
          name: gameName,
          players: [],
          createdAt: new Date().toISOString(),
        },
        status: 'in-progress'
      };

      await api.post('/api/matches', newMatch);
      await loadMatches();

      setShowCreateModal(false);
      setGameName('');
      setPlayerNames(['', '']);
      
      Alert.alert('Success', 'Match created successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  const addPlayerField = () => {
    setPlayerNames([...playerNames, '']);
  };

  const updatePlayerName = (index: number, name: string) => {
    const updated = [...playerNames];
    updated[index] = name;
    setPlayerNames(updated);
  };

  const navigateToScoring = (match: Match) => {
    // Navigate to sport-specific scoring screen if available
    const sportScreenMap: { [key: string]: string } = {
      'cricket': 'CricketScoring',
      'badminton': 'BadmintonScoring',
      'football': 'FootballScoring',
    };

    const screenName = sportScreenMap[match.sport] || 'ScoreEntry';
    
    // For sport-specific screens, pass match object directly
    if (sportScreenMap[match.sport]) {
      navigation.navigate(screenName, { match });
    } else {
      // For generic ScoreEntry, use old format
      navigation.navigate('ScoreEntry', {
        game: {
          id: match._id || match.id,
          ...match.matchData,
          sport: match.sport,
          status: match.status
        }
      });
    }
  };

  const sports = [
    { id: 'cricket', name: 'Cricket', emoji: '🏏' },
    { id: 'football', name: 'Football', emoji: '⚽' },
    { id: 'badminton', name: 'Badminton', emoji: '🏸' },
    { id: 'tennis', name: 'Tennis', emoji: '🎾' },
    { id: 'basketball', name: 'Basketball', emoji: '🏀' },
  ];

  const activeMatches = matches.filter(m => m.status === 'in-progress' || m.status === 'setup');
  const completedMatches = matches.filter(m => m.status === 'completed');

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
            Enable score tracking in Settings to create and manage match scores
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
          <Text style={styles.subtitle}>{matches.length} matches tracked</Text>
        </View>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Create new match"
          accessibilityHint="Opens form to create a new tournament or practice match"
        >
          <Text style={styles.createButtonText}>+ New Match</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeMatches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Active Matches ({activeMatches.length})
            </Text>
            {activeMatches.map(match => (
              <View key={match._id || match.id} style={styles.gameCard}>
                <TouchableOpacity
                  style={styles.gameCardContent}
                  onPress={() => navigateToScoring(match)}
                  accessibilityRole="button"
                  accessibilityLabel={`${match.matchData?.name || 'Match'}, ${match.sport || 'Unknown'}, ${match.matchData?.type || 'practice'}, ${match.matchData?.players?.length || 0} players`}
                >
                  <View style={styles.gameHeader}>
                    <Text style={styles.gameSportEmoji}>
                      {sports.find(s => s.id === match.sport)?.emoji}
                    </Text>
                    <View style={styles.gameInfo}>
                      <Text style={styles.gameName}>{match.matchData?.name || 'Unnamed Match'}</Text>
                      <Text style={styles.gameDetails}>
                        {match.sport} • {match.matchData?.players?.length || 0} players
                      </Text>
                      {match.createdAt && (
                        <Text style={styles.gameTimestamp}>
                          {new Date(match.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' • '}
                          {new Date(match.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                    </View>
                    <View style={[
                      styles.typeBadge,
                      (match.matchData?.type === 'tournament') && styles.tournamentBadge
                    ]}>
                      <Text style={[
                        styles.typeBadgeText,
                        (match.matchData?.type === 'tournament') && styles.tournamentBadgeText
                      ]}>
                        {(match.matchData?.type === 'tournament') ? '🏆 Tournament' : '⚡ Practice'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.playersPreview}>
                    {(match.matchData?.players || []).slice(0, 3).map((player: Player, idx: number) => (
                      <Text key={player.id} style={styles.playerPreviewText}>
                        {player.name}: {player.score}
                        {idx < Math.min((match.matchData?.players?.length || 0) - 1, 2) ? ' • ' : ''}
                      </Text>
                    ))}
                    {(match.matchData?.players?.length || 0) > 3 && (
                      <Text style={styles.playerPreviewText}>+{(match.matchData?.players?.length || 0) - 3} more</Text>
                    )}
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const id = match._id || match.id;
                    console.log('Delete button pressed for ACTIVE match:', { 
                      matchId: id, 
                      match_id: match.id, 
                      match__id: match._id,
                      fullMatch: JSON.stringify(match)
                    });
                    if (id) {
                      deleteGame(id);
                    } else {
                      Alert.alert('Error', 'Cannot delete: Match ID is missing');
                    }
                  }}
                  style={styles.deleteButton}
                  activeOpacity={0.6}
                  accessibilityRole="button"
                  accessibilityLabel="Delete match"
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {completedMatches.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              Completed Matches ({completedMatches.length})
            </Text>
            {completedMatches.map(match => (
              <View key={match._id || match.id} style={[styles.gameCard, styles.completedCard]}>
                <TouchableOpacity
                  style={styles.gameCardContent}
                  onPress={() => navigateToScoring(match)}
                  accessibilityRole="button"
                  accessibilityLabel={`Completed match: ${match.matchData?.name || 'Match'}`}
                >
                  <View style={styles.gameHeader}>
                    <Text style={styles.gameSportEmoji}>
                      {sports.find(s => s.id === match.sport)?.emoji}
                    </Text>
                    <View style={styles.gameInfo}>
                      <Text style={styles.gameName}>{match.matchData?.name || 'Unnamed Match'}</Text>
                      <Text style={styles.gameDetails}>
                        Completed • {match.completedAt ? new Date(match.completedAt).toLocaleDateString() : 'Recently'}
                      </Text>
                      {match.createdAt && (
                        <Text style={styles.gameTimestamp}>
                          Started: {new Date(match.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {' • '}
                          {new Date(match.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    const id = match._id || match.id;
                    console.log('Delete button pressed for COMPLETED match:', { 
                      matchId: id, 
                      match_id: match.id, 
                      match__id: match._id,
                      fullMatch: JSON.stringify(match)
                    });
                    if (id) {
                      deleteGame(id);
                    } else {
                      Alert.alert('Error', 'Cannot delete: Match ID is missing');
                    }
                  }}
                  style={styles.deleteButton}
                  activeOpacity={0.6}
                  accessibilityRole="button"
                  accessibilityLabel="Delete completed match"
                >
                  <Text style={styles.deleteButtonText}>🗑️</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {matches.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎯</Text>
            <Text style={styles.emptyTitle}>No Matches Yet</Text>
            <Text style={styles.emptyText}>
              Create your first match to start tracking scores
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
            <Text style={styles.modalTitle}>Create New Match</Text>
            <TouchableOpacity 
              onPress={() => setShowCreateModal(false)}
              accessibilityRole="button"
              accessibilityLabel="Close modal"
            >
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Match Type */}
            <Text style={styles.label}>Match Type</Text>
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

            {/* Match Name */}
            <Text style={styles.label}>Match Name</Text>
            <TextInput
              style={styles.input}
              value={gameName}
              onChangeText={setGameName}
              placeholder="e.g., Weekend Cricket Match"
              placeholderTextColor={colors.text.tertiary}
              accessibilityLabel="Match name input"
              accessibilityHint="Enter a name for this match"
            />

            {/* Info text for sport-specific setup */}
            {['badminton', 'cricket', 'football'].includes(selectedSport) && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  ℹ️ Players will be added in the {selectedSport === 'badminton' ? 'Badminton' : selectedSport === 'cricket' ? 'Cricket' : 'Football'} setup screen
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={styles.createGameButton}
              onPress={createGame}
              accessibilityRole="button"
              accessibilityLabel="Create match"
            >
              <Text style={styles.createGameButtonText}>Create Match</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <View style={styles.dialogBackdrop}>
          <View style={styles.dialogBox}>
            <Text style={styles.dialogTitle}>Delete Match?</Text>
            <Text style={styles.dialogMessage}>
              Are you sure you want to delete this match? This action cannot be undone.
            </Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogButtonCancel]}
                onPress={cancelDelete}
              >
                <Text style={styles.dialogButtonCancelText}>No</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogButton, styles.dialogButtonConfirm]}
                onPress={confirmDelete}
              >
                <Text style={styles.dialogButtonConfirmText}>Yes, Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    position: 'relative',
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 88,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  gameCardContent: {
    flex: 1,
    padding: 16,
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
  gameTimestamp: {
    fontSize: 11,
    color: colors.text.secondary,
    marginTop: 4,
    fontStyle: 'italic',
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
  deleteButton: {
    padding: 8,
    paddingHorizontal: 12,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
  deleteButtonText: {
    fontSize: 20,
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
  infoBox: {
    backgroundColor: colors.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '500',
    lineHeight: 18,
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
  // Delete confirmation dialog styles
  dialogBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dialogBox: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    width: '80%',
    maxWidth: 350,
  },
  dialogTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  dialogMessage: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 24,
    lineHeight: 20,
  },
  dialogButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  dialogButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dialogButtonCancel: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dialogButtonConfirm: {
    backgroundColor: '#ef4444',
  },
  dialogButtonCancelText: {
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  dialogButtonConfirmText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
});

