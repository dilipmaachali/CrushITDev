import React, { useState } from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
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
  CricketScoringScreen,
  CricketMatchSetupScreen,
  BadmintonScoringScreen,
  BadmintonMatchSetupScreen,
  FootballScoringScreen,
  FootballMatchSetupScreen,
  GamesScreen,
  CreateGameScreen,
  EditGameScreen,
  ManagePlayersScreen,
  FindPlayersScreen,
  MoreScreen,
} from '@/screens';
import { FloatingChat } from '@/components';
import { GalaxyBackground } from '@/components/GalaxyBackground';
import { useTheme } from '@/contexts/ThemeContext';
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

// Games Stack (New feature)
function GamesStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="GamesList"
        component={GamesScreen}
        options={{ headerTitle: 'Scheduled Games' }}
      />
      <Stack.Screen
        name="CreateGame"
        component={CreateGameScreen}
        options={{ headerTitle: 'Create Game' }}
      />
      <Stack.Screen
        name="EditGame"
        component={EditGameScreen}
        options={{ headerTitle: 'Edit Game' }}
      />
      <Stack.Screen
        name="CricketScoring"
        component={CricketScoringScreen}
        options={{ headerTitle: 'Cricket Scoring' }}
      />
      <Stack.Screen
        name="CricketMatchSetup"
        component={CricketMatchSetupScreen}
        options={{ headerTitle: 'Match Setup' }}
      />
      <Stack.Screen
        name="BadmintonScoring"
        component={BadmintonScoringScreen}
        options={{ headerTitle: 'Badminton Scoring' }}
      />
      <Stack.Screen
        name="BadmintonMatchSetup"
        component={BadmintonMatchSetupScreen}
        options={{ headerTitle: 'Badminton Setup' }}
      />
      <Stack.Screen
        name="FootballScoring"
        component={FootballScoringScreen}
        options={{ headerTitle: 'Football Scoring' }}
      />
      <Stack.Screen
        name="FootballMatchSetup"
        component={FootballMatchSetupScreen}
        options={{ headerTitle: 'Football Setup' }}
      />
      <Stack.Screen
        name="ManagePlayers"
        component={ManagePlayersScreen}
        options={{ headerTitle: 'Manage Players' }}
      />
      <Stack.Screen
        name="FindPlayers"
        component={FindPlayersScreen}
        options={{ headerTitle: 'Find Players' }}
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

// More Stack (New - consolidates Shop, PetCare, Profile)
function MoreStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerBackTitleVisible: false,
        headerTintColor: colors.primary,
      }}
    >
      <Stack.Screen
        name="MoreList"
        component={MoreScreen}
        options={{ headerTitle: 'More' }}
      />
      <Stack.Screen
        name="Shop"
        component={ShopScreen}
        options={{ headerTitle: 'Sports Shop' }}
      />
      <Stack.Screen
        name="PetCare"
        component={PetCareScreen}
        options={{ headerTitle: 'Pet Care' }}
      />
      <Stack.Screen
        name="Profile"
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
        name="GamesTab"
        component={GamesStack}
        options={{
          tabBarLabel: 'Games',
          tabBarIcon: ({ color }) => <Icon name="🎮" color={color} />,
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
        name="MoreTab"
        component={MoreStack}
        options={{
          tabBarLabel: 'More',
          tabBarIcon: ({ color }) => <Icon name="⋮" color={color} />,
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
export default function RootNavigator({ initialRouteName }: { initialRouteName?: string }) {
  const [showSplash, setShowSplash] = useState(true);
  const { galaxyThemeEnabled } = useTheme();

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  if (showSplash) {
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  const isLoggedIn = initialRouteName === 'MainApp';

  console.log('[RootNavigator] Rendering with galaxyThemeEnabled:', galaxyThemeEnabled);
  console.log('[RootNavigator] Initial route:', initialRouteName, 'isLoggedIn:', isLoggedIn);
  
  return (
    <View style={{ flex: 1 }}>
      {galaxyThemeEnabled && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <GalaxyBackground />
        </View>
      )}
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
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
    </View>
  );
}

// Icon component
function Icon({ name }: { name: string; color: string }) {
  return <Text style={{ fontSize: 18 }}>{name}</Text>;
}
