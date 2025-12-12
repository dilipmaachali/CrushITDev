import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { colors } from '@/theme';

const FORMATIONS = ['4-4-2', '4-3-3', '3-5-2', '4-2-3-1', '3-4-3', '5-3-2'];
const POSITIONS = ['GK', 'DEF', 'MID', 'FWD'] as const;

interface Player {
  id: string;
  name: string;
  number: number;
  position: typeof POSITIONS[number];
  isStarter: boolean;
  isCaptain?: boolean;
}

export default function FootballMatchSetupScreen({ route, navigation }: any) {
  const { gameId } = route.params;
  
  const [homeTeamName, setHomeTeamName] = useState('Home Team');
  const [awayTeamName, setAwayTeamName] = useState('Away Team');
  const [homeFormation, setHomeFormation] = useState('4-4-2');
  const [awayFormation, setAwayFormation] = useState('4-4-2');
  const [matchType, setMatchType] = useState<'league' | 'knockout' | 'friendly'>('friendly');
  
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
  
  const [editingTeam, setEditingTeam] = useState<'home' | 'away'>('home');
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerNumber, setPlayerNumber] = useState('');
  const [playerPosition, setPlayerPosition] = useState<typeof POSITIONS[number]>('MID');

  const addPlayer = () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter player name');
      return;
    }
    
    const number = parseInt(playerNumber) || 1;
    const players = editingTeam === 'home' ? homePlayers : awayPlayers;
    
    if (players.some(p => p.number === number)) {
      Alert.alert('Error', 'Jersey number already taken');
      return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: playerName.trim(),
      number,
      position: playerPosition,
      isStarter: players.filter(p => p.isStarter).length < 11,
      isCaptain: false,
    };

    if (editingTeam === 'home') {
      setHomePlayers([...homePlayers, newPlayer]);
    } else {
      setAwayPlayers([...awayPlayers, newPlayer]);
    }

    setPlayerName('');
    setPlayerNumber('');
    setPlayerPosition('MID');
    setShowPlayerModal(false);
  };

  const generateQuickLineup = (team: 'home' | 'away') => {
    const defaultPlayers: Player[] = [
      { id: '1', name: 'Goalkeeper', number: 1, position: 'GK', isStarter: true },
      { id: '2', name: 'Right Back', number: 2, position: 'DEF', isStarter: true },
      { id: '3', name: 'Center Back 1', number: 3, position: 'DEF', isStarter: true },
      { id: '4', name: 'Center Back 2', number: 4, position: 'DEF', isStarter: true },
      { id: '5', name: 'Left Back', number: 5, position: 'DEF', isStarter: true },
      { id: '6', name: 'Midfielder 1', number: 6, position: 'MID', isStarter: true },
      { id: '7', name: 'Midfielder 2', number: 7, position: 'MID', isStarter: true },
      { id: '8', name: 'Midfielder 3', number: 8, position: 'MID', isStarter: true },
      { id: '9', name: 'Midfielder 4', number: 9, position: 'MID', isStarter: true },
      { id: '10', name: 'Forward 1', number: 10, position: 'FWD', isStarter: true, isCaptain: true },
      { id: '11', name: 'Forward 2', number: 11, position: 'FWD', isStarter: true },
    ];

    if (team === 'home') {
      setHomePlayers(defaultPlayers);
    } else {
      setAwayPlayers(defaultPlayers);
    }

    Alert.alert('Success', 'Quick lineup generated! You can edit player names and numbers.');
  };

  const startMatch = () => {
    // Validation
    if (!homeTeamName.trim() || !awayTeamName.trim()) {
      Alert.alert('Error', 'Please enter both team names');
      return;
    }

    const homeStarters = homePlayers.filter(p => p.isStarter);
    const awayStarters = awayPlayers.filter(p => p.isStarter);

    if (homeStarters.length < 11 || awayStarters.length < 11) {
      Alert.alert('Error', 'Each team needs 11 starting players');
      return;
    }

    if (!homePlayers.some(p => p.isCaptain) || !awayPlayers.some(p => p.isCaptain)) {
      Alert.alert('Error', 'Please select a captain for each team');
      return;
    }

    // Initialize match object
    const match = {
      id: Date.now().toString(),
      gameId,
      homeTeam: {
        name: homeTeamName,
        players: homePlayers.map(p => ({
          ...p,
          teamId: 'home' as const,
          stats: {
            goals: 0,
            assists: 0,
            shots: 0,
            shotsOnTarget: 0,
            passes: 0,
            passesCompleted: 0,
            tackles: 0,
            interceptions: 0,
            fouls: 0,
            yellowCards: 0,
            redCards: 0,
            minutesPlayed: 0,
            rating: 6.0,
          },
        })),
        formation: homeFormation,
      },
      awayTeam: {
        name: awayTeamName,
        players: awayPlayers.map(p => ({
          ...p,
          teamId: 'away' as const,
          stats: {
            goals: 0,
            assists: 0,
            shots: 0,
            shotsOnTarget: 0,
            passes: 0,
            passesCompleted: 0,
            tackles: 0,
            interceptions: 0,
            fouls: 0,
            yellowCards: 0,
            redCards: 0,
            minutesPlayed: 0,
            rating: 6.0,
          },
        })),
        formation: awayFormation,
      },
      score: { home: 0, away: 0 },
      period: 'first_half' as const,
      minute: 0,
      injuryTime: 0,
      events: [],
      stats: {
        possession: { home: 50, away: 50 },
        shots: { home: 0, away: 0 },
        shotsOnTarget: { home: 0, away: 0 },
        corners: { home: 0, away: 0 },
        fouls: { home: 0, away: 0 },
        offsides: { home: 0, away: 0 },
        yellowCards: { home: 0, away: 0 },
        redCards: { home: 0, away: 0 },
        passes: { home: 0, away: 0 },
        passAccuracy: { home: 0, away: 0 },
      },
      matchType,
      status: 'scheduled' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Navigate to scoring screen
    navigation.replace('FootballScoring', { gameId, match });
  };

  const toggleCaptain = (playerId: string, team: 'home' | 'away') => {
    const players = team === 'home' ? homePlayers : awayPlayers;
    const updated = players.map(p => ({
      ...p,
      isCaptain: p.id === playerId,
    }));

    if (team === 'home') {
      setHomePlayers(updated);
    } else {
      setAwayPlayers(updated);
    }
  };

  const toggleStarter = (playerId: string, team: 'home' | 'away') => {
    const players = team === 'home' ? homePlayers : awayPlayers;
    const player = players.find(p => p.id === playerId);
    
    if (!player) return;

    const currentStarters = players.filter(p => p.isStarter);
    
    if (!player.isStarter && currentStarters.length >= 11) {
      Alert.alert('Error', 'Maximum 11 starting players');
      return;
    }

    const updated = players.map(p => ({
      ...p,
      isStarter: p.id === playerId ? !p.isStarter : p.isStarter,
    }));

    if (team === 'home') {
      setHomePlayers(updated);
    } else {
      setAwayPlayers(updated);
    }
  };

  const removePlayer = (playerId: string, team: 'home' | 'away') => {
    if (team === 'home') {
      setHomePlayers(homePlayers.filter(p => p.id !== playerId));
    } else {
      setAwayPlayers(awayPlayers.filter(p => p.id !== playerId));
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Match Setup</Text>
        <Text style={styles.subtitle}>Configure teams and lineups</Text>

        {/* Match Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Match Type</Text>
          <View style={styles.typeSelector}>
            {(['friendly', 'league', 'knockout'] as const).map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.typeButton, matchType === type && styles.typeButtonActive]}
                onPress={() => setMatchType(type)}
              >
                <Text style={[styles.typeButtonText, matchType === type && styles.typeButtonTextActive]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Home Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Home Team</Text>
          <TextInput
            style={styles.input}
            placeholder="Home Team Name"
            placeholderTextColor={colors.text.secondary}
            value={homeTeamName}
            onChangeText={setHomeTeamName}
          />
          
          <Text style={styles.label}>Formation</Text>
          <View style={styles.formationSelector}>
            {FORMATIONS.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.formationButton, homeFormation === f && styles.formationButtonActive]}
                onPress={() => setHomeFormation(f)}
              >
                <Text style={styles.formationButtonText}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.playerControls}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                setEditingTeam('home');
                setShowPlayerModal(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add Player</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => generateQuickLineup('home')}
            >
              <Text style={styles.quickButtonText}>⚡ Quick Lineup</Text>
            </TouchableOpacity>
          </View>

          {homePlayers.length > 0 && (
            <View style={styles.playersList}>
              <Text style={styles.playersTitle}>
                Squad ({homePlayers.filter(p => p.isStarter).length}/11 starters)
              </Text>
              {homePlayers.map(player => (
                <View key={player.id} style={styles.playerCard}>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerNumber}>#{player.number}</Text>
                    <View>
                      <Text style={styles.playerName}>
                        {player.name} {player.isCaptain && '(C)'}
                      </Text>
                      <Text style={styles.playerPosition}>{player.position}</Text>
                    </View>
                  </View>
                  <View style={styles.playerActions}>
                    <TouchableOpacity onPress={() => toggleStarter(player.id, 'home')}>
                      <Text style={styles.actionButton}>
                        {player.isStarter ? '✓ Starting' : '+ Bench'}
                      </Text>
                    </TouchableOpacity>
                    {player.isStarter && (
                      <TouchableOpacity onPress={() => toggleCaptain(player.id, 'home')}>
                        <Text style={styles.actionButton}>
                          {player.isCaptain ? '★ Captain' : '☆ Captain'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => removePlayer(player.id, 'home')}>
                      <Text style={styles.removeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Away Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Away Team</Text>
          <TextInput
            style={styles.input}
            placeholder="Away Team Name"
            placeholderTextColor={colors.text.secondary}
            value={awayTeamName}
            onChangeText={setAwayTeamName}
          />
          
          <Text style={styles.label}>Formation</Text>
          <View style={styles.formationSelector}>
            {FORMATIONS.map(f => (
              <TouchableOpacity
                key={f}
                style={[styles.formationButton, awayFormation === f && styles.formationButtonActive]}
                onPress={() => setAwayFormation(f)}
              >
                <Text style={styles.formationButtonText}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.playerControls}>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                setEditingTeam('away');
                setShowPlayerModal(true);
              }}
            >
              <Text style={styles.addButtonText}>+ Add Player</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickButton}
              onPress={() => generateQuickLineup('away')}
            >
              <Text style={styles.quickButtonText}>⚡ Quick Lineup</Text>
            </TouchableOpacity>
          </View>

          {awayPlayers.length > 0 && (
            <View style={styles.playersList}>
              <Text style={styles.playersTitle}>
                Squad ({awayPlayers.filter(p => p.isStarter).length}/11 starters)
              </Text>
              {awayPlayers.map(player => (
                <View key={player.id} style={styles.playerCard}>
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerNumber}>#{player.number}</Text>
                    <View>
                      <Text style={styles.playerName}>
                        {player.name} {player.isCaptain && '(C)'}
                      </Text>
                      <Text style={styles.playerPosition}>{player.position}</Text>
                    </View>
                  </View>
                  <View style={styles.playerActions}>
                    <TouchableOpacity onPress={() => toggleStarter(player.id, 'away')}>
                      <Text style={styles.actionButton}>
                        {player.isStarter ? '✓ Starting' : '+ Bench'}
                      </Text>
                    </TouchableOpacity>
                    {player.isStarter && (
                      <TouchableOpacity onPress={() => toggleCaptain(player.id, 'away')}>
                        <Text style={styles.actionButton}>
                          {player.isCaptain ? '★ Captain' : '☆ Captain'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={() => removePlayer(player.id, 'away')}>
                      <Text style={styles.removeButton}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.startButton} onPress={startMatch}>
          <Text style={styles.startButtonText}>⚽ Start Match</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Player Modal */}
      <Modal visible={showPlayerModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Player</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Player Name"
              placeholderTextColor={colors.text.secondary}
              value={playerName}
              onChangeText={setPlayerName}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Jersey Number"
              placeholderTextColor={colors.text.secondary}
              value={playerNumber}
              onChangeText={setPlayerNumber}
              keyboardType="numeric"
            />
            
            <Text style={styles.label}>Position</Text>
            <View style={styles.positionSelector}>
              {POSITIONS.map(pos => (
                <TouchableOpacity
                  key={pos}
                  style={[styles.positionButton, playerPosition === pos && styles.positionButtonActive]}
                  onPress={() => setPlayerPosition(pos)}
                >
                  <Text style={styles.positionButtonText}>{pos}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowPlayerModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addPlayer}
              >
                <Text style={styles.confirmButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
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
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    padding: 20,
    paddingBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  formationSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  formationButton: {
    padding: 8,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formationButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  formationButtonText: {
    fontSize: 12,
    color: colors.text.primary,
  },
  playerControls: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  addButton: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  quickButton: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.success,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  playersList: {
    marginTop: 12,
  },
  playersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    width: 40,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  playerPosition: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  playerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  removeButton: {
    fontSize: 18,
    color: colors.error,
    fontWeight: 'bold',
  },
  startButton: {
    margin: 20,
    padding: 18,
    backgroundColor: colors.success,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  positionSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  positionButton: {
    flex: 1,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  positionButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  positionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
  confirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
});
