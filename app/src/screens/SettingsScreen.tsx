import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Slider } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';
import { useAccessibility } from '@/hooks/useAccessibility';
import { TOUCH_TARGET } from '@/constants/accessibility';

export default function SettingsScreen() {
  const [notifications, setNotifications] = React.useState(true);
  const [location, setLocation] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [scoringEnabled, setScoringEnabled] = React.useState(true);
  
  const {
    settings,
    updateTextScale,
    toggleHighContrast,
    getScaledSize,
  } = useAccessibility();

  React.useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem('scoringEnabled');
      if (enabled !== null) {
        setScoringEnabled(JSON.parse(enabled));
      }
    } catch (error) {
      console.error('Error loading scoring setting:', error);
    }
  };

  const toggleScoring = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('scoringEnabled', JSON.stringify(value));
      setScoringEnabled(value);
    } catch (error) {
      console.error('Error saving scoring setting:', error);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Edit Profile</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Change Password</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Payment Methods</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.optionToggle}>
          <Text style={styles.optionText}>Notifications</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: colors.border, true: colors.primary }}
            accessibilityRole="switch"
            accessibilityLabel="Enable notifications"
          />
        </View>
        <View style={styles.optionToggle}>
          <Text style={styles.optionText}>Location Services</Text>
          <Switch
            value={location}
            onValueChange={setLocation}
            trackColor={{ false: colors.border, true: colors.primary }}
            accessibilityRole="switch"
            accessibilityLabel="Enable location services"
          />
        </View>
        <View style={styles.optionToggle}>
          <Text style={styles.optionText}>Dark Mode</Text>
          <Switch
            value={darkMode}
            onValueChange={setDarkMode}
            trackColor={{ false: colors.border, true: colors.primary }}
            accessibilityRole="switch"
            accessibilityLabel="Enable dark mode"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.optionToggle}>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionText}>Score Tracking</Text>
            <Text style={styles.optionDescription}>
              Track scores for tournaments and practice sessions
            </Text>
          </View>
          <Switch
            value={scoringEnabled}
            onValueChange={toggleScoring}
            trackColor={{ false: colors.border, true: colors.primary }}
            accessibilityRole="switch"
            accessibilityLabel="Enable score tracking feature"
            accessibilityHint="Toggle to enable or disable score tracking for games"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accessibility</Text>
        
        {/* Text Size Control */}
        <View style={[styles.optionToggle, { flexDirection: 'column', alignItems: 'stretch' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={styles.optionText}>Text Size</Text>
            <Text style={[styles.optionText, { color: colors.text.secondary }]}>
              {Math.round(settings.textScale * 100)}%
            </Text>
          </View>
          <Text style={styles.optionDescription}>
            Adjust text size throughout the app
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
            <Text style={{ fontSize: getScaledSize(12), marginRight: 8 }}>A</Text>
            <Slider
              style={{ flex: 1 }}
              minimumValue={0.85}
              maximumValue={2.0}
              value={settings.textScale}
              onValueChange={updateTextScale}
              minimumTrackTintColor={colors.primary}
              maximumTrackTintColor={colors.border}
              thumbTintColor={colors.primary}
              accessibilityLabel="Text size slider"
              accessibilityHint="Slide to adjust text size from 85% to 200%"
              accessibilityValue={{ 
                min: 85, 
                max: 200, 
                now: Math.round(settings.textScale * 100) 
              }}
            />
            <Text style={{ fontSize: getScaledSize(20), marginLeft: 8 }}>A</Text>
          </View>
        </View>

        {/* High Contrast Mode */}
        <View style={styles.optionToggle}>
          <View style={{ flex: 1 }}>
            <Text style={styles.optionText}>High Contrast Mode</Text>
            <Text style={styles.optionDescription}>
              Increase contrast for better visibility
            </Text>
          </View>
          <Switch
            value={settings.highContrastMode}
            onValueChange={toggleHighContrast}
            trackColor={{ false: colors.border, true: colors.primary }}
            accessibilityRole="switch"
            accessibilityLabel="Enable high contrast mode"
            accessibilityHint="Increases border width and text weight for better visibility"
          />
        </View>

        {/* Screen Reader Status */}
        {settings.isScreenReaderEnabled && (
          <View style={[styles.optionToggle, { backgroundColor: colors.primary + '10' }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionText}>✓ Screen Reader Active</Text>
              <Text style={styles.optionDescription}>
                {settings.isScreenReaderEnabled ? 'TalkBack/VoiceOver is enabled' : 'No screen reader detected'}
              </Text>
            </View>
          </View>
        )}

        {/* Reduce Motion Status */}
        {settings.isReduceMotionEnabled && (
          <View style={[styles.optionToggle, { backgroundColor: colors.primary + '10' }]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.optionText}>✓ Reduced Motion Active</Text>
              <Text style={styles.optionDescription}>
                Animations are disabled per system settings
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Help & Support</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>FAQ</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>Terms & Privacy</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.option}>
          <Text style={styles.optionText}>About CrushIT</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
    marginTop: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  optionText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
    lineHeight: 16,
  },
  arrow: {
    fontSize: 20,
    color: colors.text.tertiary,
  },
  logoutButton: {
    backgroundColor: colors.error,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 40,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
