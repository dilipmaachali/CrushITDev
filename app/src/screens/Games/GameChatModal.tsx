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
import { colors } from '@/theme';
import { api } from '@/services';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Player {
  userId: string;
  userName: string;
  status?: string;
}

interface GameChatModalProps {
  visible: boolean;
  gameId: string;
  onClose: () => void;
}

export default function GameChatModal({ visible, gameId, onClose }: GameChatModalProps) {
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState('');
  const [game, setGame] = useState<any>(null);

  useEffect(() => {
    if (visible) {
      loadCurrentUser();
      loadGame();
      loadChat();
    }
  }, [visible, gameId]);

  const loadCurrentUser = async () => {
    const userId = await AsyncStorage.getItem('userId');
    setCurrentUserId(userId || 'dev-user-123');
  };

  const loadGame = async () => {
    try {
      const response = await api.get(`/api/games/${gameId}`);
      setGame(response.data);
    } catch (error) {
      console.error('Error loading game:', error);
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

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;

    try {
      await api.post(`/api/games/${gameId}/chat`, { message: chatMessage });
      setChatMessage('');
      // Reload chat messages
      loadChat();
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Game Chat</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Players List */}
        {game && (
          <View style={styles.playersList}>
            <Text style={styles.playersTitle}>Players in Game ({game.currentPlayers?.length || 0})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.playersScroll}>
              {/* Host */}
              <View style={styles.playerChip}>
                <Text style={styles.playerName}>{game.hostName}</Text>
                <View style={styles.hostBadge}>
                  <Text style={styles.hostBadgeText}>HOST</Text>
                </View>
              </View>
              
              {/* Co-hosts */}
              {game.coHosts?.map((coHost: Player) => (
                <View key={coHost.userId} style={styles.playerChip}>
                  <Text style={styles.playerName}>{coHost.userName}</Text>
                  <View style={styles.coHostBadge}>
                    <Text style={styles.coHostBadgeText}>CO-HOST</Text>
                  </View>
                </View>
              ))}

              {/* Other players */}
              {game.currentPlayers
                ?.filter((p: Player) => p.userId !== game.hostId && !game.coHosts?.some((ch: Player) => ch.userId === p.userId))
                .map((player: Player) => (
                  <View key={player.userId} style={styles.playerChip}>
                    <Text style={styles.playerName}>{player.userName}</Text>
                  </View>
                ))}
            </ScrollView>
          </View>
        )}

        <ScrollView style={styles.messages}>
          {chatMessages.length === 0 ? (
            <Text style={styles.noMessagesText}>No messages yet. Start the conversation!</Text>
          ) : (
            chatMessages.map((msg, index) => (
              <View key={index} style={[
                styles.message,
                msg.userId === currentUserId && styles.messageOwn
              ]}>
                <Text style={styles.messageUserName}>{msg.userName}</Text>
                <Text style={styles.messageText}>{msg.message}</Text>
                <Text style={styles.messageTime}>{new Date(msg.timestamp).toLocaleTimeString()}</Text>
              </View>
            ))
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: 24,
    color: colors.text.secondary,
  },
  playersList: {
    backgroundColor: colors.white,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  playersTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  playersScroll: {
    flexGrow: 0,
  },
  playerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    marginRight: 8,
    gap: 6,
  },
  playerName: {
    fontSize: 13,
    color: colors.text.primary,
    fontWeight: '500',
  },
  hostBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  hostBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '700',
  },
  coHostBadge: {
    backgroundColor: colors.primary + '80',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  coHostBadgeText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: '600',
  },
  messages: {
    flex: 1,
    padding: 16,
  },
  noMessagesText: {
    textAlign: 'center',
    color: colors.text.secondary,
    fontSize: 14,
    marginTop: 40,
  },
  message: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    maxWidth: '80%',
  },
  messageOwn: {
    backgroundColor: colors.primary + '20',
    alignSelf: 'flex-end',
  },
  messageUserName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: colors.text.primary,
    marginBottom: 4,
  },
  messageTime: {
    fontSize: 11,
    color: colors.text.secondary,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 8,
  },
  input: {
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
