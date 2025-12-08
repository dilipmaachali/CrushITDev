import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { colors } from '@/theme';
import { getArenaImage } from '@/utils/imageUtils';

export default function ArenaDetailsScreen({ route, navigation }: any) {
  const { arena } = route.params || {
    id: '1',
    name: 'Elite Cricket Turf',
    type: 'cricket',
    pricing: 500,
    rating: 4.8,
    distance: '2.5 km',
  };

  const arenaImageUri = arena.images?.[0] || getArenaImage(arena.type);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Image
        source={
          typeof arenaImageUri === 'string' && arenaImageUri.startsWith('/')
            ? { uri: arenaImageUri }
            : arenaImageUri
        }
        style={styles.image}
      />

      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{arena.name}</Text>
          <Text style={styles.type}>{arena.type.toUpperCase()}</Text>
        </View>
        <Text style={styles.rating}>⭐ {arena.rating}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Pricing & Availability</Text>
        <Text style={styles.price}>₹{arena.pricing}/hour</Text>
        <Text style={styles.distance}>{arena.distance} away</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Amenities</Text>
        <View style={styles.amenities}>
          {['Pavilion', 'Floodlights', 'Parking', 'Changing Rooms'].map((amenity) => (
            <View key={amenity} style={styles.amenityTag}>
              <Text style={styles.amenityText}>{amenity}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Available Slots</Text>
        <Text style={styles.slots}>06:00 - 22:00 (Daily)</Text>
      </View>

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => {
          console.log('Book Now clicked for:', arena?.name);
          navigation.navigate('Booking', { arena });
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.bookButtonText}>📅 Book Now</Text>
      </TouchableOpacity>

      {/* Bottom padding to ensure button is visible */}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  image: {
    width: '100%',
    height: 250,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  type: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  rating: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
  },
  distance: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  amenities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityTag: {
    backgroundColor: colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amenityText: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  slots: {
    fontSize: 14,
    color: colors.text.primary,
  },
  bookButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 10,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
