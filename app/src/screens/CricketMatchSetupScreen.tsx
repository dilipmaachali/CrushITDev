import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';
import { api } from '@/services';

interface Player {
  id: string;
  name: string;
  role: 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper';
}

export default function CricketMatchSetupScreen({ route, navigation }: any) {
  const { gameId, matchName, matchType: initialMatchType } = route.params || {};
  
  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 16 }}>
          <Text style={{ fontSize: 18, color: colors.primary }}>←</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  
  const [team1Name, setTeam1Name] = useState('');
  const [team2Name, setTeam2Name] = useState('');
  const [matchType, setMatchType] = useState<'T20' | 'T10' | 'ODI'>('T20');
  const [overs, setOvers] = useState('20');
  const [tossWinner, setTossWinner] = useState<'team1' | 'team2'>('team1');
  const [tossDecision, setTossDecision] = useState<'bat' | 'bowl'>('bat');
  
  const [team1Players, setTeam1Players] = useState<Player[]>([]);
  const [team2Players, setTeam2Players] = useState<Player[]>([]);
  
  const [playerName, setPlayerName] = useState('');
  const [playerRole, setPlayerRole] = useState<'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper'>('batsman');
  const [addingToTeam, setAddingToTeam] = useState<'team1' | 'team2'>('team1');

  const addPlayer = () => {
    if (!playerName.trim()) {
      Alert.alert('Error', 'Please enter player name');
      return;
    }

    const newPlayer: Player = {
      id: Date.now().toString(),
      name: playerName.trim(),
      role: playerRole,
    };

    if (addingToTeam === 'team1') {
      if (team1Players.length >= 11) {
        Alert.alert('Error', 'Team 1 is full (11 players max)');
        return;
      }
      setTeam1Players([...team1Players, newPlayer]);
    } else {
      if (team2Players.length >= 11) {
        Alert.alert('Error', 'Team 2 is full (11 players max)');
        return;
      }
      setTeam2Players([...team2Players, newPlayer]);
    }

    setPlayerName('');
  };

  const removePlayer = (teamId: 'team1' | 'team2', playerId: string) => {
    if (teamId === 'team1') {
      setTeam1Players(team1Players.filter(p => p.id !== playerId));
    } else {
      setTeam2Players(team2Players.filter(p => p.id !== playerId));
    }
  };

  const startMatch = async () => {
    if (!team1Name || !team2Name) {
      Alert.alert('Error', 'Please enter both team names');
      return;
    }

    if (team1Players.length < 2 || team2Players.length < 2) {
      Alert.alert('Error', 'Each team needs at least 2 players');
      return;
    }

    const battingTeam = tossWinner === 'team1' 
      ? (tossDecision === 'bat' ? team1Name : team2Name)
      : (tossDecision === 'bat' ? team2Name : team1Name);
    
    const bowlingTeam = battingTeam === team1Name ? team2Name : team1Name;

    const match = {
      id: Date.now().toString(),
      gameId,
      team1: { name: team1Name, players: team1Players },
      team2: { name: team2Name, players: team2Players },
      tossWinner: tossWinner === 'team1' ? team1Name : team2Name,
      tossDecision,
      overs: parseInt(overs),
      matchType,
      innings: [{
        battingTeam,
        bowlingTeam,
        score: 0,
        wickets: 0,
        overs: 0,
        balls: [],
        batsmen: [],
        bowlers: [],
        extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0, penalties: 0 },
      }],
      currentInnings: 0,
      status: 'ongoing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Combine all players for the players array
      const allPlayers = [
        ...team1Players.map(p => ({ ...p, score: 0 })),
        ...team2Players.map(p => ({ ...p, score: 0 }))
      ];

      // Save to API
      const matchData = {
        name: matchName || `${team1Name} vs ${team2Name}`,
        type: initialMatchType || 'practice',
        players: allPlayers,
        team1: { name: team1Name, players: team1Players },
        team2: { name: team2Name, players: team2Players },
        tossWinner: tossWinner === 'team1' ? team1Name : team2Name,
        tossDecision,
        overs: parseInt(overs),
        matchType,
      };

      const response = await api.post('/api/matches', {
        sport: 'cricket',
        matchData,
        status: 'in-progress',
      });

      // Also save to AsyncStorage for backward compatibility
      const matchesJson = await AsyncStorage.getItem('cricketMatches');
      const matches = matchesJson ? JSON.parse(matchesJson) : [];
      matches.push(match);
      await AsyncStorage.setItem('cricketMatches', JSON.stringify(matches));

      navigation.replace('CricketScoring', { gameId: response.data.id });
    } catch (error) {
      console.error('Error starting match:', error);
      Alert.alert('Error', 'Failed to start match');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.sectionTitle}>Match Details</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Team 1 Name</Text>
          <TextInput
            style={styles.input}
            value={team1Name}
            onChangeText={setTeam1Name}
            placeholder="Enter team 1 name"
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Team 2 Name</Text>
          <TextInput
            style={styles.input}
            value={team2Name}
            onChangeText={setTeam2Name}
            placeholder="Enter team 2 name"
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Match Type</Text>
          <View style={styles.buttonGroup}>
            {['T10', 'T20', 'ODI'].map(type => (
              <TouchableOpacity
                key={type}
                style={[styles.typeButton, matchType === type && styles.typeButtonActive]}
                onPress={() => {
                  setMatchType(type as any);
                  if (type === 'T10') setOvers('10');
                  else if (type === 'T20') setOvers('20');
                  else setOvers('50');
                }}
              >
                <Text style={[styles.typeButtonText, matchType === type && styles.typeButtonTextActive]}>
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Overs</Text>
          <TextInput
            style={styles.input}
            value={overs}
            onChangeText={setOvers}
            keyboardType="numeric"
            placeholder="Enter overs"
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        <Text style={styles.sectionTitle}>Toss</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Toss Winner</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.typeButton, tossWinner === 'team1' && styles.typeButtonActive]}
              onPress={() => setTossWinner('team1')}
            >
              <Text style={[styles.typeButtonText, tossWinner === 'team1' && styles.typeButtonTextActive]}>
                Team 1
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, tossWinner === 'team2' && styles.typeButtonActive]}
              onPress={() => setTossWinner('team2')}
            >
              <Text style={[styles.typeButtonText, tossWinner === 'team2' && styles.typeButtonTextActive]}>
                Team 2
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Elected to</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.typeButton, tossDecision === 'bat' && styles.typeButtonActive]}
              onPress={() => setTossDecision('bat')}
            >
              <Text style={[styles.typeButtonText, tossDecision === 'bat' && styles.typeButtonTextActive]}>
                Bat
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, tossDecision === 'bowl' && styles.typeButtonActive]}
              onPress={() => setTossDecision('bowl')}
            >
              <Text style={[styles.typeButtonText, tossDecision === 'bowl' && styles.typeButtonTextActive]}>
                Bowl
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Add Players</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Adding to</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.typeButton, addingToTeam === 'team1' && styles.typeButtonActive]}
              onPress={() => setAddingToTeam('team1')}
            >
              <Text style={[styles.typeButtonText, addingToTeam === 'team1' && styles.typeButtonTextActive]}>
                {team1Name || 'Team 1'} ({team1Players.length}/11)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, addingToTeam === 'team2' && styles.typeButtonActive]}
              onPress={() => setAddingToTeam('team2')}
            >
              <Text style={[styles.typeButtonText, addingToTeam === 'team2' && styles.typeButtonTextActive]}>
                {team2Name || 'Team 2'} ({team2Players.length}/11)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Player Name</Text>
          <TextInput
            style={styles.input}
            value={playerName}
            onChangeText={setPlayerName}
            placeholder="Enter player name"
            placeholderTextColor={colors.text.secondary}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Role</Text>
          <View style={styles.buttonGroup}>
            {['batsman', 'bowler', 'allrounder', 'wicketkeeper'].map(role => (
              <TouchableOpacity
                key={role}
                style={[styles.roleButton, playerRole === role && styles.typeButtonActive]}
                onPress={() => setPlayerRole(role as any)}
              >
                <Text style={[styles.roleButtonText, playerRole === role && styles.typeButtonTextActive]}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={addPlayer}>
          <Text style={styles.addButtonText}>+ Add Player</Text>
        </TouchableOpacity>

        {/* Team 1 Players */}
        {team1Players.length > 0 && (
          <>
            <Text style={styles.teamTitle}>{team1Name || 'Team 1'} Squad</Text>
            {team1Players.map(player => (
              <View key={player.id} style={styles.playerCard}>
                <View>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerRole}>{player.role}</Text>
                </View>
                <TouchableOpacity onPress={() => removePlayer('team1', player.id)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        {/* Team 2 Players */}
        {team2Players.length > 0 && (
          <>
            <Text style={styles.teamTitle}>{team2Name || 'Team 2'} Squad</Text>
            {team2Players.map(player => (
              <View key={player.id} style={styles.playerCard}>
                <View>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerRole}>{player.role}</Text>
                </View>
                <TouchableOpacity onPress={() => removePlayer('team2', player.id)}>
                  <Text style={styles.removeButton}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </>
        )}

        <TouchableOpacity style={styles.startButton} onPress={startMatch}>
          <Text style={styles.startButtonText}>Start Match</Text>
        </TouchableOpacity>
      </ScrollView>
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
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 24,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
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
  roleButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  },
  roleButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    textTransform: 'capitalize',
  },
  addButton: {
    backgroundColor: colors.success,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginTop: 24,
    marginBottom: 12,
  },
  playerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  playerRole: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  removeButton: {
    fontSize: 20,
    color: colors.error,
    fontWeight: 'bold',
  },
  startButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 32,
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
});
