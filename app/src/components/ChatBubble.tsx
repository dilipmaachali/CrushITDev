import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme';

interface ChatBubbleProps {
  message: string;
  isBot: boolean;
  timestamp?: Date;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  message,
  isBot,
  timestamp,
}) => {
  return (
    <View style={[styles.container, isBot ? styles.botContainer : styles.userContainer]}>
      <View style={[styles.bubble, isBot ? styles.botBubble : styles.userBubble]}>
        <Text style={[styles.text, isBot ? styles.botText : styles.userText]}>
          {message}
        </Text>
      </View>
      {timestamp && (
        <Text style={styles.timestamp}>
          {new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  botContainer: {
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  userContainer: {
    justifyContent: 'flex-end',
    marginBottom: 12,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  botBubble: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
    borderTopLeftRadius: 16,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
    borderTopRightRadius: 16,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.15,
    fontWeight: '500',
  },
  botText: {
    color: colors.text.primary,
  },
  userText: {
    color: colors.white,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 11,
    color: colors.text.tertiary,
    marginTop: 4,
    marginHorizontal: 8,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
});
