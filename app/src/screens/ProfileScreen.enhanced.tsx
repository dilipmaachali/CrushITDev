import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';

export default function ProfileScreen({ navigation }: any) {
  const [userName] = useState('Test User');
  const [userEmail] = useState('test@crushit.app');
  const [userPhone] = useState('+91 9876543210');

  const menuSections = [
    {
      title: 'My Activity',
      items: [
        {
          icon: '📅',
          title: 'My Bookings',
          subtitle: 'View and manage your bookings',
          onPress: () => Alert.alert('My Bookings', 'Your booking history will appear here'),
        },
        {
          icon: '🎮',
          title: 'Recent Games',
          subtitle: 'Games you played recently',
          onPress: () => Alert.alert('Recent Games', 'Your recent games will appear here'),
        },
      ],
    },
    {
      title: 'Partners & Rewards',
      items: [
        {
          icon: '🤝',
          title: 'Your Partners',
          subtitle: 'View and manage your partners',
          onPress: () => Alert.alert('Your Partners', 'Manage your sports partners here'),
        },
        {
          icon: '🎁',
          title: 'Offers',
          subtitle: 'Available offers and discounts',
          onPress: () => Alert.alert('Offers', 'CRUSH50 - 50% off first booking\nWEEKEND - Free weekend slot\nPOINTS2X - Double points'),
        },
        {
          icon: '💰',
          title: 'Invite & Earn',
          subtitle: 'Refer friends and earn rewards',
          onPress: () => Alert.alert('Invite & Earn', 'Share code: CRUSH2025\n\nEarn ₹500 for every friend who books!\nYour friend gets ₹200 off!'),
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          icon: '⚙️',
          title: 'Preferences & Privacy',
          subtitle: 'Manage your preferences',
          onPress: () => navigation.navigate('Settings'),
        },
        {
          icon: '❓',
          title: 'Help & Support',
          subtitle: 'Get help or contact us',
          onPress: () => Alert.alert('Help & Support', 'Email: support@crushit.app\nPhone: +91 80 1234 5678\n\nFAQ available in settings'),
        },
      ],
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Logged Out', 'You have been logged out successfully');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
        </View>
        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>
        <Text style={styles.userPhone}>{userPhone}</Text>
        
        <TouchableOpacity style={styles.editButton}>
          <Text style={styles.editButtonText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.white,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  menuArrow: {
    fontSize: 24,
    color: colors.text.tertiary,
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
  },
});
