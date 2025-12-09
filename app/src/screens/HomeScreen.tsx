import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '@/theme';

const { width } = Dimensions.get('window');

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  gradient: string[];
  screen: string;
}

export default function HomeScreen({ navigation }: any) {
  const [userName, setUserName] = useState('User');

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
      description: 'Create & join games, find players, manage tournaments',
      icon: '🎮',
      gradient: ['#667eea', '#764ba2'],
      screen: 'GamesTab'
    },
    {
      id: 'arenas',
      title: 'Find Arenas',
      description: 'Book sports venues near you with instant confirmation',
      icon: '📍',
      gradient: ['#f093fb', '#f5576c'],
      screen: 'ArenasTab'
    },
    {
      id: 'scoring',
      title: 'Live Scoring',
      description: 'Track scores, view leaderboards & tournament stats',
      icon: '📊',
      gradient: ['#4facfe', '#00f2fe'],
      screen: 'ScoringTab'
    },
    {
      id: 'shop',
      title: 'Sports Shop',
      description: 'Buy sports equipment, apparel & accessories',
      icon: '🛍️',
      gradient: ['#43e97b', '#38f9d7'],
      screen: 'ShopTab'
    },
    {
      id: 'petcare',
      title: 'Pet Care',
      description: 'Book grooming, vet & boarding services for your pets',
      icon: '🐾',
      gradient: ['#fa709a', '#fee140'],
      screen: 'PetCareTab'
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
      onPress={() => navigation.navigate(service.screen)}
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
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{userName} 👋</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('ProfileTab')}
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
  },
  servicesContainer: {
    gap: 16,
  },
  serviceCard: {
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  serviceGradient: {
    padding: 20,
  },
  serviceContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  serviceTextContainer: {
    flex: 1,
  },
  serviceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.95,
    lineHeight: 20,
  },
  serviceArrow: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 12,
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
