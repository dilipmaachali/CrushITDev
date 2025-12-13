import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';
import { TOUCH_TARGET } from '@/constants/accessibility';
import { api } from '@/services';

export default function CreateGameScreen({ navigation, route }: any) {
  const [sport, setSport] = useState('');
  const [sportName, setSportName] = useState('');
  const [arenaName, setArenaName] = useState('');
  const [arenaLocation, setArenaLocation] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [showMoreSettings, setShowMoreSettings] = useState(false);
  
  // More Settings states
  const [gameType, setGameType] = useState('Beginner');
  const [totalPlayers, setTotalPlayers] = useState('');
  const [costShared, setCostShared] = useState(false);
  const [bringTools, setBringTools] = useState(false);
  const [customNotes, setCustomNotes] = useState('');

  // Handle return values from navigation
  React.useEffect(() => {
    if (route.params?.selectedSport) {
      setSport(route.params.selectedSport.id);
      setSportName(route.params.selectedSport.name);
    }
    if (route.params?.selectedArena) {
      setArenaName(route.params.selectedArena.name);
      setArenaLocation(route.params.selectedArena.location);
    }
    if (route.params?.selectedDate) {
      setDate(route.params.selectedDate);
    }
    if (route.params?.selectedTime) {
      setStartTime(route.params.selectedTime.start);
      setEndTime(route.params.selectedTime.end);
    }
  }, [route.params]);

  const createGame = async () => {
    // Validation
    const missingFields = [];
    
    if (!sport) missingFields.push('Sport');
    if (!arenaName) missingFields.push('Arena');
    if (!date) missingFields.push('Date');
    if (!startTime) missingFields.push('Start Time');
    if (!endTime) missingFields.push('End Time');
    
    if (missingFields.length > 0) {
      Alert.alert(
        'Missing Required Fields', 
        `Please fill in:\n• ${missingFields.join('\n• ')}`
      );
      return;
    }

    // Check if date/time is in the past
    const gameDateTime = new Date(date);
    const [hours, minutes] = startTime.split(':').map(Number);
    gameDateTime.setHours(hours, minutes, 0, 0);
    
    if (gameDateTime < new Date()) {
      Alert.alert(
        'Invalid Date/Time',
        'Cannot create a game in the past. Please select a future date and time.'
      );
      return;
    }

    const newGame = {
      sport,
      sportName,
      // Backend will generate title as "UserName SportName Game"
      description: customNotes || `${sportName} game at ${arenaName}`,
      scheduledDate: date,
      startTime,
      endTime,
      location: {
        address: arenaLocation,
        arenaName: arenaName,
      },
      maxPlayers: totalPlayers ? parseInt(totalPlayers) : 4,
      minPlayers: 2,
      currentPlayers: [],
      status: 'scheduled',
      paymentType: costShared ? 'pay_later' : 'free',
      costPerPlayer: 0,
      isPublic,
      skillLevel: gameType.toLowerCase(),
      shareCode: Math.random().toString(36).substr(2, 8).toUpperCase(),
      genderRestriction: 'all',
      notes: {
        costShared,
        bringTools,
        customNotes,
      },
      createdAt: new Date().toISOString(),
    };

    console.log('Creating game with data:', newGame);

    try {
      const response = await api.post('/api/games', newGame);
      console.log('Game created successfully:', response.data);
      
      // Navigate back to Games tab
      navigation.navigate('GamesList');
      
      // Show success message
      setTimeout(() => {
        Alert.alert('Success', 'Your game has been scheduled successfully!');
      }, 300);
    } catch (error: any) {
      console.error('Error creating game:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to create game. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <View style={{ flex: 1 }}>
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Create New Game</Text>

      {/* Sport Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Sport *</Text>
        <TouchableOpacity
          style={styles.selectionButton}
          onPress={() => navigation.navigate('SelectSport')}
          accessibilityRole="button"
          accessibilityLabel="Select sport"
        >
          <Text style={[styles.selectionButtonText, !sportName && styles.placeholderText]}>
            {sportName || 'Choose a sport...'}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Arena */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Arena *</Text>
        <TouchableOpacity
          style={styles.selectionButton}
          onPress={() => navigation.navigate('SelectArena')}
          accessibilityRole="button"
          accessibilityLabel="Select arena"
        >
          <View style={{ flex: 1 }}>
            <Text style={[styles.selectionButtonText, !arenaName && styles.placeholderText]}>
              {arenaName || 'Choose an arena...'}
            </Text>
            {arenaLocation ? (
              <Text style={styles.selectionSubtext}>{arenaLocation}</Text>
            ) : null}
          </View>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Date */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date *</Text>
        <TouchableOpacity
          style={styles.selectionButton}
          onPress={() => navigation.navigate('SelectDate')}
          accessibilityRole="button"
          accessibilityLabel="Select date"
        >
          <Text style={[styles.selectionButtonText, !date && styles.placeholderText]}>
            {date ? new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : 'Choose a date...'}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Time */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Time *</Text>
        <TouchableOpacity
          style={styles.selectionButton}
          onPress={() => navigation.navigate('SelectTime')}
          accessibilityRole="button"
          accessibilityLabel="Select time"
        >
          <Text style={[styles.selectionButtonText, !startTime && styles.placeholderText]}>
            {startTime && endTime ? `${startTime} - ${endTime}` : 'Choose time slots...'}
          </Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Public/Private Toggle */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Visibility</Text>
        <View style={styles.visibilityButtons}>
          <TouchableOpacity
            style={[styles.visibilityButton, isPublic && styles.visibilityButtonActive]}
            onPress={() => setIsPublic(true)}
            accessibilityRole="radio"
            accessibilityState={{ checked: isPublic }}
          >
            <Text style={[styles.visibilityButtonText, isPublic && styles.visibilityButtonTextActive]}>
              🌐 Public
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.visibilityButton, !isPublic && styles.visibilityButtonActive]}
            onPress={() => setIsPublic(false)}
            accessibilityRole="radio"
            accessibilityState={{ checked: !isPublic }}
          >
            <Text style={[styles.visibilityButtonText, !isPublic && styles.visibilityButtonTextActive]}>
              🔒 Private
            </Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.visibilitySubtext}>
          {isPublic ? 'Public games are visible to everyone' : 'Private games are only visible to you'}
        </Text>
      </View>

      {/* More Settings Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.moreSettingsButton}
          onPress={() => setShowMoreSettings(true)}
          accessibilityRole="button"
          accessibilityLabel="More settings"
        >
          <Text style={styles.moreSettingsText}>⚙️ More Settings</Text>
          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Create Button */}
      <TouchableOpacity
        style={styles.createButton}
        onPress={createGame}
        accessibilityRole="button"
        accessibilityLabel="Create game"
      >
        <Text style={styles.createButtonText}>Create Game</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>

    {/* More Settings Modal */}
    <Modal
      visible={showMoreSettings}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowMoreSettings(false)}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalBackdrop} 
          activeOpacity={1}
          onPress={() => setShowMoreSettings(false)}
        />
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>More Settings</Text>
            <TouchableOpacity onPress={() => setShowMoreSettings(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Game Type Picker */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Game Type</Text>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                snapToInterval={120}
                decelerationRate="fast"
                contentContainerStyle={styles.gameTypeScroller}
              >
                {['Beginner', 'Amateur', 'Intermediate', 'Advanced', 'Professional'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.gameTypeButton,
                      gameType === type && styles.gameTypeButtonActive
                    ]}
                    onPress={() => setGameType(type)}
                  >
                    <Text style={[
                      styles.gameTypeText,
                      gameType === type && styles.gameTypeTextActive
                    ]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Total Players */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Total Players</Text>
              <View style={styles.playersControl}>
                <TouchableOpacity
                  style={styles.playerButton}
                  onPress={() => setTotalPlayers(String(Math.max(2, parseInt(totalPlayers || '2') - 1)))}
                >
                  <Text style={styles.playerButtonText}>-</Text>
                </TouchableOpacity>
                <TextInput
                  style={styles.playersInput}
                  value={totalPlayers}
                  onChangeText={setTotalPlayers}
                  keyboardType="number-pad"
                  placeholder="4"
                  placeholderTextColor={colors.text.tertiary}
                />
                <TouchableOpacity
                  style={styles.playerButton}
                  onPress={() => setTotalPlayers(String(parseInt(totalPlayers || '2') + 1))}
                >
                  <Text style={styles.playerButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Things to Remember */}
            <View style={styles.settingSection}>
              <Text style={styles.settingLabel}>Things to Remember</Text>
              
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setCostShared(!costShared)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: costShared }}
              >
                <View style={[styles.checkbox, costShared && styles.checkboxChecked]}>
                  {costShared && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Cost will be shared</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setBringTools(!bringTools)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: bringTools }}
              >
                <View style={[styles.checkbox, bringTools && styles.checkboxChecked]}>
                  {bringTools && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text style={styles.checkboxLabel}>Bring your own equipment/tools</Text>
              </TouchableOpacity>

              <TextInput
                style={styles.notesInput}
                value={customNotes}
                onChangeText={setCustomNotes}
                placeholder="Other notes..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => setShowMoreSettings(false)}
            >
              <Text style={styles.saveButtonText}>Save Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
  },
  sportGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sportButton: {
    width: '30%',
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minHeight: TOUCH_TARGET.COMFORTABLE,
  },
  sportButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  sportIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  sportName: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  sportNameActive: {
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 12,
    minHeight: TOUCH_TARGET.MINIMUM,
  },
  selectionButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: TOUCH_TARGET.MINIMUM,
  },
  selectionButtonText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  placeholderText: {
    color: colors.text.tertiary,
  },
  selectionSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  chevron: {
    fontSize: 24,
    color: colors.text.tertiary,
    fontWeight: '300',
  },
  inputText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  visibilityButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  visibilityButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    minHeight: 52,
    justifyContent: 'center',
  },
  visibilityButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  visibilityButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  visibilityButtonTextActive: {
    color: colors.primary,
  },
  visibilitySubtext: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontStyle: 'italic',
  },
  timeRow: {
    flexDirection: 'row',
  },
  playerRow: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 6,
    fontWeight: '600',
  },
  paymentOptions: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  paymentButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  paymentButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  paymentButtonText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  paymentButtonTextActive: {
    color: '#FFFFFF',
  },
  costContainer: {
    marginTop: 8,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingLabel: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderButtonText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    minHeight: TOUCH_TARGET.LARGE,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  moreSettingsButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: TOUCH_TARGET.MINIMUM,
  },
  moreSettingsText: {
    fontSize: 15,
    color: colors.text.primary,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  modalClose: {
    fontSize: 28,
    color: colors.text.tertiary,
    fontWeight: '300',
  },
  modalBody: {
    flex: 1,
    padding: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingSection: {
    marginBottom: 24,
  },
  gameTypeScroller: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  gameTypeButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.border,
    marginHorizontal: 4,
    minWidth: 110,
    alignItems: 'center',
  },
  gameTypeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  gameTypeText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  gameTypeTextActive: {
    color: colors.white,
  },
  playersControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  playerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.white,
  },
  playersInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  checkboxLabel: {
    fontSize: 15,
    color: colors.text.primary,
  },
  notesInput: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: colors.text.primary,
    minHeight: 80,
    marginTop: 8,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
