import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  AccessibilityInfo,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  AccessibilityInfo,
  FlatList,
  Image,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');
import { colors } from '@/theme';
import { Chip } from '@/components';

export default function HomeScreen({ navigation }: any) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    loadUserName();
  }, []);

  // Reload user name when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserName();
    }, [])
  );

  const loadUserName = async () => {
    try {
      const name = await AsyncStorage.getItem('userName');
      if (name) {
        setUserName(name);
      }
    } catch (error) {
      console.log('Error loading user name:', error);
    }
  };

  const mockArenas = [
    {
      id: '1',
      name: 'Elite Cricket Turf',
      type: 'cricket',
      pricing: 500,
      rating: 4.8,
      distance: '2.5 km',
      reviews: 142,
      amenities: ['Pavilion', 'Floodlights', 'Parking'],
    },
    {
      id: '2',
      name: 'Urban Football Arena',
      type: 'football',
      pricing: 800,
      rating: 4.5,
      distance: '3.1 km',
      reviews: 89,
      amenities: ['Floodlights', 'Cafeteria', 'Parking'],
    },
    {
      id: '3',
      name: 'Badminton Palace',
      type: 'badminton',
      pricing: 400,
      rating: 4.7,
      distance: '1.2 km',
      reviews: 156,
      amenities: ['AC Courts', 'Coaching'],
    },
  ];

  const arenaCategories = [
    { id: 'all', label: 'All', emoji: '⚽' },
    { id: 'cricket', label: 'Cricket', emoji: '🏏' },
    { id: 'football', label: 'Football', emoji: '⚽' },
    { id: 'badminton', label: 'Badminton', emoji: '🏸' },
    { id: 'tennis', label: 'Tennis', emoji: '🎾' },
    { id: 'basketball', label: 'Basketball', emoji: '🏀' },
  ];

  const offers = [
    { id: '1', title: '50% OFF', subtitle: 'First Booking', code: 'CRUSH50', color: colors.primary },
    { id: '2', title: 'Free Slot', subtitle: 'Weekend', code: 'WEEKEND', color: colors.secondary },
    { id: '3', title: 'Double Points', subtitle: 'All Arenas', code: 'POINTS2X', color: colors.accent },
  ];

  const gamePreviews = [
    { id: 'cricket', name: 'Cricket', emoji: '🏏', image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop', color: '#FFB800' },
    { id: 'badminton', name: 'Badminton', emoji: '🏸', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=600&fit=crop', color: '#00C9A7' },
    { id: 'football', name: 'Football', emoji: '⚽', image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=800&h=600&fit=crop', color: '#EF4F5F' },
    { id: 'tennis', name: 'Tennis', emoji: '🎾', image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&h=600&fit=crop', color: '#3D5AFE' },
    { id: 'basketball', name: 'Basketball', emoji: '🏀', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop', color: '#FF6F00' },
  ];

  const gameCarouselRef = useRef<FlatList>(null);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGameIndex((prev) => {
        const nextIndex = (prev + 1) % gamePreviews.length;
        gameCarouselRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const recentBookings = [
    { id: '1', arena: 'Elite Cricket Turf', type: 'cricket', date: 'Today, 6:00 PM', status: 'upcoming', emoji: '🏏' },
    { id: '2', arena: 'Badminton Palace', type: 'badminton', date: 'Yesterday', status: 'completed', emoji: '🏸' },
    { id: '3', arena: 'Urban Football Arena', type: 'football', date: 'Dec 6, 2025', status: 'completed', emoji: '⚽' },
  ];

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Navigate to arenas tab with filter if not 'all'
    if (categoryId !== 'all') {
      navigation.navigate('ArenasTab', { 
        screen: 'ArenasList',
        params: { gameType: categoryId }
      });
    }
  };

  const handleSearchPress = () => {
    navigation.navigate('ArenasTab', { screen: 'ArenasList' });
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      accessibilityRole="list"
    >
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View>
          <Text 
            style={styles.greeting}
            accessibilityRole="header"
            accessibilityLiveRegion="polite"
          >
            Hello, {userName} 👋
          </Text>
          <Text style={styles.subtitle}>What would you like to play today?</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationIcon}
          onPress={() => navigation.navigate('Notifications')}
          accessible={true}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
          accessibilityHint="Double tap to view notifications"
        >
          <Text style={styles.notificationBadge}>🔔</Text>
          <View style={styles.badge} />
        </TouchableOpacity>
      </View>

      {/* Category Filter - Horizontal */}
      <View 
        style={styles.categoriesContainer}
        accessible={true}
        accessibilityRole="list"
        accessibilityLabel="Category filters"
      >
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          scrollEventThrottle={16}
        >
          {arenaCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
              ]}
              onPress={() => handleCategoryPress(category.id)}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel={`${category.label} category`}
              accessibilityState={{ selected: selectedCategory === category.id }}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text 
                style={[
                  styles.categoryLabel,
                  selectedCategory === category.id && styles.categoryLabelActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Popular Games Carousel */}
      <View style={styles.section}>
        <Text 
          style={styles.sectionTitle}
          accessibilityRole="header"
        >
          Popular Games
        </Text>
        <View style={styles.carouselContainer}>
          <FlatList
            ref={gameCarouselRef}
            data={gamePreviews}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.carouselItem}
                onPress={() => handleCategoryPress(item.id)}
                activeOpacity={0.9}
              >
                <Image source={{ uri: item.image }} style={styles.carouselImage} />
                <View style={styles.carouselOverlay}>
                  <Text style={styles.carouselEmoji}>{item.emoji}</Text>
                  <Text style={styles.carouselName}>{item.name}</Text>
                </View>
              </TouchableOpacity>
            )}
            onScrollToIndexFailed={() => {}}
          />
          <View style={styles.paginationDots}>
            {gamePreviews.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentGameIndex && styles.activeDot,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Recent Bookings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text 
            style={styles.sectionTitle}
            accessibilityRole="header"
          >
            Recent Activity
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ProfileTab')}
            accessible={true}
            accessibilityLabel="View all bookings"
            accessibilityRole="button"
          >
            <Text style={styles.viewAll}>View All →</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.recentActivityScroll}>
          {recentBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingIconContainer}>
                <Text style={styles.bookingEmoji}>{booking.emoji}</Text>
              </View>
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingArena} numberOfLines={2}>{booking.arena}</Text>
                <Text style={styles.bookingDate}>{booking.date}</Text>
              </View>
              <View style={[
                styles.bookingStatus,
                booking.status === 'upcoming' ? styles.statusUpcoming : styles.statusCompleted
              ]}>
                <Text style={[
                  styles.bookingStatusText,
                  booking.status === 'upcoming' ? styles.statusUpcomingText : styles.statusCompletedText
                ]}>
                  {booking.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Quick Access */}
      <View style={styles.section}>
        <Text 
          style={styles.sectionTitle}
          accessibilityRole="header"
        >
          Quick Access
        </Text>
        <View 
          style={styles.quickActions}
          accessible={true}
          accessibilityRole="list"
        >
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Community')}
            accessible={true}
            accessibilityLabel="Community"
            accessibilityRole="button"
            accessibilityHint="Double tap to view community"
          >
            <Text style={styles.quickActionIcon}>👥</Text>
            <Text style={styles.quickActionText}>Community</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('ProfileTab')}
            accessible={true}
            accessibilityLabel="My Bookings"
            accessibilityRole="button"
            accessibilityHint="Double tap to view your bookings"
          >
            <Text style={styles.quickActionIcon}>📅</Text>
            <Text style={styles.quickActionText}>Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('ShopTab')}
            accessible={true}
            accessibilityLabel="Shop"
            accessibilityRole="button"
            accessibilityHint="Double tap to view shop"
          >
            <Text style={styles.quickActionIcon}>🛍️</Text>
            <Text style={styles.quickActionText}>Shop</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom padding */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },

  greeting: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 4,
    fontWeight: '500',
  },

  notificationIcon: {
    position: 'relative',
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  notificationBadge: {
    fontSize: 24,
  },

  badge: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
    top: 8,
    right: 8,
  },

  // Location
  locationSection: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  locationButton: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  locationIcon: {
    fontSize: 20,
    marginRight: 10,
  },

  locationContent: {
    flex: 1,
  },

  locationLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '500',
  },

  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: 2,
  },

  locationArrow: {
    fontSize: 16,
    color: colors.text.tertiary,
  },

  // Search
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    minHeight: 44,
  },

  searchIcon: {
    fontSize: 16,
    marginRight: 10,
    color: colors.text.secondary,
  },

  searchInput: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 14,
    fontWeight: '500',
    paddingVertical: 10,
  },

  filterIcon: {
    fontSize: 16,
    marginLeft: 10,
  },

  // Categories
  categoriesContainer: {
    marginBottom: 16,
  },

  categoriesScroll: {
    paddingHorizontal: 12,
  },

  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
    minHeight: 40,
  },

  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  categoryEmoji: {
    fontSize: 14,
    marginRight: 6,
  },

  categoryLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text.secondary,
  },

  categoryLabelActive: {
    color: colors.text.inverse,
  },

  // Banner
  bannerContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  featureBanner: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 80,
  },

  bannerContent: {
    flex: 1,
  },

  bannerTag: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.text.inverse,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },

  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.inverse,
    marginBottom: 4,
  },

  bannerDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },

  bannerIcon: {
    fontSize: 32,
    marginLeft: 12,
  },

  // Section
  section: {
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: -0.3,
  },

  viewAll: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },

  // Offers
  offerCard: {
    borderRadius: 8,
    padding: 16,
    marginRight: 12,
    minWidth: 150,
    justifyContent: 'center',
    minHeight: 80,
  },

  offerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.inverse,
    letterSpacing: -0.5,
  },

  offerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 4,
    fontWeight: '500',
  },

  offerCode: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },

  // Quick Actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  quickAction: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: 'center',
    marginHorizontal: 4,
    minHeight: 80,
    justifyContent: 'center',
  },

  quickActionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },

  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    textAlign: 'center',
  },

  // Bottom padding
  bottomPadding: {
    height: 24,
  },

  // Game Carousel
  carouselContainer: {
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },

  carouselItem: {
    width: width - 32,
    height: 200,
    position: 'relative',
  },

  carouselImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },

  carouselOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  carouselEmoji: {
    fontSize: 32,
    marginRight: 12,
  },

  carouselName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
    gap: 6,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },

  activeDot: {
    backgroundColor: colors.primary,
    width: 24,
  },

  // Game Previews (old styles kept for compatibility)
  gamePreviewsContainer: {
    gap: 12,
  },

  gamePreviewCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderColor: colors.border,
    marginBottom: 8,
  },

  gamePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  gamePreviewEmoji: {
    fontSize: 32,
    marginRight: 12,
  },

  gamePreviewInfo: {
    flex: 1,
  },

  gamePreviewName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 2,
  },

  gamePreviewMeta: {
    fontSize: 13,
    color: colors.text.secondary,
  },

  gamePreviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  gamePreviewPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },

  gamePreviewArrow: {
    fontSize: 24,
    color: colors.text.tertiary,
  },

  // Recent Bookings
  recentActivityScroll: {
    marginLeft: -16,
    paddingLeft: 16,
  },

  bookingCard: {
    flexDirection: 'column',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    marginRight: 12,
    borderWidth: 2,
    borderColor: colors.border,
    width: 200,
    minHeight: 150,
  },

  bookingIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    alignSelf: 'center',
  },

  bookingEmoji: {
    fontSize: 32,
  },

  bookingInfo: {
    flex: 1,
    marginBottom: 8,
  },

  bookingArena: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 6,
    textAlign: 'center',
  },

  bookingDate: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
  },

  bookingStatus: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'center',
  },

  statusUpcoming: {
    backgroundColor: colors.accent + '20',
  },

  statusCompleted: {
    backgroundColor: colors.text.tertiary + '20',
  },

  bookingStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  statusUpcomingText: {
    color: colors.accent,
  },

  statusCompletedText: {
    color: colors.text.secondary,
  },
});
