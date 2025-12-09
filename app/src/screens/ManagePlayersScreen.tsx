import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Share,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';
import { TOUCH_TARGET } from '@/constants/accessibility';

export default function ManagePlayersScreen({ route, navigation }: any) {
  const { gameId } = route.params;
  const [game, setGame] = useState<any>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCoHostModal, setShowCoHostModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const currentUserId = 'USER123'; // Replace with actual user ID

  useEffect(() => {
    loadGame();
  }, []);

  const loadGame = async () => {
    try {
      const savedGames = await AsyncStorage.getItem('scheduledGames');
      if (savedGames) {
        const games = JSON.parse(savedGames);
        const foundGame = games.find((g: any) => g.id === gameId);
        setGame(foundGame);
      }
    } catch (error) {
      console.error('Error loading game:', error);
    }
  };

  const saveGame = async (updatedGame: any) => {
    try {
      const savedGames = await AsyncStorage.getItem('scheduledGames');
      if (savedGames) {
        const games = JSON.parse(savedGames);
        const index = games.findIndex((g: any) => g.id === gameId);
        if (index !== -1) {
          games[index] = updatedGame;
          await AsyncStorage.setItem('scheduledGames', JSON.stringify(games));
          setGame(updatedGame);
        }
      }
    } catch (error) {
      console.error('Error saving game:', error);
    }
  };

  const acceptRequest = async (requestId: string) => {
    const request = game.inviteRequests.find((r: any) => r.userId === requestId);
    if (!request) return;

    if (game.currentPlayers.length >= game.maxPlayers) {
      Alert.alert('Game Full', 'Maximum number of players reached');
      return;
    }

    const updatedGame = {
      ...game,
      currentPlayers: [
        ...game.currentPlayers,
        {
          userId: request.userId,
          userName: request.userName,
          gender: request.gender,
          status: 'confirmed',
          joinedAt: new Date().toISOString(),
        },
      ],
      inviteRequests: game.inviteRequests.map((r: any) =>
        r.userId === requestId ? { ...r, status: 'accepted' } : r
      ),
    };

    await saveGame(updatedGame);
    Alert.alert('Request Accepted', `${request.userName} has been added to the game`);
  };

  const rejectRequest = async (requestId: string) => {
    const request = game.inviteRequests.find((r: any) => r.userId === requestId);
    if (!request) return;

    const updatedGame = {
      ...game,
      inviteRequests: game.inviteRequests.map((r: any) =>
        r.userId === requestId ? { ...r, status: 'rejected' } : r
      ),
    };

    await saveGame(updatedGame);
    Alert.alert('Request Rejected', `${request.userName}'s request has been rejected`);
  };

  const removePlayer = async (playerId: string) => {
    const player = game.currentPlayers.find((p: any) => p.userId === playerId);
    if (!player) return;

    Alert.alert(
      'Remove Player',
      `Are you sure you want to remove ${player.userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedGame = {
              ...game,
              currentPlayers: game.currentPlayers.filter((p: any) => p.userId !== playerId),
            };
            await saveGame(updatedGame);
          },
        },
      ]
    );
  };

  const addCoHost = async (userId: string, userName: string) => {
    if (game.coHosts.some((ch: any) => ch.userId === userId)) {
      Alert.alert('Already Co-host', `${userName} is already a co-host`);
      return;
    }

    const updatedGame = {
      ...game,
      coHosts: [
        ...game.coHosts,
        {
          userId,
          userName,
          addedAt: new Date().toISOString(),
        },
      ],
    };

    await saveGame(updatedGame);
    setShowCoHostModal(false);
    Alert.alert('Co-host Added', `${userName} is now a co-host`);
  };

  const removeCoHost = async (userId: string) => {
    const coHost = game.coHosts.find((ch: any) => ch.userId === userId);
    if (!coHost) return;

    Alert.alert(
      'Remove Co-host',
      `Remove ${coHost.userName} as co-host?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            const updatedGame = {
              ...game,
              coHosts: game.coHosts.filter((ch: any) => ch.userId !== userId),
            };
            await saveGame(updatedGame);
          },
        },
      ]
    );
  };

  const shareInvite = async () => {
    const inviteMessage = `
🎮 You're invited to join my game!

${game.title}
Sport: ${game.sport.toUpperCase()}
Date: ${new Date(game.scheduledDate).toLocaleDateString()}
Time: ${game.startTime} - ${game.endTime}

Use code: ${game.shareCode}

Download CrushIT app to join!
    `;

    try {
      await Share.share({ message: inviteMessage });
    } catch (error) {
      console.error('Error sharing invite:', error);
    }
  };

  if (!game) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const isHost = game.hostId === currentUserId;
  const isCoHost = game.coHosts.some((ch: any) => ch.userId === currentUserId);
  const canManage = isHost || isCoHost;

  const pendingRequests = game.inviteRequests.filter((r: any) => r.status === 'pending');

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Manage Players</Text>
      <Text style={styles.subtitle}>{game.title}</Text>

      {/* Player Count */}
      <View style={styles.countCard}>
        <Text style={styles.countText}>
          {game.currentPlayers.length}/{game.maxPlayers} Players
        </Text>
        <Text style={styles.countSubtext}>
          Minimum: {game.minPlayers} players required
        </Text>
      </View>

      {/* Host */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎯 Host</Text>
        <View style={styles.playerCard}>
          <Text style={styles.playerName}>{game.hostName}</Text>
          <View style={styles.hostBadge}>
            <Text style={styles.badgeText}>Host</Text>
          </View>
        </View>
      </View>

      {/* Co-hosts */}
      {game.coHosts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⭐ Co-hosts ({game.coHosts.length})</Text>
          </View>
          {game.coHosts.map((coHost: any) => (
            <View key={coHost.userId} style={styles.playerCard}>
              <Text style={styles.playerName}>{coHost.userName}</Text>
              {isHost && (
                <TouchableOpacity onPress={() => removeCoHost(coHost.userId)}>
                  <Text style={styles.removeText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Current Players */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>👥 Players ({game.currentPlayers.length})</Text>
        {game.currentPlayers.map((player: any) => (
          <View key={player.userId} style={styles.playerCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.playerName}>{player.userName}</Text>
              <Text style={styles.playerGender}>
                {player.gender === 'female' ? '👩' : '👨'} {player.gender}
              </Text>
            </View>
            {canManage && player.userId !== game.hostId && (
              <TouchableOpacity onPress={() => removePlayer(player.userId)}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && canManage && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📩 Pending Requests ({pendingRequests.length})</Text>
          {pendingRequests.map((request: any) => (
            <View key={request.userId} style={styles.requestCard}>
              <View style={{ flex: 1 }}>
                <Text style={styles.playerName}>{request.userName}</Text>
                <Text style={styles.playerGender}>
                  {request.gender === 'female' ? '👩' : '👨'} {request.gender}
                </Text>
                {request.message && (
                  <Text style={styles.requestMessage}>"{request.message}"</Text>
                )}
              </View>
              <View style={styles.requestActions}>
                <TouchableOpacity
                  style={styles.acceptButton}
                  onPress={() => acceptRequest(request.userId)}
                >
                  <Text style={styles.acceptButtonText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.rejectButton}
                  onPress={() => rejectRequest(request.userId)}
                >
                  <Text style={styles.rejectButtonText}>✗</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      {canManage && (
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={shareInvite}
          >
            <Text style={styles.actionButtonText}>📤 Share Invite Link</Text>
          </TouchableOpacity>

          {isHost && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowCoHostModal(true)}
            >
              <Text style={styles.actionButtonText}>⭐ Add Co-host</Text>
            </TouchableOpacity>
          )}

          <View style={styles.shareCodeCard}>
            <Text style={styles.shareCodeLabel}>Share Code:</Text>
            <Text style={styles.shareCodeText}>{game.shareCode}</Text>
          </View>
        </View>
      )}

      <View style={{ height: 40 }} />

      {/* Co-host Modal */}
      <Modal
        visible={showCoHostModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCoHostModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Co-host</Text>
            <Text style={styles.modalSubtext}>Select from current players</Text>
            
            {game.currentPlayers
              .filter((p: any) => 
                p.userId !== game.hostId && 
                !game.coHosts.some((ch: any) => ch.userId === p.userId)
              )
              .map((player: any) => (
                <TouchableOpacity
                  key={player.userId}
                  style={styles.modalPlayerCard}
                  onPress={() => addCoHost(player.userId, player.userName)}
                >
                  <Text style={styles.playerName}>{player.userName}</Text>
                  <Text style={styles.addText}>Add →</Text>
                </TouchableOpacity>
              ))}

            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCoHostModal(false)}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  countCard: {
    backgroundColor: colors.primary + '10',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  countText: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  countSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  playerGender: {
    fontSize: 12,
    color: colors.text.secondary,
    textTransform: 'capitalize',
  },
  hostBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  removeText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  requestMessage: {
    fontSize: 12,
    color: colors.text.secondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  rejectButton: {
    backgroundColor: colors.error,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  actionsSection: {
    marginTop: 8,
  },
  actionButton: {
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    minHeight: TOUCH_TARGET.MINIMUM,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  shareCodeCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  shareCodeLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 4,
  },
  shareCodeText: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 4,
  },
  modalSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
  },
  modalPlayerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  modalCloseButton: {
    backgroundColor: colors.surface,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalCloseText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
});
