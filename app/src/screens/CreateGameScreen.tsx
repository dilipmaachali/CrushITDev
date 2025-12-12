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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';
import { TOUCH_TARGET } from '@/constants/accessibility';
import { api } from '@/services';

export default function CreateGameScreen({ navigation }: any) {
  const [sport, setSport] = useState('cricket');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState('10:00 AM');
  const [endTime, setEndTime] = useState('12:00 PM');
  const [address, setAddress] = useState('');
  const [arenaName, setArenaName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('10');
  const [minPlayers, setMinPlayers] = useState('6');
  
  // Payment settings
  const [paymentType, setPaymentType] = useState<'free' | 'prepaid' | 'pay_later'>('free');
  const [costPerPlayer, setCostPerPlayer] = useState('');
  
  // Game settings
  const [isPublic, setIsPublic] = useState(true);
  const [genderRestriction, setGenderRestriction] = useState<'all' | 'male_only' | 'female_only'>('all');
  const [allowJoinRequests, setAllowJoinRequests] = useState(true);

  const sports = [
    { id: 'cricket', name: 'Cricket', icon: '🏏' },
    { id: 'football', name: 'Football', icon: '⚽' },
    { id: 'badminton', name: 'Badminton', icon: '🏸' },
    { id: 'tennis', name: 'Tennis', icon: '🎾' },
    { id: 'basketball', name: 'Basketball', icon: '🏀' },
  ];

  const generateShareCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createGame = async () => {
    if (!title || !address) {
      Alert.alert('Missing Fields', 'Please fill in all required fields');
      return;
    }

    if (parseInt(minPlayers) > parseInt(maxPlayers)) {
      Alert.alert('Invalid Players', 'Minimum players cannot exceed maximum players');
      return;
    }

    if (paymentType !== 'free' && !costPerPlayer) {
      Alert.alert('Missing Cost', 'Please enter cost per player');
      return;
    }

    const currentUserId = 'USER123'; // Replace with actual user ID
    const currentUserName = 'John Doe'; // Replace with actual user name
    const currentUserGender = 'male'; // Replace with actual user gender

    const newGame = {
      id: `GAME${Date.now()}`,
      sport,
      title,
      description,
      scheduledDate: date.toISOString(),
      startTime,
      endTime,
      location: {
        address,
        arenaName: arenaName || undefined,
      },
      hostId: currentUserId,
      hostName: currentUserName,
      coHosts: [],
      maxPlayers: parseInt(maxPlayers),
      minPlayers: parseInt(minPlayers),
      currentPlayers: [
        {
          userId: currentUserId,
          userName: currentUserName,
          gender: currentUserGender,
          status: 'confirmed',
          joinedAt: new Date().toISOString(),
        },
      ],
      inviteRequests: [],
      sentInvites: [],
      paymentType,
      costPerPlayer: paymentType !== 'free' ? parseFloat(costPerPlayer) : undefined,
      currency: 'INR',
      paymentDetails: paymentType !== 'free' ? {
        totalAmount: 0,
        paidPlayers: [],
      } : undefined,
      isPublic,
      genderRestriction,
      allowJoinRequests,
      status: 'scheduled',
      shareCode: generateShareCode(),
      createdAt: new Date().toISOString(),
    };

    try {
      // Save to backend API
      const response = await api.post('/api/games', newGame);
      console.log('Game created:', response.data);
      
      Alert.alert(
        'Game Created! 🎉',
        `Your ${sport} game has been created. Share code: ${newGame.shareCode}`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating game:', error);
      const errorMessage = error.response?.data?.error || 'Failed to create game. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Create New Game</Text>

      {/* Sport Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Sport *</Text>
        <View style={styles.sportGrid}>
          {sports.map((s) => (
            <TouchableOpacity
              key={s.id}
              style={[styles.sportButton, sport === s.id && styles.sportButtonActive]}
              onPress={() => setSport(s.id)}
              accessibilityRole="radio"
              accessibilityState={{ checked: sport === s.id }}
            >
              <Text style={styles.sportIcon}>{s.icon}</Text>
              <Text style={[styles.sportName, sport === s.id && styles.sportNameActive]}>
                {s.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Game Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Details *</Text>
        <TextInput
          style={styles.input}
          placeholder="Game Title (e.g., Weekend Cricket Match)"
          value={title}
          onChangeText={setTitle}
          accessibilityLabel="Game title"
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description (optional)"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          accessibilityLabel="Game description"
        />
      </View>

      {/* Schedule */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Schedule *</Text>
        <TouchableOpacity style={styles.input}>
          <Text style={styles.inputText}>📅 {date.toLocaleDateString()}</Text>
        </TouchableOpacity>
        <View style={styles.timeRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <TextInput
              style={styles.input}
              placeholder="Start Time"
              value={startTime}
              onChangeText={setStartTime}
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <TextInput
              style={styles.input}
              placeholder="End Time"
              value={endTime}
              onChangeText={setEndTime}
            />
          </View>
        </View>
      </View>

      {/* Location */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location *</Text>
        <TextInput
          style={styles.input}
          placeholder="Arena Name (optional)"
          value={arenaName}
          onChangeText={setArenaName}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Address *"
          value={address}
          onChangeText={setAddress}
          multiline
          numberOfLines={2}
        />
      </View>

      {/* Players */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Players *</Text>
        <View style={styles.playerRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.label}>Minimum</Text>
            <TextInput
              style={styles.input}
              placeholder="Min"
              value={minPlayers}
              onChangeText={setMinPlayers}
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={styles.label}>Maximum</Text>
            <TextInput
              style={styles.input}
              placeholder="Max"
              value={maxPlayers}
              onChangeText={setMaxPlayers}
              keyboardType="numeric"
            />
          </View>
        </View>
      </View>

      {/* Payment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment</Text>
        <View style={styles.paymentOptions}>
          <TouchableOpacity
            style={[styles.paymentButton, paymentType === 'free' && styles.paymentButtonActive]}
            onPress={() => setPaymentType('free')}
          >
            <Text style={[styles.paymentButtonText, paymentType === 'free' && styles.paymentButtonTextActive]}>
              Free
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentButton, paymentType === 'prepaid' && styles.paymentButtonActive]}
            onPress={() => setPaymentType('prepaid')}
          >
            <Text style={[styles.paymentButtonText, paymentType === 'prepaid' && styles.paymentButtonTextActive]}>
              Pre-paid
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.paymentButton, paymentType === 'pay_later' && styles.paymentButtonActive]}
            onPress={() => setPaymentType('pay_later')}
          >
            <Text style={[styles.paymentButtonText, paymentType === 'pay_later' && styles.paymentButtonTextActive]}>
              Pay Later
            </Text>
          </TouchableOpacity>
        </View>

        {paymentType !== 'free' && (
          <View style={styles.costContainer}>
            <Text style={styles.label}>Cost per player (₹)</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              value={costPerPlayer}
              onChangeText={setCostPerPlayer}
              keyboardType="numeric"
            />
          </View>
        )}
      </View>

      {/* Game Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Settings</Text>
        
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Public Game</Text>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Allow Join Requests</Text>
          <Switch
            value={allowJoinRequests}
            onValueChange={setAllowJoinRequests}
            trackColor={{ false: colors.border, true: colors.primary }}
          />
        </View>

        <Text style={styles.label}>Gender Restriction</Text>
        <View style={styles.genderButtons}>
          <TouchableOpacity
            style={[styles.genderButton, genderRestriction === 'all' && styles.genderButtonActive]}
            onPress={() => setGenderRestriction('all')}
          >
            <Text style={styles.genderButtonText}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderButton, genderRestriction === 'male_only' && styles.genderButtonActive]}
            onPress={() => setGenderRestriction('male_only')}
          >
            <Text style={styles.genderButtonText}>Men Only</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.genderButton, genderRestriction === 'female_only' && styles.genderButtonActive]}
            onPress={() => setGenderRestriction('female_only')}
          >
            <Text style={styles.genderButtonText}>Women Only</Text>
          </TouchableOpacity>
        </View>
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
  inputText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
});
