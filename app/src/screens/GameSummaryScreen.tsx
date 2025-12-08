import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { colors } from '@/theme';

export default function GameSummaryScreen({ route, navigation }: any) {
  const { game } = route.params;
  const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  const totalScore = sortedPlayers.reduce((sum, p) => sum + p.score, 0);

  const shareResults = async () => {
    const resultsText = `🎯 ${game.name} - Results\n\n` +
      `Sport: ${game.sport}\n` +
      `Type: ${game.type === 'tournament' ? '🏆 Tournament' : '⚡ Practice'}\n` +
      `Completed: ${new Date(game.completedAt).toLocaleDateString()}\n\n` +
      `🏆 LEADERBOARD:\n` +
      sortedPlayers.map((p, i) => 
        `${i + 1}. ${p.name}: ${p.score} ${i === 0 ? '👑' : ''}`
      ).join('\n') +
      `\n\nShared from CrushIT App`;

    try {
      await Share.share({
        message: resultsText,
        title: `${game.name} Results`,
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share results');
    }
  };

  const getMedalEmoji = (position: number) => {
    switch (position) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Winner Card */}
        <View style={styles.winnerCard} accessible={true} accessibilityRole="header">
          <Text style={styles.winnerBadge}>🏆</Text>
          <Text style={styles.winnerTitle}>Winner!</Text>
          <Text style={styles.winnerName}>{winner.name}</Text>
          <Text style={styles.winnerScore}>{winner.score} points</Text>
        </View>

        {/* Game Info */}
        <View style={styles.infoCard}>
          <Text style={styles.sectionTitle} accessibilityRole="header">Game Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Name:</Text>
            <Text style={styles.infoValue}>{game.name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sport:</Text>
            <Text style={styles.infoValue}>{game.sport}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>
              {game.type === 'tournament' ? '🏆 Tournament' : '⚡ Practice'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Completed:</Text>
            <Text style={styles.infoValue}>
              {new Date(game.completedAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total Score:</Text>
            <Text style={styles.infoValue}>{totalScore} points</Text>
          </View>
        </View>

        {/* Leaderboard */}
        {game.type === 'tournament' && (
          <View style={styles.leaderboardCard}>
            <Text style={styles.sectionTitle} accessibilityRole="header">
              🏆 Tournament Leaderboard
            </Text>
            <View style={styles.leaderboard}>
              {sortedPlayers.map((player, index) => (
                <View
                  key={player.id}
                  style={[
                    styles.leaderboardRow,
                    index === 0 && styles.firstPlace,
                    index === 1 && styles.secondPlace,
                    index === 2 && styles.thirdPlace,
                  ]}
                  accessible={true}
                  accessibilityRole="summary"
                  accessibilityLabel={`Position ${index + 1}: ${player.name} with ${player.score} points`}
                >
                  <View style={styles.leaderboardLeft}>
                    <View style={[
                      styles.positionBadge,
                      index === 0 && styles.firstBadge,
                      index === 1 && styles.secondBadge,
                      index === 2 && styles.thirdBadge,
                    ]}>
                      <Text style={[
                        styles.positionText,
                        index <= 2 && styles.medalText,
                      ]}>
                        {index <= 2 ? getMedalEmoji(index) : `#${index + 1}`}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.leaderboardName}>{player.name}</Text>
                      {index === 0 && (
                        <Text style={styles.championText}>Champion</Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.leaderboardRight}>
                    <Text style={styles.leaderboardScore}>{player.score}</Text>
                    <Text style={styles.leaderboardPoints}>pts</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* All Players (Practice mode) */}
        {game.type === 'practice' && (
          <View style={styles.playersCard}>
            <Text style={styles.sectionTitle} accessibilityRole="header">Final Scores</Text>
            {sortedPlayers.map((player, index) => (
              <View
                key={player.id}
                style={styles.playerRow}
                accessible={true}
                accessibilityLabel={`${player.name}: ${player.score} points`}
              >
                <View style={styles.playerLeft}>
                  <Text style={styles.playerRank}>#{index + 1}</Text>
                  <Text style={styles.playerName}>{player.name}</Text>
                </View>
                <Text style={styles.playerScore}>{player.score}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={shareResults}
            accessibilityRole="button"
            accessibilityLabel="Share game results with all players"
            accessibilityHint="Opens share menu to send results via messaging apps"
          >
            <Text style={styles.shareButtonText}>📤 Share Results</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => navigation.navigate('Scoring')}
            accessibilityRole="button"
            accessibilityLabel="Return to scoring home"
          >
            <Text style={styles.doneButtonText}>Done</Text>
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
  content: {
    flex: 1,
  },
  winnerCard: {
    backgroundColor: colors.primary,
    padding: 32,
    alignItems: 'center',
    marginBottom: 16,
  },
  winnerBadge: {
    fontSize: 72,
    marginBottom: 8,
  },
  winnerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
    opacity: 0.9,
    marginBottom: 8,
  },
  winnerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  winnerScore: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    opacity: 0.9,
  },
  infoCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: 15,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '600',
  },
  leaderboardCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leaderboard: {
    gap: 10,
  },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
    minHeight: 72,
  },
  firstPlace: {
    borderColor: '#FFD700',
    backgroundColor: '#FFF9E6',
  },
  secondPlace: {
    borderColor: '#C0C0C0',
    backgroundColor: '#F5F5F5',
  },
  thirdPlace: {
    borderColor: '#CD7F32',
    backgroundColor: '#FFF4E6',
  },
  leaderboardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  positionBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  firstBadge: {
    backgroundColor: '#FFD700',
  },
  secondBadge: {
    backgroundColor: '#C0C0C0',
  },
  thirdBadge: {
    backgroundColor: '#CD7F32',
  },
  positionText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
  },
  medalText: {
    fontSize: 24,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  championText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
    marginTop: 2,
  },
  leaderboardRight: {
    alignItems: 'flex-end',
  },
  leaderboardScore: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  leaderboardPoints: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  playersCard: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  playerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playerRank: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    width: 32,
  },
  playerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  playerScore: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  actions: {
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  shareButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  doneButton: {
    backgroundColor: colors.white,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
    minHeight: 52,
    justifyContent: 'center',
  },
  doneButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
});
