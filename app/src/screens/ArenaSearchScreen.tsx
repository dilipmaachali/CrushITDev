import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native';
import axios from 'axios';
import { API_CONFIG } from '@/config/api';
import { colors } from '@/theme';

interface Arena {
  id: string;
  name: string;
  type: string;
  description: string;
  location: { address: string };
  pricing: number;
  rating: number;
  reviews: number;
  amenities: string[];
}

export default function ArenaSearchScreen({ navigation }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [arenas, setArenas] = useState<Arena[]>([]);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const arenaTypes = ['cricket', 'football', 'badminton', 'tennis', 'basketball', 'squash'];

  useEffect(() => {
    loadArenas();
  }, []);

  const loadArenas = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/arenas`);
      setArenas(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load arenas');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      let query = `${API_CONFIG.BASE_URL}/arenas/search?`;

      if (searchQuery) query += `search=${searchQuery}&`;
      if (minPrice) query += `minPrice=${minPrice}&`;
      if (maxPrice) query += `maxPrice=${maxPrice}&`;
      if (minRating) query += `minRating=${minRating}&`;
      if (selectedType) query += `type=${selectedType}&`;
      if (sortBy) query += `sortBy=${sortBy}`;

      const response = await axios.get(query);
      setArenas(response.data);
      setShowFilters(false);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSelectedType('');
    setSortBy('rating');
    loadArenas();
  };

  const renderArenaCard = ({ item }: { item: Arena }) => (
    <TouchableOpacity
      style={styles.arenaCard}
      onPress={() => navigation.navigate('ArenaDetails', { arena: item })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardContent}>
          <Text style={styles.arenaName}>{item.name}</Text>
          <Text style={styles.arenaType}>{item.type.toUpperCase()}</Text>
          <Text style={styles.arenaAddress}>{item.location.address}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <Text style={styles.ratingValue}>⭐ {item.rating}</Text>
          <Text style={styles.ratingCount}>({item.reviews})</Text>
        </View>
      </View>

      <Text style={styles.description} numberOfLines={2}>
        {item.description}
      </Text>

      <View style={styles.amenities}>
        {item.amenities?.slice(0, 2).map((amenity, idx) => (
          <View key={idx} style={styles.amenityBadge}>
            <Text style={styles.amenityText}>{amenity}</Text>
          </View>
        ))}
        {item.amenities?.length > 2 && (
          <View style={styles.amenityBadge}>
            <Text style={styles.amenityText}>+{item.amenities.length - 2}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.price}>₹{item.pricing}/hour</Text>
        <TouchableOpacity style={styles.bookButton}>
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchHeader}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search arenas..."
          placeholderTextColor={colors.grey}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => setShowFilters(!showFilters)}>
          <Text style={styles.filterIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Section */}
      {showFilters && (
        <ScrollView style={styles.filterSection} showsVerticalScrollIndicator={false}>
          {/* Price Range */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Price Range (₹)</Text>
            <View style={styles.priceRange}>
              <TextInput
                style={styles.filterInput}
                placeholder="Min"
                placeholderTextColor={colors.grey}
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
              />
              <Text style={styles.priceSeparator}>-</Text>
              <TextInput
                style={styles.filterInput}
                placeholder="Max"
                placeholderTextColor={colors.grey}
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Rating */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Minimum Rating</Text>
            <View style={styles.ratingRange}>
              {['3', '3.5', '4', '4.5', '5'].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[
                    styles.ratingButton,
                    minRating === rating && styles.ratingButtonActive,
                  ]}
                  onPress={() => setMinRating(rating)}
                >
                  <Text
                    style={[
                      styles.ratingButtonText,
                      minRating === rating && styles.ratingButtonTextActive,
                    ]}
                  >
                    ⭐ {rating}+
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Arena Type */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Arena Type</Text>
            <View style={styles.typeGrid}>
              {arenaTypes.map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.typeButton,
                    selectedType === type && styles.typeButtonActive,
                  ]}
                  onPress={() => setSelectedType(selectedType === type ? '' : type)}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      selectedType === type && styles.typeButtonTextActive,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort By */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Sort By</Text>
            <View style={styles.sortOptions}>
              {['rating', 'price-asc', 'price-desc'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.sortButton,
                    sortBy === option && styles.sortButtonActive,
                  ]}
                  onPress={() => setSortBy(option)}
                >
                  <Text
                    style={[
                      styles.sortButtonText,
                      sortBy === option && styles.sortButtonTextActive,
                    ]}
                  >
                    {option === 'rating' && '⭐ Highest Rated'}
                    {option === 'price-asc' && '💰 Price: Low to High'}
                    {option === 'price-desc' && '💰 Price: High to Low'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.filterActions}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
              <Text style={styles.searchButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* Results */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={arenas}
          renderItem={renderArenaCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No arenas found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.black,
    backgroundColor: colors.lightBackground,
  },
  filterButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  filterIcon: {
    fontSize: 18,
  },
  filterSection: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
    maxHeight: 400,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterGroup: {
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.grey,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  priceRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: colors.black,
    backgroundColor: colors.lightBackground,
  },
  priceSeparator: {
    color: colors.grey,
    fontWeight: '600',
  },
  ratingRange: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  ratingButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    backgroundColor: colors.white,
  },
  ratingButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  ratingButtonText: {
    fontSize: 12,
    color: colors.black,
    fontWeight: '500',
  },
  ratingButtonTextActive: {
    color: colors.white,
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    backgroundColor: colors.white,
    flex: 0.45,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 12,
    color: colors.black,
    fontWeight: '500',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  sortOptions: {
    gap: 6,
  },
  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    backgroundColor: colors.white,
  },
  sortButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sortButtonText: {
    fontSize: 12,
    color: colors.black,
    fontWeight: '500',
  },
  sortButtonTextActive: {
    color: colors.white,
  },
  filterActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  resetButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  searchButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  searchButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  arenaCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardContent: {
    flex: 1,
  },
  arenaName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
    marginBottom: 2,
  },
  arenaType: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 4,
  },
  arenaAddress: {
    fontSize: 12,
    color: colors.grey,
  },
  ratingBadge: {
    alignItems: 'center',
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  ratingCount: {
    fontSize: 11,
    color: colors.grey,
  },
  description: {
    fontSize: 13,
    color: colors.grey,
    marginBottom: 8,
    lineHeight: 18,
  },
  amenities: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  amenityBadge: {
    backgroundColor: colors.lightBackground,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  amenityText: {
    fontSize: 11,
    color: colors.grey,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.lightGrey,
    paddingTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  bookButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  bookButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    color: colors.grey,
  },
});
