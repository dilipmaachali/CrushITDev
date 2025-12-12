import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { colors } from '@/theme';
import { ArenaCard } from '@/components';

const mockArenas = [
  {
    id: '1',
    name: 'Elite Cricket Turf',
    type: 'cricket',
    pricing: 500,
    rating: 4.8,
    distance: '2.5 km',
    reviews: 142,
    image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop',
  },
  {
    id: '2',
    name: 'Urban Football Arena',
    type: 'football',
    pricing: 800,
    rating: 4.5,
    distance: '3.1 km',
    reviews: 89,
    image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=600&fit=crop',
  },
  {
    id: '3',
    name: 'Badminton Palace',
    type: 'badminton',
    pricing: 400,
    rating: 4.6,
    distance: '1.8 km',
    reviews: 67,
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop',
  },
  {
    id: '4',
    name: 'City Tennis Club',
    type: 'tennis',
    pricing: 600,
    rating: 4.7,
    distance: '2.2 km',
    reviews: 54,
    image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=800&h=600&fit=crop',
  },
  {
    id: '5',
    name: 'Hoops Basketball Court',
    type: 'basketball',
    pricing: 500,
    rating: 4.4,
    distance: '3.5 km',
    reviews: 38,
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop',
  },
];

export default function ArenasScreen({ route, navigation }: any) {
  const { gameType } = route.params || {};
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('Bangalore, KA');
  
  // Filter arenas by game type if provided
  let filteredArenas = gameType 
    ? mockArenas.filter(arena => arena.type === gameType)
    : mockArenas;
  
  // Filter by search query
  if (searchQuery) {
    filteredArenas = filteredArenas.filter(arena => 
      arena.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      arena.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  const displayTitle = gameType 
    ? `${gameType.charAt(0).toUpperCase() + gameType.slice(1)} Arenas`
    : 'All Arenas';
  
  return (
    <View style={styles.container}>
      {/* Location Selector */}
      <View style={styles.locationSection}>
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.locationIcon}>📍</Text>
          <View style={styles.locationContent}>
            <Text style={styles.locationLabel}>Location</Text>
            <Text style={styles.locationText}>{selectedLocation}</Text>
          </View>
          <Text style={styles.locationArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search arenas, sports..."
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={styles.clearIcon}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.title}>{displayTitle}</Text>
      <Text style={styles.subtitle}>{filteredArenas.length} courts available</Text>
      
      {filteredArenas.length > 0 ? (
        <FlatList
          data={filteredArenas}
          renderItem={({ item }) => (
            <ArenaCard 
              arena={item} 
              onPress={() => {
                console.log('[ArenasScreen] Arena card clicked:', item.name);
                navigation.navigate('ArenaDetails', { arena: item });
              }}
            />
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No {gameType} arenas found nearby</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  locationSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  locationContent: {
    flex: 1,
  },
  locationLabel: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  locationArrow: {
    fontSize: 20,
    color: colors.text.tertiary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
    padding: 0,
  },
  clearIcon: {
    fontSize: 18,
    color: colors.text.tertiary,
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
