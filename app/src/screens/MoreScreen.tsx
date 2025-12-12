import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';
import { colors } from '@/theme';

interface MenuItem {
  id: string;
  title: string;
  icon: string;
  screen?: string;
  action?: () => void;
}

export default function MoreScreen() {
  const navigation = useNavigation();
  const { galaxyThemeEnabled, toggleGalaxyTheme } = useTheme();
  
  console.log('[MoreScreen] Current galaxy theme state:', galaxyThemeEnabled);

  const menuItems: MenuItem[] = [
    {
      id: 'shop',
      title: 'Sports Shop',
      icon: '🛍️',
      screen: 'Shop',
    },
    {
      id: 'petcare',
      title: 'Pet Care',
      icon: '🐾',
      screen: 'PetCare',
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: '👤',
      screen: 'Profile',
    },
  ];

  const handleMenuPress = (item: MenuItem) => {
    if (item.screen) {
      navigation.navigate(item.screen as never);
    } else if (item.action) {
      item.action();
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Menu Items */}
      <View style={styles.section}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityLabel={item.title}
            accessibilityRole="button"
          >
            <View style={styles.menuItemLeft}>
              <Text style={styles.menuIcon}>{item.icon}</Text>
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
            <Text style={styles.menuArrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🌌</Text>
            <View>
              <Text style={styles.settingTitle}>Galaxy Theme</Text>
              <Text style={styles.settingDescription}>Enable cosmic background</Text>
            </View>
          </View>
          <Switch
            value={galaxyThemeEnabled}
            onValueChange={() => {
              console.log('[MoreScreen] Toggle pressed, current value:', galaxyThemeEnabled);
              toggleGalaxyTheme();
            }}
            trackColor={{ false: '#d1d5db', true: '#667eea' }}
            thumbColor={galaxyThemeEnabled ? '#764ba2' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appName}>CrushIT</Text>
        <Text style={styles.appVersion}>Version 1.0.0</Text>
        <Text style={styles.appTagline}>Your Sports Arena Companion</Text>
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
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuItem: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIcon: {
    fontSize: 28,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },
  menuArrow: {
    fontSize: 32,
    color: colors.text.tertiary,
    fontWeight: '300',
  },
  settingItem: {
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  settingIcon: {
    fontSize: 28,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text.primary,
  },
  settingDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    marginTop: 2,
  },
  appInfo: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 20,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 8,
  },
  appTagline: {
    fontSize: 14,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 40,
  },
});
