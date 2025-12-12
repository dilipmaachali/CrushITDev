import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Vibration,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';
import { api } from '@/services';

interface Player {
  id: string;
  name: string;
  teamId: 'team1' | 'team2';
}

interface GameScore {
  team1: number;
  team2: number;
  server: 'team1' | 'team2';
  receiver: 'team1' | 'team2';
  serverPosition: 'right' | 'left';
  isDeuce: boolean;
  settingPoint?: number; // 29 or 30
  winner?: 'team1' | 'team2';
  isTiebreak?: boolean; // For 29-29 situations
}

interface Match {
  id: string;
  gameId: string;
  matchType: 'singles' | 'doubles';
  bestOf: 3; // Always best of 3
  team1: {
    name: string;
    players: Player[];
  };
  team2: {
    name: string;
    players: Player[];
  };
  games: GameScore[];
  currentGame: number;
  gamesWon: {
    team1: number;
    team2: number;
  };
  firstServer: 'team1' | 'team2';
  status: 'setup' | 'ongoing' | 'completed';
  winner?: 'team1' | 'team2';
  createdAt: string;
  updatedAt: string;
  pointHistory: Array<{
    game: number;
    team1Score: number;
    team2Score: number;
    scoringTeam: 'team1' | 'team2';
    timestamp: string;
  }>;
}

/**
 * BWF OFFICIAL BADMINTON SCORING RULES IMPLEMENTATION
 * 
 * 🟢 RALLY POINT SYSTEM:
 * - Every rally wins a point (winner of rally scores, regardless of server)
 * - First to 21 points wins the game
 * - Must win by 2 points
 * 
 * 🟡 SETTING/GOLDEN POINT LOGIC:
 * - At 20-20 (deuce), play continues until one side gains 2-point lead
 * - Maximum extension: 30-29 (Golden Point)
 * - At 29-29, next point wins (Golden Point)
 * 
 * 🔵 DEUCE LOGIC:
 * - 20-20: Deuce starts, must win by 2
 * - 21-21, 22-22... 28-28: Continues with 2-point lead rule
 * - 29-29: Golden Point - next rally wins
 * 
 * 🟣 BEST-OF-3 GAMES:
 * - Match winner: First to win 2 games
 * - Each game: Rally to 21 points (win by 2)
 * - Third game (if needed): Full game to 21
 * 
 * 🔥 EXTENDED SETTING:
 * - No cap at 30 in traditional rules, but we implement 30-29 as max
 * - 29-29 = Golden Point (sudden death)
 * 
 * SERVICE RULES:
 * - Winner of rally serves next
 * - Server serves from right when score is even (0,2,4...)
 * - Server serves from left when score is odd (1,3,5...)
 * - In doubles: Partners take turns but service court determined by serving side's score
 */

export default function BadmintonScoringScreen({ route, navigation }: any) {
  const { gameId } = route.params;
  const [match, setMatch] = useState<Match | null>(null);
  const [showServiceChoice, setShowServiceChoice] = useState(true);
  const [showUndoConfirm, setShowUndoConfirm] = useState(false);
  const [showGameSummary, setShowGameSummary] = useState(false);

  useEffect(() => {
    loadMatch();
  }, []);

  const loadMatch = async () => {
    try {
      // Fetch from backend API
      const response = await api.get('/api/matches', { params: { sport: 'badminton' } });
      const matches = response.data;
      const existingMatch = matches.find((m: any) => m.matchData?.gameId === gameId);
      
      if (existingMatch) {
        setMatch(existingMatch.matchData);
        setShowMatchSetup(false);
      }
    } catch (error) {
      console.error('Error loading match:', error);
    }
  };

  const saveMatch = async (updatedMatch: any) => {
    try {
      // Save to backend API
      const matchPayload = {
        sport: 'badminton' as const,
        matchData: updatedMatch,
        status: updatedMatch.status === 'completed' ? 'completed' as const : 'in-progress' as const,
      };

      // Check if match exists
      const response = await api.get('/api/matches', { params: { sport: 'badminton' } });
      const existingMatch = response.data.find((m: any) => m.matchData?.id === updatedMatch.id);

      if (existingMatch) {
        await api.put(`/api/matches/${existingMatch.id}`, matchPayload);
      } else {
        await api.post('/api/matches', matchPayload);
      }

      setMatch(updatedMatch);
    } catch (error) {
      console.error('Error saving match:', error);
      Alert.alert('Error', 'Failed to save match data');
    }
  };

  const startMatch = (firstServer: 'team1' | 'team2') => {
    const newMatch: Match = {
      id: Date.now().toString(),
      gameId,
      matchType: 'singles', // Can be changed to doubles
      bestOf: 3,
      team1: {
        name: 'Team 1',
        players: [{ id: '1', name: 'Player 1', teamId: 'team1' }],
      },
      team2: {
        name: 'Team 2',
        players: [{ id: '2', name: 'Player 2', teamId: 'team2' }],
      },
      games: [
        {
          team1: 0,
          team2: 0,
          server: firstServer,
          receiver: firstServer === 'team1' ? 'team2' : 'team1',
          serverPosition: 'right', // Start from right (score 0 is even)
          isDeuce: false,
        },
      ],
      currentGame: 0,
      gamesWon: { team1: 0, team2: 0 },
      firstServer,
      status: 'ongoing',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pointHistory: [],
    };

    setMatch(newMatch);
    setShowServiceChoice(false);
    saveMatch(newMatch);
  };

  const scorePoint = (team: 'team1' | 'team2') => {
    if (!match || match.status !== 'ongoing') return;

    const currentGame = match.games[match.currentGame];
    let newTeam1Score = currentGame.team1;
    let newTeam2Score = currentGame.team2;

    // Award point to winning team (Rally Point System)
    if (team === 'team1') {
      newTeam1Score++;
    } else {
      newTeam2Score++;
    }

    // Check for deuce situation (20-20 or higher with equal scores)
    const isDeuce = (newTeam1Score >= 20 && newTeam2Score >= 20) && 
                    (newTeam1Score === newTeam2Score);

    // Check for Golden Point (29-29)
    const isGoldenPoint = newTeam1Score === 29 && newTeam2Score === 29;

    // Determine winner of the game
    let gameWinner: 'team1' | 'team2' | undefined;
    
    if (isGoldenPoint) {
      // Next point wins (30-29 or 29-30)
      if (newTeam1Score === 30 || newTeam2Score === 30) {
        gameWinner = newTeam1Score === 30 ? 'team1' : 'team2';
      }
    } else if (newTeam1Score >= 21 || newTeam2Score >= 21) {
      // Check if leading by 2 or reached 30
      const diff = Math.abs(newTeam1Score - newTeam2Score);
      if (diff >= 2 || newTeam1Score === 30 || newTeam2Score === 30) {
        gameWinner = newTeam1Score > newTeam2Score ? 'team1' : 'team2';
      }
    }

    // Winner of rally becomes server (Rally Point System)
    const newServer = team;
    const newReceiver = team === 'team1' ? 'team2' : 'team1';
    
    // Determine service position based on server's score
    const serverScore = team === 'team1' ? newTeam1Score : newTeam2Score;
    const newServerPosition: 'right' | 'left' = serverScore % 2 === 0 ? 'right' : 'left';

    // Update game
    const updatedGame: GameScore = {
      ...currentGame,
      team1: newTeam1Score,
      team2: newTeam2Score,
      server: newServer,
      receiver: newReceiver,
      serverPosition: newServerPosition,
      isDeuce: isDeuce || (currentGame.isDeuce && !gameWinner),
      isTiebreak: isGoldenPoint,
      winner: gameWinner,
      settingPoint: newTeam1Score === 29 || newTeam2Score === 29 ? 29 : undefined,
    };

    // Add to point history
    const pointHistoryEntry = {
      game: match.currentGame + 1,
      team1Score: newTeam1Score,
      team2Score: newTeam2Score,
      scoringTeam: team,
      timestamp: new Date().toISOString(),
    };

    let updatedMatch = {
      ...match,
      games: match.games.map((g, idx) => idx === match.currentGame ? updatedGame : g),
      pointHistory: [...match.pointHistory, pointHistoryEntry],
      updatedAt: new Date().toISOString(),
    };

    // If game is won, update games won
    if (gameWinner) {
      const newGamesWon = {
        ...match.gamesWon,
        [gameWinner]: match.gamesWon[gameWinner] + 1,
      };

      updatedMatch = {
        ...updatedMatch,
        gamesWon: newGamesWon,
      };

      // Check if match is won (best of 3)
      if (newGamesWon[gameWinner] === 2) {
        updatedMatch.status = 'completed';
        updatedMatch.winner = gameWinner;
        
        Vibration.vibrate([0, 200, 100, 200]);
        
        setTimeout(() => {
          Alert.alert(
            '🏆 Match Complete!',
            `${gameWinner === 'team1' ? match.team1.name : match.team2.name} wins ${newGamesWon[gameWinner]}-${newGamesWon[gameWinner === 'team1' ? 'team2' : 'team1']}`,
            [{ text: 'View Summary', onPress: () => setShowGameSummary(true) }]
          );
        }, 500);
      } else {
        // Start next game
        Vibration.vibrate(200);
        
        // In game 3, winner of game 2 serves first. In game 2, loser of game 1 serves first
        const nextServer = match.currentGame === 0 
          ? (gameWinner === 'team1' ? 'team2' : 'team1') // Game 2: Loser of game 1 serves
          : gameWinner; // Game 3: Winner of game 2 serves

        const nextGame: GameScore = {
          team1: 0,
          team2: 0,
          server: nextServer,
          receiver: nextServer === 'team1' ? 'team2' : 'team1',
          serverPosition: 'right',
          isDeuce: false,
        };

        updatedMatch.games.push(nextGame);
        updatedMatch.currentGame++;

        setTimeout(() => {
          Alert.alert(
            `Game ${match.currentGame + 1} Complete`,
            `${gameWinner === 'team1' ? match.team1.name : match.team2.name} wins Game ${match.currentGame + 1}\n\nScore: ${newTeam1Score}-${newTeam2Score}\nGames Won: ${newGamesWon.team1}-${newGamesWon.team2}`,
            [{ text: 'Start Next Game' }]
          );
        }, 500);
      }
    } else {
      // Vibrate on regular point
      Vibration.vibrate(50);
    }

    saveMatch(updatedMatch);
  };

  const undoLastPoint = () => {
    if (!match || match.pointHistory.length === 0) return;

    const lastPoint = match.pointHistory[match.pointHistory.length - 1];
    const currentGame = match.games[match.currentGame];

    // Can only undo points from current game
    if (lastPoint.game !== match.currentGame + 1) {
      Alert.alert('Cannot Undo', 'Cannot undo points from previous games');
      return;
    }

    const previousHistory = match.pointHistory.slice(0, -1);
    const previousPointInGame = previousHistory
      .filter(p => p.game === match.currentGame + 1)
      .pop();

    const prevTeam1Score = previousPointInGame?.team1Score || 0;
    const prevTeam2Score = previousPointInGame?.team2Score || 0;

    // Recalculate server based on who scored the point that's being undone
    const prevScorer = lastPoint.scoringTeam === 'team1' ? 'team2' : 'team1';
    const prevServerScore = prevScorer === 'team1' ? prevTeam1Score : prevTeam2Score;
    const prevServerPosition: 'right' | 'left' = prevServerScore % 2 === 0 ? 'right' : 'left';

    const isDeuce = (prevTeam1Score >= 20 && prevTeam2Score >= 20) && 
                    (prevTeam1Score === prevTeam2Score);

    const updatedGame: GameScore = {
      ...currentGame,
      team1: prevTeam1Score,
      team2: prevTeam2Score,
      server: prevScorer,
      receiver: prevScorer === 'team1' ? 'team2' : 'team1',
      serverPosition: prevServerPosition,
      isDeuce,
      winner: undefined,
      settingPoint: undefined,
      isTiebreak: false,
    };

    const updatedMatch = {
      ...match,
      games: match.games.map((g, idx) => idx === match.currentGame ? updatedGame : g),
      pointHistory: previousHistory,
      updatedAt: new Date().toISOString(),
    };

    saveMatch(updatedMatch);
    setShowUndoConfirm(false);
    Vibration.vibrate(100);
  };

  const getCurrentGame = () => {
    if (!match) return null;
    return match.games[match.currentGame];
  };

  const renderServiceChoice = () => (
    <Modal visible={showServiceChoice} animationType="fade" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Who Serves First?</Text>
          <Text style={styles.modalSubtitle}>Winner of toss decides</Text>

          <TouchableOpacity
            style={styles.serviceButton}
            onPress={() => startMatch('team1')}
          >
            <Text style={styles.serviceButtonText}>Team 1 Serves</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.serviceButton}
            onPress={() => startMatch('team2')}
          >
            <Text style={styles.serviceButtonText}>Team 2 Serves</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderScoreboard = () => {
    const currentGame = getCurrentGame();
    if (!match || !currentGame) return null;

    const team1Score = currentGame.team1;
    const team2Score = currentGame.team2;

    return (
      <View style={styles.scoreboard}>
        <View style={styles.gamesWonRow}>
          <Text style={styles.gamesWonText}>Games Won: {match.gamesWon.team1}</Text>
          <Text style={styles.gameNumber}>Game {match.currentGame + 1}</Text>
          <Text style={styles.gamesWonText}>Games Won: {match.gamesWon.team2}</Text>
        </View>

        <View style={styles.scoresRow}>
          <View style={[styles.teamScore, currentGame.server === 'team1' && styles.servingTeam]}>
            <Text style={styles.teamName}>{match.team1.name}</Text>
            <Text style={styles.score}>{team1Score}</Text>
            {currentGame.server === 'team1' && (
              <Text style={styles.serverIndicator}>●</Text>
            )}
          </View>

          <View style={[styles.teamScore, currentGame.server === 'team2' && styles.servingTeam]}>
            <Text style={styles.teamName}>{match.team2.name}</Text>
            <Text style={styles.score}>{team2Score}</Text>
            {currentGame.server === 'team2' && (
              <Text style={styles.serverIndicator}>●</Text>
            )}
          </View>
        </View>

        {/* Deuce/Golden Point Indicator */}
        {currentGame.isDeuce && (
          <View style={styles.statusBanner}>
            {currentGame.isTiebreak ? (
              <Text style={styles.statusText}>🔥 GOLDEN POINT - Next Point Wins!</Text>
            ) : (
              <Text style={styles.statusText}>⚡ DEUCE - Win by 2 Points</Text>
            )}
          </View>
        )}

        {/* Service Position Indicator */}
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceText}>
            Server Position: {currentGame.serverPosition.toUpperCase()} Court
          </Text>
        </View>

        {/* Game Scores */}
        <View style={styles.gameScores}>
          <Text style={styles.gameScoresTitle}>Match Score</Text>
          <View style={styles.gameScoresRow}>
            {match.games.map((game, idx) => (
              <View key={idx} style={styles.gameScoreCard}>
                <Text style={styles.gameScoreLabel}>Game {idx + 1}</Text>
                <View style={styles.gameScoreValues}>
                  <Text style={[styles.gameScoreValue, game.winner === 'team1' && styles.winnerScore]}>
                    {game.team1}
                  </Text>
                  <Text style={styles.gameScoreSeparator}>-</Text>
                  <Text style={[styles.gameScoreValue, game.winner === 'team2' && styles.winnerScore]}>
                    {game.team2}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderScoringButtons = () => {
    if (!match || match.status !== 'ongoing') return null;

    return (
      <View style={styles.scoringPanel}>
        <Text style={styles.panelTitle}>Score Point (Rally System)</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.scoreButton, styles.team1Button]}
            onPress={() => scorePoint('team1')}
          >
            <Text style={styles.scoreButtonText}>{match.team1.name}</Text>
            <Text style={styles.scoreButtonSubtext}>Wins Rally</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.scoreButton, styles.team2Button]}
            onPress={() => scorePoint('team2')}
          >
            <Text style={styles.scoreButtonText}>{match.team2.name}</Text>
            <Text style={styles.scoreButtonSubtext}>Wins Rally</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.undoButton}
          onPress={() => setShowUndoConfirm(true)}
          disabled={match.pointHistory.length === 0}
        >
          <Text style={styles.undoButtonText}>↶ Undo Last Point</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (!match || showServiceChoice) {
    return renderServiceChoice();
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderScoreboard()}
        {renderScoringButtons()}

        {/* Rules Reference */}
        <View style={styles.rulesCard}>
          <Text style={styles.rulesTitle}>BWF Official Rules</Text>
          <Text style={styles.rulesText}>• Rally to 21 points (win by 2)</Text>
          <Text style={styles.rulesText}>• 20-20: Deuce - must win by 2</Text>
          <Text style={styles.rulesText}>• 29-29: Golden Point - next rally wins</Text>
          <Text style={styles.rulesText}>• Best of 3 games</Text>
          <Text style={styles.rulesText}>• Winner of rally scores & serves next</Text>
        </View>
      </ScrollView>

      {/* Undo Confirmation Modal */}
      <Modal visible={showUndoConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Undo Last Point?</Text>
            <Text style={styles.modalSubtitle}>This cannot be reversed</Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowUndoConfirm(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={undoLastPoint}
              >
                <Text style={styles.confirmButtonText}>Undo</Text>
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
  scoreboard: {
    backgroundColor: colors.primary,
    padding: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  gamesWonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  gamesWonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  gameNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  scoresRow: {
    flexDirection: 'row',
    gap: 16,
  },
  teamScore: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  servingTeam: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 2,
    borderColor: colors.white,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
  },
  score: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
  },
  serverIndicator: {
    fontSize: 20,
    color: colors.white,
    marginTop: 4,
  },
  statusBanner: {
    backgroundColor: colors.warning,
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
  },
  serviceInfo: {
    marginTop: 12,
    alignItems: 'center',
  },
  serviceText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  gameScores: {
    marginTop: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 12,
    borderRadius: 8,
  },
  gameScoresTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
  },
  gameScoresRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gameScoreCard: {
    flex: 1,
    alignItems: 'center',
  },
  gameScoreLabel: {
    fontSize: 10,
    color: colors.white,
    marginBottom: 4,
  },
  gameScoreValues: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  gameScoreValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  winnerScore: {
    color: colors.success,
  },
  gameScoreSeparator: {
    fontSize: 14,
    color: colors.white,
    marginHorizontal: 4,
  },
  scoringPanel: {
    padding: 20,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  scoreButton: {
    flex: 1,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  team1Button: {
    backgroundColor: colors.primary,
  },
  team2Button: {
    backgroundColor: colors.secondary,
  },
  scoreButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  scoreButtonSubtext: {
    fontSize: 12,
    color: colors.white,
  },
  undoButton: {
    backgroundColor: colors.text.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  undoButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  rulesCard: {
    backgroundColor: colors.surface,
    padding: 16,
    margin: 20,
    borderRadius: 12,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  rulesText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  serviceButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  confirmButton: {
    backgroundColor: colors.error,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
