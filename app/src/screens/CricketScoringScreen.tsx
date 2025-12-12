import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
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

interface Ball {
  ballNumber: number;
  over: number;
  runs: number;
  extras: {
    type: 'wide' | 'noball' | 'bye' | 'legbye' | null;
    runs: number;
  };
  wicket: {
    isWicket: boolean;
    type?: 'bowled' | 'caught' | 'lbw' | 'runout' | 'stumped' | 'hitwicket';
    fielder?: string;
  };
  striker: string;
  nonStriker: string;
  bowler: string;
  timestamp: string;
}

interface BatsmanStats {
  playerId: string;
  playerName: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  isOut: boolean;
  dismissalType?: string;
  dismissalBowler?: string;
}

interface BowlerStats {
  playerId: string;
  playerName: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  dots: number;
}

interface Innings {
  battingTeam: string;
  bowlingTeam: string;
  score: number;
  wickets: number;
  overs: number;
  balls: Ball[];
  batsmen: BatsmanStats[];
  bowlers: BowlerStats[];
  extras: {
    wides: number;
    noballs: number;
    byes: number;
    legbyes: number;
    penalties: number;
  };
  target?: number;
}

interface Match {
  id: string;
  gameId: string;
  team1: { name: string; players: Player[] };
  team2: { name: string; players: Player[] };
  tossWinner: string;
  tossDecision: 'bat' | 'bowl';
  overs: number;
  matchType: 'T20' | 'T10' | 'ODI' | 'Test';
  innings: Innings[];
  currentInnings: number;
  status: 'notstarted' | 'ongoing' | 'completed';
  result?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CricketScoringScreen({ route, navigation }: any) {
  const { gameId } = route.params;
  const [match, setMatch] = useState<Match | null>(null);
  const [currentStriker, setCurrentStriker] = useState<string>('');
  const [currentNonStriker, setCurrentNonStriker] = useState<string>('');
  const [currentBowler, setCurrentBowler] = useState<string>('');
  
  const [showBatsmanSelector, setShowBatsmanSelector] = useState(false);
  const [showBowlerSelector, setShowBowlerSelector] = useState(false);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [showExtrasModal, setShowExtrasModal] = useState(false);
  const [showMatchSetup, setShowMatchSetup] = useState(true);
  
  const [pendingRuns, setPendingRuns] = useState(0);

  useEffect(() => {
    loadMatch();
  }, []);

  const loadMatch = async () => {
    try {
      // Fetch from backend API
      const response = await api.get('/api/matches', { params: { sport: 'cricket' } });
      const matches = response.data;
      const existingMatch = matches.find((m: Match) => m.matchData?.gameId === gameId);
      
      if (existingMatch) {
        setMatch(existingMatch.matchData);
        setShowMatchSetup(false);
      }
    } catch (error) {
      console.error('Error loading match:', error);
    }
  };

  const saveMatch = async (updatedMatch: Match) => {
    try {
      // Save to backend API
      const matchPayload = {
        sport: 'cricket' as const,
        matchData: updatedMatch,
        status: updatedMatch.status === 'completed' ? 'completed' as const : 'in-progress' as const,
      };

      // Check if match exists
      const response = await api.get('/api/matches', { params: { sport: 'cricket' } });
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

  const recordBall = (runs: number, isExtra: boolean = false, extraType?: string) => {
    if (!match || !currentStriker || !currentBowler) {
      Alert.alert('Error', 'Please select batsmen and bowler');
      return;
    }

    const currentInningsData = match.innings[match.currentInnings];
    const ballNumber = currentInningsData.balls.length + 1;
    const currentOver = Math.floor(currentInningsData.balls.length / 6);

    const newBall: Ball = {
      ballNumber,
      over: currentOver,
      runs,
      extras: {
        type: extraType as any,
        runs: isExtra ? runs : 0,
      },
      wicket: {
        isWicket: false,
      },
      striker: currentStriker,
      nonStriker: currentNonStriker,
      bowler: currentBowler,
      timestamp: new Date().toISOString(),
    };

    // Update score
    let newScore = currentInningsData.score + runs;
    let newBalls = [...currentInningsData.balls, newBall];
    
    // Update batsman stats
    const batsmanStats = updateBatsmanStats(currentInningsData.batsmen, currentStriker, runs, !isExtra);
    
    // Update bowler stats
    const bowlerStats = updateBowlerStats(currentInningsData.bowlers, currentBowler, runs, false, runs === 0 && !isExtra);
    
    // Update extras
    const extras = { ...currentInningsData.extras };
    if (isExtra) {
      if (extraType === 'wide') extras.wides += runs;
      else if (extraType === 'noball') extras.noballs += runs;
      else if (extraType === 'bye') extras.byes += runs;
      else if (extraType === 'legbye') extras.legbyes += runs;
    }

    const updatedInnings = {
      ...currentInningsData,
      score: newScore,
      overs: calculateOvers(newBalls.length),
      balls: newBalls,
      batsmen: batsmanStats,
      bowlers: bowlerStats,
      extras,
    };

    const updatedMatch = {
      ...match,
      innings: match.innings.map((inn, idx) => 
        idx === match.currentInnings ? updatedInnings : inn
      ),
      updatedAt: new Date().toISOString(),
    };

    // Swap striker if runs are odd
    if (runs % 2 === 1 && !isExtra) {
      const temp = currentStriker;
      setCurrentStriker(currentNonStriker);
      setCurrentNonStriker(temp);
    }

    // Check for over completion
    if ((newBalls.length % 6 === 0) && !isExtra) {
      const temp = currentStriker;
      setCurrentStriker(currentNonStriker);
      setCurrentNonStriker(temp);
      
      // Check if innings should end
      if (calculateOvers(newBalls.length) >= match.overs) {
        endInnings(updatedMatch);
        return;
      }
    }

    saveMatch(updatedMatch);
  };

  const recordWicket = (dismissalType: string, fielder?: string) => {
    if (!match || !currentStriker || !currentBowler) return;

    const currentInningsData = match.innings[match.currentInnings];
    const ballNumber = currentInningsData.balls.length + 1;
    const currentOver = Math.floor(currentInningsData.balls.length / 6);

    const newBall: Ball = {
      ballNumber,
      over: currentOver,
      runs: 0,
      extras: { type: null, runs: 0 },
      wicket: {
        isWicket: true,
        type: dismissalType as any,
        fielder,
      },
      striker: currentStriker,
      nonStriker: currentNonStriker,
      bowler: currentBowler,
      timestamp: new Date().toISOString(),
    };

    let newWickets = currentInningsData.wickets + 1;
    let newBalls = [...currentInningsData.balls, newBall];

    // Update batsman stats - mark as out
    const batsmanStats = currentInningsData.batsmen.map(b => 
      b.playerId === currentStriker 
        ? { ...b, isOut: true, dismissalType, dismissalBowler: currentBowler }
        : b
    );

    // Update bowler stats
    const bowlerStats = updateBowlerStats(currentInningsData.bowlers, currentBowler, 0, true, true);

    const updatedInnings = {
      ...currentInningsData,
      wickets: newWickets,
      overs: calculateOvers(newBalls.length),
      balls: newBalls,
      batsmen: batsmanStats,
      bowlers: bowlerStats,
    };

    const updatedMatch = {
      ...match,
      innings: match.innings.map((inn, idx) => 
        idx === match.currentInnings ? updatedInnings : inn
      ),
      updatedAt: new Date().toISOString(),
    };

    // Check if innings should end
    if (newWickets >= 10) {
      endInnings(updatedMatch);
      return;
    }

    setCurrentStriker('');
    setShowBatsmanSelector(true);
    setShowWicketModal(false);
    saveMatch(updatedMatch);
  };

  const updateBatsmanStats = (batsmen: BatsmanStats[], playerId: string, runs: number, countBall: boolean): BatsmanStats[] => {
    const existing = batsmen.find(b => b.playerId === playerId);
    if (existing) {
      const newRuns = existing.runs + runs;
      const newBalls = existing.balls + (countBall ? 1 : 0);
      return batsmen.map(b => 
        b.playerId === playerId 
          ? {
              ...b,
              runs: newRuns,
              balls: newBalls,
              fours: runs === 4 ? b.fours + 1 : b.fours,
              sixes: runs === 6 ? b.sixes + 1 : b.sixes,
              strikeRate: newBalls > 0 ? (newRuns / newBalls) * 100 : 0,
            }
          : b
      );
    }
    return batsmen;
  };

  const updateBowlerStats = (bowlers: BowlerStats[], playerId: string, runs: number, wicket: boolean, dot: boolean): BowlerStats[] => {
    const existing = bowlers.find(b => b.playerId === playerId);
    if (existing) {
      const newRuns = existing.runs + runs;
      const newWickets = existing.wickets + (wicket ? 1 : 0);
      const newDots = existing.dots + (dot ? 1 : 0);
      return bowlers.map(b => 
        b.playerId === playerId 
          ? {
              ...b,
              runs: newRuns,
              wickets: newWickets,
              dots: newDots,
              economy: b.overs > 0 ? newRuns / b.overs : 0,
            }
          : b
      );
    }
    return bowlers;
  };

  const calculateOvers = (totalBalls: number): number => {
    const overs = Math.floor(totalBalls / 6);
    const balls = totalBalls % 6;
    return parseFloat(`${overs}.${balls}`);
  };

  const endInnings = (updatedMatch: Match) => {
    if (updatedMatch.currentInnings === 0) {
      // Start second innings
      const firstInningsScore = updatedMatch.innings[0].score;
      const secondInnings: Innings = {
        battingTeam: updatedMatch.innings[0].bowlingTeam,
        bowlingTeam: updatedMatch.innings[0].battingTeam,
        score: 0,
        wickets: 0,
        overs: 0,
        balls: [],
        batsmen: [],
        bowlers: [],
        extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0, penalties: 0 },
        target: firstInningsScore + 1,
      };
      
      updatedMatch.innings.push(secondInnings);
      updatedMatch.currentInnings = 1;
      
      setCurrentStriker('');
      setCurrentNonStriker('');
      setCurrentBowler('');
      
      Alert.alert('Innings Complete', `Target: ${firstInningsScore + 1} runs`);
      saveMatch(updatedMatch);
    } else {
      // Match complete
      const team1Score = updatedMatch.innings[0].score;
      const team2Score = updatedMatch.innings[1].score;
      
      let result = '';
      if (team1Score > team2Score) {
        result = `${updatedMatch.team1.name} won by ${team1Score - team2Score} runs`;
      } else if (team2Score > team1Score) {
        const wicketsRemaining = 10 - updatedMatch.innings[1].wickets;
        result = `${updatedMatch.team2.name} won by ${wicketsRemaining} wickets`;
      } else {
        result = 'Match Tied';
      }
      
      updatedMatch.status = 'completed';
      updatedMatch.result = result;
      
      Alert.alert('Match Complete', result);
      saveMatch(updatedMatch);
    }
  };

  const getCurrentInnings = () => {
    if (!match) return null;
    return match.innings[match.currentInnings];
  };

  const renderScoreBoard = () => {
    const innings = getCurrentInnings();
    if (!innings) return null;

    const runRate = innings.overs > 0 ? (innings.score / innings.overs).toFixed(2) : '0.00';
    const requiredRate = innings.target && innings.overs > 0 
      ? ((innings.target - innings.score) / (match!.overs - innings.overs)).toFixed(2) 
      : null;

    return (
      <View style={styles.scoreBoard}>
        <View style={styles.scoreHeader}>
          <Text style={styles.teamName}>{innings.battingTeam}</Text>
          <Text style={styles.mainScore}>
            {innings.score}/{innings.wickets}
          </Text>
          <Text style={styles.overs}>({innings.overs} ov)</Text>
        </View>
        
        {innings.target && (
          <View style={styles.targetInfo}>
            <Text style={styles.targetText}>
              Target: {innings.target} | Need {innings.target - innings.score} runs
            </Text>
          </View>
        )}
        
        <View style={styles.rateInfo}>
          <Text style={styles.rateText}>CRR: {runRate}</Text>
          {requiredRate && <Text style={styles.rateText}>RRR: {requiredRate}</Text>}
        </View>
      </View>
    );
  };

  const renderCurrentBatsmen = () => {
    const innings = getCurrentInnings();
    if (!innings) return null;

    const strikerStats = innings.batsmen.find(b => b.playerId === currentStriker);
    const nonStrikerStats = innings.batsmen.find(b => b.playerId === currentNonStriker);

    return (
      <View style={styles.batsmenCard}>
        <Text style={styles.cardTitle}>Current Batsmen</Text>
        
        {strikerStats && (
          <View style={styles.batsmanRow}>
            <Text style={styles.batsmanName}>{strikerStats.playerName} *</Text>
            <Text style={styles.batsmanScore}>
              {strikerStats.runs} ({strikerStats.balls}) SR: {strikerStats.strikeRate.toFixed(1)}
            </Text>
          </View>
        )}
        
        {nonStrikerStats && (
          <View style={styles.batsmanRow}>
            <Text style={styles.batsmanName}>{nonStrikerStats.playerName}</Text>
            <Text style={styles.batsmanScore}>
              {nonStrikerStats.runs} ({nonStrikerStats.balls}) SR: {nonStrikerStats.strikeRate.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderCurrentBowler = () => {
    const innings = getCurrentInnings();
    if (!innings || !currentBowler) return null;

    const bowlerStats = innings.bowlers.find(b => b.playerId === currentBowler);
    if (!bowlerStats) return null;

    return (
      <View style={styles.bowlerCard}>
        <Text style={styles.cardTitle}>Current Bowler</Text>
        <View style={styles.bowlerRow}>
          <Text style={styles.bowlerName}>{bowlerStats.playerName}</Text>
          <Text style={styles.bowlerStats}>
            {bowlerStats.overs}-{bowlerStats.wickets}-{bowlerStats.runs} Eco: {bowlerStats.economy.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  const renderScoringButtons = () => {
    return (
      <View style={styles.scoringPanel}>
        <Text style={styles.panelTitle}>Score Runs</Text>
        
        <View style={styles.buttonGrid}>
          <TouchableOpacity style={styles.runButton} onPress={() => recordBall(0)}>
            <Text style={styles.runButtonText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.runButton} onPress={() => recordBall(1)}>
            <Text style={styles.runButtonText}>1</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.runButton} onPress={() => recordBall(2)}>
            <Text style={styles.runButtonText}>2</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.runButton} onPress={() => recordBall(3)}>
            <Text style={styles.runButtonText}>3</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.runButton, styles.fourButton]} onPress={() => recordBall(4)}>
            <Text style={styles.runButtonText}>4</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.runButton, styles.sixButton]} onPress={() => recordBall(6)}>
            <Text style={styles.runButtonText}>6</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.wicketButton} 
            onPress={() => setShowWicketModal(true)}
          >
            <Text style={styles.actionButtonText}>Wicket</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.extrasButton} 
            onPress={() => setShowExtrasModal(true)}
          >
            <Text style={styles.actionButtonText}>Extras</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.undoButton} 
            onPress={() => Alert.alert('Undo', 'Undo last ball feature')}
          >
            <Text style={styles.actionButtonText}>Undo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.changeBowlerButton} 
            onPress={() => setShowBowlerSelector(true)}
          >
            <Text style={styles.actionButtonText}>Change Bowler</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderRecentBalls = () => {
    const innings = getCurrentInnings();
    if (!innings || innings.balls.length === 0) return null;

    const recentBalls = innings.balls.slice(-6).reverse();

    return (
      <View style={styles.recentBalls}>
        <Text style={styles.cardTitle}>This Over</Text>
        <View style={styles.ballsContainer}>
          {recentBalls.map((ball, idx) => (
            <View 
              key={idx} 
              style={[
                styles.ballCircle,
                ball.wicket.isWicket && styles.wicketBall,
                ball.runs === 4 && styles.fourBall,
                ball.runs === 6 && styles.sixBall,
              ]}
            >
              <Text style={styles.ballText}>
                {ball.wicket.isWicket ? 'W' : ball.runs}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (!match || showMatchSetup) {
    return (
      <View style={styles.container}>
        <Text style={styles.setupTitle}>Match setup required</Text>
        <Text style={styles.setupText}>Configure teams and toss before starting</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {renderScoreBoard()}
        {renderCurrentBatsmen()}
        {renderCurrentBowler()}
        {renderRecentBalls()}
        {renderScoringButtons()}
      </ScrollView>

      {/* Wicket Modal */}
      <Modal visible={showWicketModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Dismissal Type</Text>
            
            {['bowled', 'caught', 'lbw', 'runout', 'stumped', 'hitwicket'].map(type => (
              <TouchableOpacity
                key={type}
                style={styles.modalButton}
                onPress={() => recordWicket(type)}
              >
                <Text style={styles.modalButtonText}>{type.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={() => setShowWicketModal(false)}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Extras Modal */}
      <Modal visible={showExtrasModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Extra Type</Text>
            
            <TouchableOpacity style={styles.modalButton} onPress={() => { recordBall(1, true, 'wide'); setShowExtrasModal(false); }}>
              <Text style={styles.modalButtonText}>WIDE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => { recordBall(1, true, 'noball'); setShowExtrasModal(false); }}>
              <Text style={styles.modalButtonText}>NO BALL</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => { recordBall(1, true, 'bye'); setShowExtrasModal(false); }}>
              <Text style={styles.modalButtonText}>BYE</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={() => { recordBall(1, true, 'legbye'); setShowExtrasModal(false); }}>
              <Text style={styles.modalButtonText}>LEG BYE</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalCancelButton} onPress={() => setShowExtrasModal(false)}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
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
  setupTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'center',
    marginTop: 100,
  },
  setupText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 16,
  },
  scoreBoard: {
    backgroundColor: colors.primary,
    padding: 20,
    borderRadius: 12,
    margin: 16,
  },
  scoreHeader: {
    alignItems: 'center',
  },
  teamName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
    marginBottom: 8,
  },
  mainScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.white,
  },
  overs: {
    fontSize: 16,
    color: colors.white,
    marginTop: 4,
  },
  targetInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.3)',
  },
  targetText: {
    fontSize: 14,
    color: colors.white,
    textAlign: 'center',
  },
  rateInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  rateText: {
    fontSize: 14,
    color: colors.white,
    fontWeight: '600',
  },
  batsmenCard: {
    backgroundColor: colors.surface,
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  batsmanRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  batsmanName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  batsmanScore: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  bowlerCard: {
    backgroundColor: colors.surface,
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  bowlerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bowlerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  bowlerStats: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  recentBalls: {
    backgroundColor: colors.surface,
    padding: 16,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
  },
  ballsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  ballCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.grey,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wicketBall: {
    backgroundColor: colors.error,
  },
  fourBall: {
    backgroundColor: colors.success,
  },
  sixBall: {
    backgroundColor: colors.primary,
  },
  ballText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.white,
  },
  scoringPanel: {
    backgroundColor: colors.surface,
    padding: 16,
    margin: 16,
    borderRadius: 12,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  runButton: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fourButton: {
    backgroundColor: colors.success,
  },
  sixButton: {
    backgroundColor: colors.error,
  },
  runButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  wicketButton: {
    flex: 1,
    backgroundColor: colors.error,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  extrasButton: {
    flex: 1,
    backgroundColor: colors.warning,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  undoButton: {
    flex: 1,
    backgroundColor: colors.text.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  changeBowlerButton: {
    flex: 1,
    backgroundColor: colors.info,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.background,
    padding: 24,
    borderRadius: 16,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: colors.text.secondary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});
