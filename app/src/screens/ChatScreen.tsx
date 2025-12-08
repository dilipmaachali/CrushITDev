import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { ChatBubble, ChatInput, QuickAction } from '@/components';
import { colors } from '@/theme';
import { API_CONFIG } from '@/config/api';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const ChatScreen = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! 👋 Welcome to CrushIT. I can help you book arenas, manage bookings, shop for sports gear, and more. What would you like to do?',
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text,
      isBot: false,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    setIsLoading(true);

    try {
      // Call backend chatbot API
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHAT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user1', // In real app, get from auth context
          userMessage: text,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const botMessage: Message = {
          id: `bot-${Date.now()}`,
          text: data.botResponse,
          isBot: true,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        text: 'Sorry, I encountered an error. Please try again.',
        isBot: true,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    const actions: { [key: string]: string } = {
      'Book Arena': 'I want to book a badminton court',
      'My Bookings': 'Show me my bookings',
      'Cancel': 'I want to cancel a booking',
      'Modify': 'I need to modify a booking',
      'Shop': 'Show me sports equipment',
      'Wallet': 'Check my wallet balance',
      'Pet Care': 'I need pet care services',
      'Help': 'What can you help me with?',
    };
    handleSendMessage(actions[action] || action);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CrushIT Assistant</Text>
        <Text style={styles.headerSubtitle}>Online</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ChatBubble
            message={item.text}
            isBot={item.isBot}
            timestamp={item.timestamp}
          />
        )}
        contentContainerStyle={styles.messageList}
        onEndReachedThreshold={0.5}
      />

      {messages.length === 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickActionsContainer}
          contentContainerStyle={styles.quickActionsContent}
        >
          <QuickAction
            icon="📍"
            label="Book Arena"
            onPress={() => handleQuickAction('Book Arena')}
          />
          <QuickAction
            icon="👀"
            label="My Bookings"
            onPress={() => handleQuickAction('My Bookings')}
          />
          <QuickAction
            icon="❌"
            label="Cancel"
            onPress={() => handleQuickAction('Cancel')}
          />
          <QuickAction
            icon="✏️"
            label="Modify"
            onPress={() => handleQuickAction('Modify')}
          />
          <QuickAction
            icon="🛒"
            label="Shop"
            onPress={() => handleQuickAction('Shop')}
          />
          <QuickAction
            icon="💰"
            label="Wallet"
            onPress={() => handleQuickAction('Wallet')}
          />
          <QuickAction
            icon="⭐"
            label="Pet Care"
            onPress={() => handleQuickAction('Pet Care')}
          />
          <QuickAction
            icon="❓"
            label="Help"
            onPress={() => handleQuickAction('Help')}
          />
        </ScrollView>
      )}

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}

      <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginTop: 2,
  },
  messageList: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  quickActionsContainer: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    maxHeight: 100,
  },
  quickActionsContent: {
    paddingHorizontal: 8,
    gap: 8,
  },
  loadingContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
});

export default ChatScreen;
