import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Image } from 'react-native';
import { colors } from '@/theme';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    rating: number;
    image: string | number;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  // Handle both URI strings and require() imports
  const imageSource = typeof product.image === 'string' 
    ? { uri: product.image }
    : product.image;

  return (
    <TouchableOpacity style={styles.card}>
      <Image source={imageSource} style={styles.image} resizeMode="contain" />
      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.price}>₹{product.price}</Text>
        <Text style={styles.rating}>⭐ {product.rating}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    margin: 8,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 140,
    backgroundColor: colors.surface,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.primary,
    padding: 10,
    lineHeight: 18,
    letterSpacing: 0.15,
  },
  footer: {
    paddingHorizontal: 10,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.divider,
    paddingTop: 8,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: -0.3,
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
});
