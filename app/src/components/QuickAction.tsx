import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '@/theme';

interface QuickActionProps {
  icon: string;
  label: string;
  onPress: () => void;
}

export const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onPress }) => {
  const icons: { [key: string]: string } = {
    '📍': '📍',
    '❌': '❌',
    '✏️': '✏️',
    '👀': '👀',
    '🛒': '🛒',
    '💰': '💰',
    '⭐': '⭐',
    '❓': '❓',
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <Text style={styles.icon}>{icons[icon] || icon}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    minWidth: 70,
  },
  icon: {
    fontSize: 24,
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
  },
});
