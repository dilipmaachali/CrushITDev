import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { colors } from '@/theme';

export default function BookingScreen({ route, navigation }: any) {
  const { arena } = route.params || {};
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [players, setPlayers] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const slots = ['06:00-07:00', '07:00-08:00', '08:00-09:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00'];
  const price = arena?.pricing || 500;
  const totalPrice = selectedSlot ? price : 0;

  const handleBooking = () => {
    if (!selectedDay || !selectedDate || !selectedSlot || !players || !playerName || !contactNumber) {
      Alert.alert('Missing Information', 'Please fill all required fields to proceed with booking.');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Arena: ${arena?.name}\nDay: ${selectedDay}\nDate: ${selectedDate}\nSlot: ${selectedSlot}\nPlayers: ${players}\nTotal: ₹${totalPrice}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm & Pay',
          onPress: () => {
            // Show success message
            Alert.alert(
              '🎉 Booking Confirmed!', 
              `Your court at ${arena?.name} has been booked!\n\nDay: ${selectedDay}\nTime: ${selectedSlot}\nPlayers: ${players}\n\nBooking ID: BK${Date.now().toString().slice(-6)}\n\nYou'll receive a confirmation SMS shortly.`,
              [
                { 
                  text: 'View My Bookings', 
                  onPress: () => navigation.navigate('ProfileTab')
                },
                { 
                  text: 'Done', 
                  onPress: () => navigation.navigate('Home'),
                  style: 'cancel'
                }
              ]
            );
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Book {arena?.name || 'Arena'}</Text>
      <Text style={styles.subtitle}>{arena?.type?.toUpperCase() || 'SPORTS'} • ⭐ {arena?.rating || '4.5'}</Text>

      {/* Player Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Details</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name *"
          placeholderTextColor={colors.text.tertiary}
          value={playerName}
          onChangeText={setPlayerName}
        />
        <TextInput
          style={[styles.input, { marginTop: 12 }]}
          placeholder="Contact Number *"
          placeholderTextColor={colors.text.tertiary}
          value={contactNumber}
          onChangeText={setContactNumber}
          keyboardType="phone-pad"
        />
      </View>

      {/* Select Day of Week */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Day</Text>
        <View style={styles.daysContainer}>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayChip, selectedDay === day && styles.dayChipSelected]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[styles.dayText, selectedDay === day && styles.dayTextSelected]}>
                {day.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Select Date */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Date</Text>
        <TextInput
          style={styles.input}
          placeholder="YYYY-MM-DD *"
          placeholderTextColor={colors.text.tertiary}
          value={selectedDate}
          onChangeText={setSelectedDate}
        />
        <Text style={styles.helperText}>Format: 2025-12-08</Text>
      </View>

      {/* Select Time Slot */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Select Time Slot</Text>
        <View style={styles.slotsContainer}>
          {slots.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[styles.slot, selectedSlot === slot && styles.slotSelected]}
              onPress={() => setSelectedSlot(slot)}
            >
              <Text
                style={[
                  styles.slotText,
                  selectedSlot === slot && styles.slotTextSelected,
                ]}
              >
                {slot}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Number of Players */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Number of Players</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter number of players *"
          placeholderTextColor={colors.text.tertiary}
          value={players}
          onChangeText={setPlayers}
          keyboardType="number-pad"
        />
      </View>

      {/* Booking Summary */}
      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Booking Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Arena:</Text>
          <Text style={styles.summaryValue}>{arena?.name || 'Not selected'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Day:</Text>
          <Text style={styles.summaryValue}>{selectedDay || 'Not selected'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Date:</Text>
          <Text style={styles.summaryValue}>{selectedDate || 'Not selected'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Time Slot:</Text>
          <Text style={styles.summaryValue}>{selectedSlot || 'Not selected'}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Players:</Text>
          <Text style={styles.summaryValue}>{players || '0'}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Venue Price:</Text>
          <Text style={styles.summaryValue}>₹{price}/hr</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalPrice}>₹{totalPrice}</Text>
        </View>
      </View>

      {/* Booking Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={handleBooking}
      >
        <Text style={styles.buttonText}>Confirm Booking & Pay</Text>
      </TouchableOpacity>
      
      <View style={{ height: 20 }} />
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
    marginBottom: 4,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.surface,
    color: colors.text.primary,
    fontSize: 15,
  },
  helperText: {
    fontSize: 12,
    color: colors.text.tertiary,
    marginTop: 4,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  dayChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  dayTextSelected: {
    color: '#FFFFFF',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slot: {
    flex: 1,
    minWidth: '30%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  slotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  slotText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text.primary,
  },
  slotTextSelected: {
    color: '#FFFFFF',
  },
  summarySection: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
