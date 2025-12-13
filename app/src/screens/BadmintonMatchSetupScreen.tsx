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
import { colors } from '@/theme';
import { api } from '@/services';

export default function BadmintonMatchSetupScreen({ route, navigation }: any) {
  const { gameId, matchName, matchType: initialMatchType } = route.params || {};
  
  const [matchType, setMatchType] = useState<'singles' | 'doubles'>('singles');
  const [bestOf, setBestOf] = useState<1 | 3>(1);
  const [team1Name, setTeam1Name] = useState('Team 1');
  const [team2Name, setTeam2Name] = useState('Team 2');
  const [team1Players, setTeam1Players] = useState<string[]>(['']);
  const [team2Players, setTeam2Players] = useState<string[]>(['']);

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ paddingLeft: 16 }}>
          <Text style={{ fontSize: 18, color: colors.primary }}>←</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const updateMatchType = (type: 'singles' | 'doubles') => {
    setMatchType(type);
    if (type === 'singles') {
      setTeam1Players(['']);
      setTeam2Players(['']);
    } else {
      setTeam1Players(['', '']);
      setTeam2Players(['', '']);
    }
  };

  const updatePlayer = (team: 'team1' | 'team2', index: number, name: string) => {
    if (team === 'team1') {
      const newPlayers = [...team1Players];
      newPlayers[index] = name;
      setTeam1Players(newPlayers);
    } else {
      const newPlayers = [...team2Players];
      newPlayers[index] = name;
      setTeam2Players(newPlayers);
    }
  };

  const validateAndStart = async () => {
    // Validate team names
    if (!team1Name.trim() || !team2Name.trim()) {
      Alert.alert('Error', 'Please enter both team names');
      return;
    }

    // Validate player names
    const requiredPlayers = matchType === 'singles' ? 1 : 2;
    const team1Valid = team1Players.slice(0, requiredPlayers).every(p => p.trim());
    const team2Valid = team2Players.slice(0, requiredPlayers).every(p => p.trim());

    if (!team1Valid || !team2Valid) {
      Alert.alert(
        'Error',
        `Please enter ${requiredPlayers} player name${requiredPlayers > 1 ? 's' : ''} for each team`
      );
      return;
    }

    try {
      // Prepare player lists
      const team1PlayersList = team1Players.slice(0, requiredPlayers).map((name, idx) => ({
        id: `${team1Name}-p${idx + 1}`,
        name,
        teamId: 'team1',
        score: 0,
      }));
      
      const team2PlayersList = team2Players.slice(0, requiredPlayers).map((name, idx) => ({
        id: `${team2Name}-p${idx + 1}`,
        name,
        teamId: 'team2',
        score: 0,
      }));

      // Save match to API
      const matchData = {
        name: matchName || `${team1Name} vs ${team2Name}`,
        type: initialMatchType || 'practice',
        matchType,
        bestOf,
        players: [...team1PlayersList, ...team2PlayersList],
        team1: {
          name: team1Name,
          players: team1PlayersList,
        },
        team2: {
          name: team2Name,
          players: team2PlayersList,
        },
      };

      const response = await api.post('/api/matches', {
        sport: 'badminton',
        matchData,
        status: 'in-progress',
      });

      // Navigate to scoring screen with the created match ID
      navigation.replace('BadmintonScoring', {
        gameId: response.data.id,
        matchType,
        bestOf,
        team1: matchData.team1,
        team2: matchData.team2,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to create match');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Match Setup</Text>
        <Text style={styles.subtitle}>Configure your badminton match</Text>

        {/* Match Type Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Match Type</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                matchType === 'singles' && styles.typeButtonActive,
              ]}
              onPress={() => updateMatchType('singles')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  matchType === 'singles' && styles.typeButtonTextActive,
                ]}
              >
                Singles
              </Text>
              <Text style={styles.typeButtonSubtext}>1 vs 1</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                matchType === 'doubles' && styles.typeButtonActive,
              ]}
              onPress={() => updateMatchType('doubles')}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  matchType === 'doubles' && styles.typeButtonTextActive,
                ]}
              >
                Doubles
              </Text>
              <Text style={styles.typeButtonSubtext}>2 vs 2</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Match Format Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Match Format</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[
                styles.typeButton,
                bestOf === 1 && styles.typeButtonActive,
              ]}
              onPress={() => setBestOf(1)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  bestOf === 1 && styles.typeButtonTextActive,
                ]}
              >
                Best of 1
              </Text>
              <Text style={styles.typeButtonSubtext}>Single Game</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.typeButton,
                bestOf === 3 && styles.typeButtonActive,
              ]}
              onPress={() => setBestOf(3)}
            >
              <Text
                style={[
                  styles.typeButtonText,
                  bestOf === 3 && styles.typeButtonTextActive,
                ]}
              >
                Best of 3
              </Text>
              <Text style={styles.typeButtonSubtext}>Up to 3 Games</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Team 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team 1</Text>
          <TextInput
            style={styles.input}
            placeholder="Team Name"
            placeholderTextColor={colors.text.secondary}
            value={team1Name}
            onChangeText={setTeam1Name}
          />
          {team1Players.map((player, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={`Player ${index + 1} Name`}
              placeholderTextColor={colors.text.secondary}
              value={player}
              onChangeText={(text) => updatePlayer('team1', index, text)}
            />
          ))}
        </View>

        {/* Team 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team 2</Text>
          <TextInput
            style={styles.input}
            placeholder="Team Name"
            placeholderTextColor={colors.text.secondary}
            value={team2Name}
            onChangeText={setTeam2Name}
          />
          {team2Players.map((player, index) => (
            <TextInput
              key={index}
              style={styles.input}
              placeholder={`Player ${index + 1} Name`}
              placeholderTextColor={colors.text.secondary}
              value={player}
              onChangeText={(text) => updatePlayer('team2', index, text)}
            />
          ))}
        </View>

        {/* Match Format Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📋 Match Format</Text>
          <Text style={styles.infoText}>• Best of 3 games</Text>
          <Text style={styles.infoText}>• Rally to 21 points (win by 2)</Text>
          <Text style={styles.infoText}>• 20-20: Play until 2-point lead</Text>
          <Text style={styles.infoText}>• 29-29: Golden Point (sudden death)</Text>
          <Text style={styles.infoText}>• Winner of rally scores & serves</Text>
        </View>

        <TouchableOpacity style={styles.startButton} onPress={validateAndStart}>
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
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  typeButtonSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
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
  infoCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  startButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
  },
});
