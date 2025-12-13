import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Modal,
  TextInput,
} from 'react-native';
import { colors } from '@/theme';
import { TOUCH_TARGET } from '@/constants/accessibility';
import { api } from '@/services';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Player {
  userId: string;
  userName: string;
  gender?: string;
  status: 'joined' | 'pending' | 'invited';
}

interface GameDetails {
  id: string;
  sport: string;
  sportName: string;
  title: string;
  description: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  location: {
    address: string;
    arenaName?: string;
  };
  hostId: string;
  hostName: string;
  coHosts: Player[];
  maxPlayers: number;
  currentPlayers: Player[];
  inviteRequests: Player[];
  paymentType: 'prepaid' | 'pay_later' | 'free';
  costPerPlayer?: number;
  isPublic: boolean;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'full';
  shareCode: string;
  skillLevel?: string;
  notes?: {
    costShared?: boolean;
    bringTools?: boolean;
    customNotes?: string;
  };
}

export default function GameDetailsScreen({ route, navigation }: any) {
  const { gameId, openChat: shouldOpenChat } = route.params;
  const [game, setGame] = useState<GameDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState('');
  const [showManageModal, setShowManageModal] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showPlayersExpanded, setShowPlayersExpanded] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    loadGame();
    loadCurrentUser();
    
    // Open chat if requested from route params
    if (shouldOpenChat) {
      setTimeout(() => {
        openChat();
      }, 500);
    }
  }, []);

  const loadCurrentUser = async () => {
    const userId = await AsyncStorage.getItem('userId');
    setCurrentUserId(userId || 'dev-user-123');
  };

  const loadGame = async () => {
    try {
      const response = await api.get(`/api/games/${gameId}`);
      setGame(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading game:', error);
      Alert.alert('Error', 'Failed to load game details');
      navigation.goBack();
    }
  };

  const isHost = game?.hostId === currentUserId;
  const isCoHost = game?.coHosts?.some(ch => ch.userId === currentUserId);
  const canManage = isHost || isCoHost;

  const handleShare = async () => {
    if (!game) return;

    const shareMessage = `Join my ${game.sportName} game!\n\n` +
      `📅 ${new Date(game.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}\n` +
      `🕐 ${game.startTime} - ${game.endTime}\n` +
      `📍 ${game.location.arenaName || game.location.address}\n` +
      `👥 ${game.currentPlayers.length}/${game.maxPlayers} players\n` +
      `Share Code: ${game.shareCode}\n\n` +
      `Download CrushIT app to join!`;

    try {
      await Share.share({
        message: shareMessage,
        title: `Join ${game.title}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleJoinGame = async () => {
    if (!game) return;

    if (game.currentPlayers.length >= game.maxPlayers) {
      Alert.alert('Game Full', 'This game has reached maximum capacity');
      return;
    }

    try {
      await api.post(`/api/games/${gameId}/join`);
      Alert.alert('Success', 'You have joined the game!');
      loadGame();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to join game');
    }
  };

  const handleLeaveGame = async () => {
    Alert.alert(
      'Leave Game',
      'Are you sure you want to leave this game?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/api/games/${gameId}/leave`);
              Alert.alert('Success', 'You have left the game');
              loadGame();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to leave game');
            }
          },
        },
      ]
    );
  };

  const handleMarkAsFull = async () => {
    try {
      await api.post(`/api/games/${gameId}/mark-full`);
      Alert.alert('Success', 'Game marked as full');
      loadGame();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to update game');
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    Alert.alert(
      'Remove Player',
      'Are you sure you want to remove this player?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/api/games/${gameId}/remove-player`, { playerId });
              Alert.alert('Success', 'Player removed');
              loadGame();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.error || 'Failed to remove player');
            }
          },
        },
      ]
    );
  };

  const handleAcceptRequest = async (playerId: string) => {
    try {
      await api.post(`/api/games/${gameId}/accept-request`, { playerId });
      Alert.alert('Success', 'Request accepted');
      loadGame();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to accept request');
    }
  };

  const handleRejectRequest = async (playerId: string) => {
    try {
      await api.post(`/api/games/${gameId}/reject-request`, { playerId });
      Alert.alert('Success', 'Request rejected');
      loadGame();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to reject request');
    }
  };

  const handleAddCoHost = async (playerId: string) => {
    try {
      await api.post(`/api/games/${gameId}/add-cohost`, { playerId });
      Alert.alert('Success', 'Co-host added');
      loadGame();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to add co-host');
    }
  };

  const handleRemoveCoHost = async (playerId: string) => {
    try {
      await api.post(`/api/games/${gameId}/remove-cohost`, { playerId });
      Alert.alert('Success', 'Co-host removed');
      loadGame();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to remove co-host');
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      await api.post(`/api/games/${gameId}/chat`, { message: chatMessage });
      setChatMessage('');
      // Reload chat messages
      const response = await api.get(`/api/games/${gameId}/chat`);
      setChatMessages(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const loadChat = async () => {
    try {
      const response = await api.get(`/api/games/${gameId}/chat`);
      setChatMessages(response.data);
    } catch (error) {
      console.error('Error loading chat:', error);
    }
  };

  const openChat = () => {
    loadChat();
    setShowChatModal(true);
  };

  if (loading || !game) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const hasJoined = game.currentPlayers.some(p => p.userId === currentUserId);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backButtonText}>‹ Back</Text>
            </TouchableOpacity>
            <View style={styles.headerIcons}>
              <TouchableOpacity onPress={handleShare} style={styles.iconButton}>
                <Text style={styles.iconText}>📤</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowOptionsMenu(true)} style={styles.iconButton}>
                <Text style={styles.iconText}>⋮</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.title}>{game.title}</Text>
          <View style={[
            styles.statusBadge,
            game.status === 'scheduled' && styles.statusScheduled,
            game.status === 'ongoing' && styles.statusOngoing,
            game.status === 'completed' && styles.statusCompleted,
            game.status === 'cancelled' && styles.statusCancelled,
            game.status === 'full' && styles.statusFull,
          ]}>
            <Text style={styles.statusText}>{game.status.toUpperCase()}</Text>
          </View>
        </View>

        {/* Sport Info */}
        <View style={styles.section}>
          <Text style={styles.sportName}>
            {game.sport === 'Badminton' && '🏸'}
            {game.sport === 'Football' && '⚽'}
            {game.sport === 'Cricket' && '🏏'}
            {game.sport === 'Pickleball' && '🎾'}
            {game.sport === 'Table Tennis' && '🏓'}
            {' '}{game.sportName}
          </Text>
          {game.skillLevel && (
            <Text style={styles.skillLevel}>Skill Level: {game.skillLevel}</Text>
          )}
        </View>

        {/* Date & Time */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 When</Text>
          <Text style={styles.sectionContent}>
            {new Date(game.scheduledDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </Text>
          <Text style={styles.sectionContent}>
            🕐 {game.startTime} - {game.endTime}
          </Text>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📍 Where</Text>
          <Text style={styles.sectionContent}>{game.location.arenaName || 'Arena'}</Text>
          <Text style={styles.sectionSubtext}>{game.location.address}</Text>
        </View>

        {/* Host & Co-hosts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👑 Host</Text>
          <View style={styles.playerRow}>
            <Text style={styles.playerName}>{game.hostName}</Text>
            <View style={styles.hostBadge}>
              <Text style={styles.hostBadgeText}>HOST</Text>
            </View>
          </View>

          {game.coHosts && game.coHosts.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { marginTop: 12 }]}>🤝 Co-hosts</Text>
              {game.coHosts.map((coHost) => (
                <View key={coHost.userId} style={styles.playerRow}>
                  <Text style={styles.playerName}>{coHost.userName}</Text>
                  <View style={styles.coHostBadge}>
                    <Text style={styles.coHostBadgeText}>CO-HOST</Text>
                  </View>
                  {isHost && (
                    <TouchableOpacity
                      onPress={() => handleRemoveCoHost(coHost.userId)}
                      style={styles.removeButton}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </>
          )}
        </View>

        {/* Players */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.playersSectionHeader}
            onPress={() => setShowPlayersExpanded(!showPlayersExpanded)}
          >
            <Text style={styles.sectionTitle}>
              👥 Players ({game.currentPlayers.length}/{game.maxPlayers})
            </Text>
            <Text style={styles.expandIcon}>{showPlayersExpanded ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {/* Always show host */}
          <View style={styles.playerRow}>
            <Text style={styles.playerName}>{game.hostName}</Text>
            <View style={styles.hostBadge}>
              <Text style={styles.hostBadgeText}>HOST</Text>
            </View>
          </View>

          {/* Always show co-hosts */}
          {game.coHosts && game.coHosts.map((coHost) => (
            <View key={coHost.userId} style={styles.playerRow}>
              <Text style={styles.playerName}>{coHost.userName}</Text>
              <View style={styles.coHostBadge}>
                <Text style={styles.coHostBadgeText}>CO-HOST</Text>
              </View>
              {isHost && (
                <TouchableOpacity
                  onPress={() => handleRemoveCoHost(coHost.userId)}
                  style={styles.removeButton}
                >
                  <Text style={styles.removeButtonText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Show other players only when expanded */}
          {showPlayersExpanded && game.currentPlayers
            .filter(p => p.userId !== game.hostId && !game.coHosts?.some(ch => ch.userId === p.userId))
            .map((player) => (
            <View key={player.userId} style={styles.playerRow}>
              <Text style={styles.playerName}>{player.userName}</Text>
              {player.status === 'pending' && (
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>PENDING</Text>
                </View>
              )}
              {canManage && (
                <View style={styles.playerActions}>
                  {isHost && (
                    <TouchableOpacity
                      onPress={() => handleAddCoHost(player.userId)}
                      style={styles.coHostActionButton}
                    >
                      <Text style={styles.coHostActionText}>Make Co-host</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => handleRemovePlayer(player.userId)}
                    style={styles.removeButton}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Join Requests */}
        {canManage && game.inviteRequests && game.inviteRequests.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              📨 Join Requests ({game.inviteRequests.length})
            </Text>
            {game.inviteRequests.map((request) => (
              <View key={request.userId} style={styles.playerRow}>
                <Text style={styles.playerName}>{request.userName}</Text>
                <View style={styles.requestActions}>
                  <TouchableOpacity
                    onPress={() => handleAcceptRequest(request.userId)}
                    style={styles.acceptButton}
                  >
                    <Text style={styles.acceptButtonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleRejectRequest(request.userId)}
                    style={styles.rejectButton}
                  >
                    <Text style={styles.rejectButtonText}>Reject</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Payment Info */}
        {game.paymentType !== 'free' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💰 Payment</Text>
            <Text style={styles.sectionContent}>
              {game.paymentType === 'prepaid' ? 'Prepaid' : 'Pay Later'}: ₹{game.costPerPlayer || 0} per player
            </Text>
          </View>
        )}

        {/* Notes */}
        {game.notes?.customNotes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Notes</Text>
            <Text style={styles.sectionContent}>{game.notes.customNotes}</Text>
          </View>
        )}

        {game.notes?.costShared && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>💵 Cost will be shared among players</Text>
          </View>
        )}

        {game.notes?.bringTools && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>🎒 Please bring your own equipment</Text>
          </View>
        )}

        {/* Share Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔗 Share Code</Text>
          <Text style={styles.shareCode}>{game.shareCode}</Text>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      {!hasJoined && !canManage && game.status === 'scheduled' && game.currentPlayers.length < game.maxPlayers && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.joinButton} onPress={handleJoinGame}>
            <Text style={styles.joinButtonText}>Join Game</Text>
          </TouchableOpacity>
        </View>
      )}

      {hasJoined && !canManage && (
        <View style={styles.actionBar}>
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGame}>
            <Text style={styles.leaveButtonText}>Leave Game</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Options Menu Modal */}
      <Modal
        visible={showOptionsMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptionsMenu(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Game Options</Text>

            <TouchableOpacity
              style={styles.manageOption}
              onPress={() => {
                setShowOptionsMenu(false);
                navigation.navigate('EditGame', { gameId: game.id });
              }}
            >
              <Text style={styles.manageOptionText}>✏️ Edit Game</Text>
            </TouchableOpacity>

            {canManage && (
              <>
                <TouchableOpacity
                  style={styles.manageOption}
                  onPress={() => {
                    setShowOptionsMenu(false);
                    setShowManageModal(true);
                  }}
                >
                  <Text style={styles.manageOptionText}>⚙️ Manage Players</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.manageOption}
                  onPress={() => {
                    setShowOptionsMenu(false);
                    handleMarkAsFull();
                  }}
                >
                  <Text style={styles.manageOptionText}>
                    {game.status === 'full' ? '✅ Mark as Open' : '🚫 Mark as Full'}
                  </Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.manageOption, styles.closeOption]}
              onPress={() => setShowOptionsMenu(false)}
            >
              <Text style={styles.closeOptionText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Manage Modal */}
      <Modal
        visible={showManageModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowManageModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Manage Players</Text>

            <TouchableOpacity
              style={[styles.manageOption, styles.closeOption]}
              onPress={() => setShowManageModal(false)}
            >
              <Text style={styles.closeOptionText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Chat Modal */}
      <Modal
        visible={showChatModal}
        animationType="slide"
        onRequestClose={() => setShowChatModal(false)}
      >
        <View style={styles.chatContainer}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatTitle}>Game Chat</Text>
            <TouchableOpacity onPress={() => setShowChatModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Players List */}
          {game && (
            <View style={styles.chatPlayersList}>
              <Text style={styles.chatPlayersTitle}>Players in Game ({game.currentPlayers.length})</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chatPlayersScroll}>
                {/* Host */}
                <View style={styles.chatPlayerChip}>
                  <Text style={styles.chatPlayerName}>{game.hostName}</Text>
                  <View style={styles.chatHostBadge}>
                    <Text style={styles.chatHostBadgeText}>HOST</Text>
                  </View>
                </View>
                
                {/* Co-hosts */}
                {game.coHosts?.map((coHost) => (
                  <View key={coHost.userId} style={styles.chatPlayerChip}>
                    <Text style={styles.chatPlayerName}>{coHost.userName}</Text>
                    <View style={styles.chatCoHostBadge}>
                      <Text style={styles.chatCoHostBadgeText}>CO-HOST</Text>
                    </View>
                  </View>
                ))}

                {/* Other players */}
                {game.currentPlayers
                  .filter(p => p.userId !== game.hostId && !game.coHosts?.some(ch => ch.userId === p.userId))
                  .map((player) => (
                    <View key={player.userId} style={styles.chatPlayerChip}>
                      <Text style={styles.chatPlayerName}>{player.userName}</Text>
                    </View>
                  ))}
              </ScrollView>
            </View>
          )}

          <ScrollView style={styles.chatMessages}>
            {chatMessages.length === 0 ? (
              <Text style={styles.noChatText}>No messages yet. Start the conversation!</Text>
            ) : (
              chatMessages.map((msg, index) => (
                <View key={index} style={[
                  styles.chatMessage,
                  msg.userId === currentUserId && styles.chatMessageOwn
                ]}>
                  <Text style={styles.chatUserName}>{msg.userName}</Text>
                  <Text style={styles.chatMessageText}>{msg.message}</Text>
                  <Text style={styles.chatTime}>{new Date(msg.timestamp).toLocaleTimeString()}</Text>
                </View>
              ))
            )}
          </ScrollView>

          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type a message..."
              value={chatMessage}
              onChangeText={setChatMessage}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // Main container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    padding: 4,
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '600',
  },
  headerIcons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
    color: colors.text.primary,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  statusScheduled: {
    backgroundColor: colors.primary + '20',
  },
  statusOngoing: {
    backgroundColor: '#4CAF50' + '20',
  },
  statusCompleted: {
    backgroundColor: '#9E9E9E' + '20',
  },
  statusCancelled: {
    backgroundColor: '#F44336' + '20',
  },
  statusFull: {
    backgroundColor: '#FF9800' + '20',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  section: {
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sportName: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  skillLevel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  playersSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expandIcon: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  sectionContent: {
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 4,
  },
  sectionSubtext: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '30',
  },
  playerName: {
    flex: 1,
    fontSize: 15,
    color: colors.text.primary,
  },
  hostBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  hostBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  coHostBadge: {
    backgroundColor: colors.primary + '80',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 8,
  },
  coHostBadgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '600',
  },
  pendingBadge: {
    backgroundColor: '#FF9800' + '30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pendingBadgeText: {
    color: '#FF9800',
    fontSize: 11,
    fontWeight: '600',
  },
  playerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  coHostActionButton: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  coHostActionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#F44336' + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  removeButtonText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '600',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#4CAF50' + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  acceptButtonText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectButton: {
    backgroundColor: '#F44336' + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rejectButtonText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: '600',
  },
  infoBox: {
    backgroundColor: colors.primary + '10',
    padding: 12,
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  shareCode: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 2,
  },
  actionBar: {
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  joinButton: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  leaveButton: {
    backgroundColor: '#F44336',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  leaveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 20,
  },
  manageOption: {
    padding: 16,
    backgroundColor: colors.background,
    borderRadius: 8,
    marginBottom: 12,
  },
  manageOptionText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  closeOption: {
    backgroundColor: colors.border,
  },
  closeOptionText: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '600',
    textAlign: 'center',
  },
  chatContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatPlayersList: {
    backgroundColor: colors.white,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chatPlayersTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  chatPlayersScroll: {
    flexGrow: 0,
  },
  chatPlayerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  chatPlayerName: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '500',
  },
  chatHostBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chatHostBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  chatCoHostBadge: {
    backgroundColor: colors.primary + '80',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chatCoHostBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '600',
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  chatMessages: {
    flex: 1,
    padding: 16,
  },
  noChatText: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: 40,
  },
  chatMessage: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    maxWidth: '80%',
  },
  chatMessageOwn: {
    backgroundColor: colors.primary + '20',
    alignSelf: 'flex-end',
  },
  chatUserName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  chatMessageText: {
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 4,
  },
  chatTime: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  chatInputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  chatInput: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    justifyContent: 'center',
  },
  sendButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
});
