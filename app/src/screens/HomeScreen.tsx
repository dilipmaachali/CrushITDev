import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  FlatList,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme';

const { width } = Dimensions.get('window');

// Carousel dimensions: 2.5:1 aspect ratio (1280x500 desktop, 1080x420 mobile)
const CAROUSEL_WIDTH = width - 32; // 16px padding on each side
const CAROUSEL_HEIGHT = CAROUSEL_WIDTH / 2.5; // 2.5:1 aspect ratio
const SAFE_ZONE_HORIZONTAL = CAROUSEL_WIDTH * 0.1; // 10% safe zone on each side
const SAFE_ZONE_VERTICAL = CAROUSEL_HEIGHT * 0.15; // 15% safe zone top/bottom

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string[];
  screen: string;
  screenParams?: any;
}

export default function HomeScreen({ navigation }: any) {
  const [userName, setUserName] = useState('User');
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<FlatList>(null);

  const sportsCarousel = [
    { id: '1', image: require('../../public/cricket-batsman.jpeg'), name: 'Cricket' },
    { id: '2', image: require('../../public/Badminton.jpg'), name: 'Badminton' },
    { id: '3', image: require('../../public/PickleBall.jpeg'), name: 'PickleBall' },
    { id: '4', image: require('../../public/football.jpeg'), name: 'Football' },
  ];

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

  const services: ServiceCard[] = [
    {
      id: 'games',
      title: 'Game Management',
      description: 'Create & join games',
      icon: '🎮',
      gradient: ['#5E35B1', '#7E57C2'],
      screen: 'GamesTab'
    },
    {
      id: 'arenas',
      title: 'Find Arenas',
      description: 'Book sports venues',
      icon: '📍',
      gradient: ['#D32F2F', '#F44336'],
      screen: 'ArenasTab'
    },
    {
      id: 'scoring',
      title: 'Live Scoring',
      description: 'Track scores & stats',
      icon: '📊',
      gradient: ['#0277BD', '#0288D1'],
      screen: 'ScoringTab'
    },
    {
      id: 'shop',
      title: 'Sports Shop',
      description: 'Buy equipment',
      icon: '🛍️',
      gradient: ['#00897B', '#26A69A'],
      screen: 'MoreTab',
      screenParams: { screen: 'Shop' }
    },
    {
      id: 'petcare',
      title: 'Pet Care',
      description: 'Grooming & vet services',
      icon: '🐾',
      gradient: ['#F57C00', '#FB8C00'],
      screen: 'MoreTab',
      screenParams: { screen: 'PetCare' }
    }
  ];

  const quickActions = [
    { id: 'create-game', label: 'Create Game', icon: '➕', action: () => navigation.navigate('GamesTab', { screen: 'CreateGame' }) },
    { id: 'find-players', label: 'Find Players', icon: '👥', action: () => navigation.navigate('GamesTab', { screen: 'FindPlayers' }) },
    { id: 'book-arena', label: 'Book Arena', icon: '🏟️', action: () => navigation.navigate('ArenasTab') },
    { id: 'view-scores', label: 'View Scores', icon: '🏆', action: () => navigation.navigate('ScoringTab') },
  ];

  const renderServiceCard = (service: ServiceCard) => (
    <TouchableOpacity
      key={service.id}
      style={styles.serviceCard}
      onPress={() => {
        if ('screenParams' in service && service.screenParams) {
          navigation.navigate(service.screen, service.screenParams);
        } else {
          navigation.navigate(service.screen);
        }
      }}
      activeOpacity={0.8}
      accessible={true}
      accessibilityLabel={`${service.title}: ${service.description}`}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={service.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.serviceGradient}
      >
        <View style={styles.serviceContent}>
          <Text style={styles.serviceIcon}>{service.icon}</Text>
          <View style={styles.serviceTextContainer}>
            <Text style={styles.serviceTitle}>{service.title}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
          </View>
          <Text style={styles.serviceArrow}>→</Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderQuickAction = (action: typeof quickActions[0]) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionCard}
      onPress={action.action}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={action.label}
      accessibilityRole="button"
    >
      <Text style={styles.quickActionIcon}>{action.icon}</Text>
      <Text style={styles.quickActionLabel}>{action.label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>CrushIT here,</Text>
          <Text style={styles.userName}>{userName} 👋</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('MoreTab', { screen: 'Profile' })}
          accessible={true}
          accessibilityLabel="Go to profile"
          accessibilityRole="button"
        >
          <Text style={styles.profileIcon}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.quickActionsScroll}
          contentContainerStyle={styles.quickActionsContent}
        >
          {quickActions.map(renderQuickAction)}
        </ScrollView>
      </View>

      {/* Sports Carousel */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Popular Sports</Text>
        <View style={styles.carouselContainer}>
          <FlatList
            ref={carouselRef}
            data={sportsCarousel}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            onMomentumScrollEnd={(event) => {
              const slideIndex = Math.round(
                event.nativeEvent.contentOffset.x / CAROUSEL_WIDTH
              );
              setActiveSlide(slideIndex);
            }}
            renderItem={({ item }) => (
              <View style={styles.carouselSlide}>
                <Image
                  source={item.image}
                  style={styles.carouselImage}
                  resizeMode="cover"
                />
                {/* Dark gradient overlay for better text readability */}
                <LinearGradient
                  colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                  style={styles.carouselGradient}
                />
                {/* Safe text zone - centered with margins */}
                <View style={styles.carouselTextZone}>
                  <Text style={styles.carouselTitle}>{item.name}</Text>
                  <Text style={styles.carouselSubtitle}>Book Now & Play</Text>
                  <TouchableOpacity 
                    style={styles.carouselCTA}
                    onPress={() => navigation.navigate('ArenasTab')}
                  >
                    <Text style={styles.carouselCTAText}>Explore Arenas</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <View style={styles.paginationContainer}>
            {sportsCarousel.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeSlide && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Services */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Our Services</Text>
        <Text style={styles.sectionSubtitle}>Everything you need for sports & pets</Text>
        <View style={styles.servicesContainer}>
          {services.map(renderServiceCard)}
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>500+</Text>
          <Text style={styles.statLabel}>Arenas</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>10K+</Text>
          <Text style={styles.statLabel}>Players</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>50K+</Text>
          <Text style={styles.statLabel}>Games</Text>
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 4,
  },
  profileButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileIcon: {
    fontSize: 24,
  },
  sectionContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  quickActionsScroll: {
    marginHorizontal: -20,
  },
  quickActionsContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: colors.surface,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    minWidth: 85,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 26,
    marginBottom: 6,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  carouselContainer: {
    marginBottom: 10,
    marginHorizontal: -4, // Compensate for slide margins
  },
  carouselSlide: {
    width: CAROUSEL_WIDTH,
    height: CAROUSEL_HEIGHT,
    marginHorizontal: 4,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  carouselImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  carouselGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  carouselTextZone: {
    position: 'absolute',
    left: SAFE_ZONE_HORIZONTAL,
    right: SAFE_ZONE_HORIZONTAL,
    bottom: SAFE_ZONE_VERTICAL,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carouselTitle: {
    fontSize: Math.max(28, CAROUSEL_WIDTH * 0.065), // Responsive font size
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  carouselSubtitle: {
    fontSize: Math.max(14, CAROUSEL_WIDTH * 0.035), // Responsive font size
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.95,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  carouselCTA: {
    backgroundColor: colors.primary,
    paddingHorizontal: Math.max(24, CAROUSEL_WIDTH * 0.06),
    paddingVertical: Math.max(12, CAROUSEL_HEIGHT * 0.06),
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
    minWidth: 140,
  },
  carouselCTAText: {
    color: '#FFFFFF',
    fontSize: Math.max(15, CAROUSEL_WIDTH * 0.038), // Responsive font size
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  paginationDotActive: {
    backgroundColor: colors.primary,
    width: 24,
  },
  servicesContainer: {
    gap: 16,
  },
  serviceCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  serviceGradient: {
    padding: 16,
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 40,
    marginRight: 14,
  },
  serviceTextContainer: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#FFFFFF',
    opacity: 0.95,
    lineHeight: 18,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  serviceArrow: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 30,
    paddingHorizontal: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});
