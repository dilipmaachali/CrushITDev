import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme';

interface ChipProps {
  label: string;
  variant?: 'default' | 'primary' | 'secondary';
  onPress?: () => void;
}

export default function Chip({ label, variant = 'default', onPress }: ChipProps) {
  const backgroundColor =
    variant === 'primary' ? colors.primary : variant === 'secondary' ? colors.secondary : colors.surface;

  const textColor = variant === 'default' ? colors.text.primary : '#FFFFFF';

  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor,
          borderColor: variant === 'default' ? colors.border : 'transparent',
        },
      ]}
    >
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginRight: 8,
    marginBottom: 8,
  },
  text: {
    fontSize: 12,
    fontWeight: '500',
  },
});
