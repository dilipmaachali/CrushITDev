import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';

interface Player {
  id: string;
  name: string;
  score: number;
}

export default function ScoreEntryScreen({ route, navigation }: any) {
  const { game } = route.params;
  const [players, setPlayers] = useState(game.players);

  const updateScore = (playerId: string, delta: number) => {
    setPlayers(players.map((p: Player) =>
      p.id === playerId ? { ...p, score: Math.max(0, p.score + delta) } : p
    ));
  };

  const setScore = (playerId: string, score: string) => {
    const numScore = parseInt(score) || 0;
    setPlayers(players.map((p: Player) =>
      p.id === playerId ? { ...p, score: Math.max(0, numScore) } : p
    ));
  };

  const saveGame = async () => {
    try {
      const savedGames = await AsyncStorage.getItem('scoringGames');
      const games = savedGames ? JSON.parse(savedGames) : [];
      const updatedGames = games.map((g: any) =>
        g.id === game.id ? { ...g, players } : g
      );
      await AsyncStorage.setItem('scoringGames', JSON.stringify(updatedGames));
      Alert.alert('Saved', 'Scores updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save scores');
    }
  };

  const completeGame = async () => {
    Alert.alert(
      'Complete Game',
      'Mark this game as completed? You can share results with all players.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              const savedGames = await AsyncStorage.getItem('scoringGames');
              const games = savedGames ? JSON.parse(savedGames) : [];
              const updatedGames = games.map((g: any) =>
                g.id === game.id
                  ? {
                      ...g,
                      players,
                      status: 'completed',
                      completedAt: new Date().toISOString(),
                    }
                  : g
              );
              await AsyncStorage.setItem('scoringGames', JSON.stringify(updatedGames));
              
              navigation.replace('GameSummary', {
                game: { ...game, players, status: 'completed', completedAt: new Date().toISOString() },
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to complete game');
            }
          },
        },
      ]
    );
  };

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{game.name}</Text>
          <Text style={styles.subtitle}>
            {game.sport} • {game.type === 'tournament' ? '🏆 Tournament' : '⚡ Practice'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.scoresContainer}>
          {sortedPlayers.map((player, index) => (
            <View
              key={player.id}
              style={styles.playerRow}
              accessible={true}
              accessibilityRole="summary"
              accessibilityLabel={`${player.name}, position ${index + 1}, score ${player.score}`}
            >
              <View style={styles.playerInfo}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>#{index + 1}</Text>
                </View>
                <View>
                  <Text style={styles.playerName}>{player.name}</Text>
                  {index === 0 && sortedPlayers.length > 1 && player.score > sortedPlayers[1].score && (
                    <Text style={styles.leadingText}>Leading!</Text>
                  )}
                </View>
              </View>

              <View style={styles.scoreControls}>
                <TouchableOpacity
                  style={styles.scoreButton}
                  onPress={() => updateScore(player.id, -1)}
                  accessibilityRole="button"
                  accessibilityLabel={`Decrease score for ${player.name}`}
                  accessibilityHint="Removes 1 point"
                >
                  <Text style={styles.scoreButtonText}>−</Text>
                </TouchableOpacity>

                <TextInput
                  style={styles.scoreInput}
                  value={player.score.toString()}
                  onChangeText={(text) => setScore(player.id, text)}
                  keyboardType="number-pad"
                  accessibilityLabel={`Score for ${player.name}`}
                  accessibilityHint="Tap to edit score directly"
                />

                <TouchableOpacity
                  style={styles.scoreButton}
                  onPress={() => updateScore(player.id, 1)}
                  accessibilityRole="button"
                  accessibilityLabel={`Increase score for ${player.name}`}
                  accessibilityHint="Adds 1 point"
                >
                  <Text style={styles.scoreButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.saveButton}
            onPress={saveGame}
            accessibilityRole="button"
            accessibilityLabel="Save current scores"
          >
            <Text style={styles.saveButtonText}>💾 Save Scores</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.completeButton}
            onPress={completeGame}
            accessibilityRole="button"
            accessibilityLabel="Complete game and view summary"
          >
            <Text style={styles.completeButtonText}>✓ Complete Game</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  content: {
    flex: 1,
  },
  scoresContainer: {
    padding: 16,
  },
  playerRow: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 80,
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  leadingText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 2,
  },
  scoreControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scoreButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary,
  },
  scoreInput: {
    width: 60,
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  actionButtons: {
    padding: 16,
    gap: 12,
  },
  saveButton: {
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    minHeight: 52,
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  completeButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
});
