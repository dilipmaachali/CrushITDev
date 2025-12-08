import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  HomeScreen,
  ArenasScreen,
  ArenaDetailsScreen,
  BookingScreen,
  ShopScreen,
  PetCareScreen,
  CommunityScreen,
  ProfileScreen,
  SettingsScreen,
  NotificationsScreen,
  ChatScreen,
  LoginSignupScreen,
  SplashScreen,
  ScoringScreen,
  ScoreEntryScreen,
  GameSummaryScreen,
} from '@/screens';
import { FloatingChat } from '@/components';
import { colors } from '@/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="LoginSignup"
        component={LoginSignupScreen}
      />
    </Stack.Navigator>
  );
}

// Arenas Stack
function ArenasStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="ArenasList"
        component={ArenasScreen}
        options={{ headerTitle: 'Arenas' }}
      />
      <Stack.Screen
        name="ArenaDetails"
        component={ArenaDetailsScreen}
        options={{ headerTitle: 'Arena Details' }}
      />
      <Stack.Screen
        name="Booking"
        component={BookingScreen}
        options={{ headerTitle: 'Book Arena' }}
      />
    </Stack.Navigator>
  );
}

// Shop Stack
function ShopStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="ShopList"
        component={ShopScreen}
        options={{ headerTitle: 'Sports Shop' }}
      />
    </Stack.Navigator>
  );
}

// PetCare Stack
function PetCareStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="PetCareList"
        component={PetCareScreen}
        options={{ headerTitle: 'Pet Care' }}
      />
    </Stack.Navigator>
  );
}

// Scoring Stack
function ScoringStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="Scoring"
        component={ScoringScreen}
        options={{ headerTitle: 'Score Tracking' }}
      />
      <Stack.Screen
        name="ScoreEntry"
        component={ScoreEntryScreen}
        options={{ headerTitle: 'Score Entry' }}
      />
      <Stack.Screen
        name="GameSummary"
        component={GameSummaryScreen}
        options={{ headerTitle: 'Game Summary' }}
      />
    </Stack.Navigator>
  );
}

// Profile Stack
function ProfileStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="ProfileView"
        component={ProfileScreen}
        options={{ headerTitle: 'Profile' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ headerTitle: 'Settings' }}
      />
    </Stack.Navigator>
  );
}

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarStyle: {
          paddingBottom: 5,
          height: 60,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Icon name="🏠" color={color} />,
        }}
      />
      <Tab.Screen
        name="ArenasTab"
        component={ArenasStack}
        options={{
          tabBarLabel: 'Arenas',
          tabBarIcon: ({ color }) => <Icon name="📍" color={color} />,
        }}
      />
      <Tab.Screen
        name="ScoringTab"
        component={ScoringStack}
        options={{
          tabBarLabel: 'Scores',
          tabBarIcon: ({ color }) => <Icon name="📊" color={color} />,
        }}
      />
      <Tab.Screen
        name="ShopTab"
        component={ShopStack}
        options={{
          tabBarLabel: 'Shop',
          tabBarIcon: ({ color }) => <Icon name="🛍️" color={color} />,
        }}
      />
      <Tab.Screen
        name="PetCareTab"
        component={PetCareStack}
        options={{
          tabBarLabel: 'PetCare',
          tabBarIcon: ({ color }) => <Icon name="🐾" color={color} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Icon name="👤" color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Main Navigator with Floating Chat Overlay
function MainNavigatorWithChat() {
  return (
    <View style={{ flex: 1 }}>
      <TabNavigator />
      <FloatingChat />
    </View>
  );
}

// Root Navigator with Auth and Modal Stack
export default function RootNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      // First check for existing token
      const token = await AsyncStorage.getItem('userToken');
      
      // If no token exists, set a dev mode token for testing
      if (!token) {
        const devToken = 'dev-test-token';
        await AsyncStorage.setItem('userToken', devToken);
        await AsyncStorage.setItem('userEmail', 'test@crushit.app');
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(true);
      }
    } catch (e) {
      console.error('Failed to restore token', e);
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {isLoggedIn ? (
        <Stack.Group>
          <Stack.Screen name="MainApp" component={MainNavigatorWithChat} />
          <Stack.Group screenOptions={{ presentation: 'modal' }}>
            <Stack.Screen
              name="Community"
              component={CommunityScreen}
              options={{
                headerShown: true,
                headerTitle: 'Community',
                headerTintColor: colors.primary,
              }}
            />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Notifications',
                headerTintColor: colors.primary,
              }}
            />
          </Stack.Group>
        </Stack.Group>
      ) : (
        <Stack.Group>
          <Stack.Screen name="Auth" component={AuthStack} />
        </Stack.Group>
      )}
    </Stack.Navigator>
  );
}

// Icon component
function Icon({ name }: { name: string; color: string }) {
  return <Text style={{ fontSize: 18 }}>{name}</Text>;
}
