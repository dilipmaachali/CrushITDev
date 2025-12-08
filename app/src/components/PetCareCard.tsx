import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '@/theme';

interface PetCareCardProps {
  service: {
    id: string;
    name: string;
    serviceType: string;
    pricing: number;
    rating: number;
    distance: string;
  };
}

export default function PetCareCard({ service }: PetCareCardProps) {
  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{service.name}</Text>
        <Text style={styles.rating}>⭐ {service.rating}</Text>
      </View>
      <Text style={styles.type}>{service.serviceType}</Text>
      <View style={styles.footer}>
        <Text style={styles.pricing}>₹{service.pricing}/session</Text>
        <Text style={styles.distance}>{service.distance}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    letterSpacing: -0.2,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.ratingExcellent,
  },
  type: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 10,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 10,
  },
  pricing: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  distance: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '500',
  },
});
