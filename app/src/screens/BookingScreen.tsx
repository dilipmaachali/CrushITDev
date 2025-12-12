import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, Share } from 'react-native';
import { colors } from '@/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services';

export default function BookingScreen({ route, navigation }: any) {
  const { arena } = route.params || {};
  console.log('[BookingScreen] Mounted with arena:', arena?.name);
  console.log('[BookingScreen] Full arena data:', JSON.stringify(arena, null, 2));
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [players, setPlayers] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [errors, setErrors] = useState({
    playerName: false,
    contactNumber: false,
    selectedDay: false,
    selectedDate: false,
    selectedSlot: false,
    players: false,
  });

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const slots = ['06:00-07:00', '07:00-08:00', '08:00-09:00', '16:00-17:00', '17:00-18:00', '18:00-19:00', '19:00-20:00', '20:00-21:00', '21:00-22:00'];
  const price = arena?.pricing || 500;
  const totalPrice = selectedSlot ? price : 0;

  const handleBooking = () => {
    console.log('[BookingScreen] Confirm button clicked');
    console.log('[BookingScreen] Form data:', {
      selectedDay,
      selectedDate,
      selectedSlot,
      players,
      playerName,
      contactNumber
    });

    // Validate all fields and set error states
    const newErrors = {
      playerName: !playerName,
      contactNumber: !contactNumber,
      selectedDay: !selectedDay,
      selectedDate: !selectedDate,
      selectedSlot: !selectedSlot,
      players: !players,
    };
    
    setErrors(newErrors);

    // Check if any field has error
    const hasErrors = Object.values(newErrors).some(error => error);
    
    if (hasErrors) {
      console.log('[BookingScreen] Missing required fields:', newErrors);
      Alert.alert(
        'Missing Information', 
        'Please fill all highlighted fields marked with * to proceed with booking.'
      );
      return;
    }

    console.log('[BookingScreen] Opening confirmation modal');
    setShowConfirmModal(true);
  };

  const handleConfirmPayment = async () => {
    console.log('[BookingScreen] Payment confirmed');
    setShowConfirmModal(false);
    const newBookingId = `BK${Date.now().toString().slice(-6)}`;
    const shareCode = `CRUSH${Date.now().toString(36).toUpperCase()}`;
    setBookingId(newBookingId);

    // Save booking to backend
    try {
      const bookingPayload = {
        arenaId: arena?.id || 'unknown',
        arenaName: arena?.name || 'Unknown Arena',
        sport: arena?.type || 'sports',
        date: selectedDate,
        time: selectedSlot,
        duration: 60, // Default 1 hour
        totalCost: totalPrice,
        status: 'confirmed',
        players: [playerName],
        notes: `Contact: ${contactNumber}, Players: ${players}, Code: ${shareCode}`,
      };

      console.log('[BookingScreen] Creating booking via API:', bookingPayload);

      // Save to backend
      const response = await api.post('/api/bookings', bookingPayload);
      const booking = response.data;
      
      console.log('[BookingScreen] ✅ Booking saved successfully:', booking);

      // Create scheduled game from booking
      await createScheduledGame(booking, shareCode, newBookingId);
    } catch (error) {
      console.error('[BookingScreen] ❌ Error saving booking:', error);
    }

    setShowSuccessModal(true);
  };

  const createScheduledGame = async (booking: any, shareCode: string, localBookingId: string) => {
    try {
      console.log('[BookingScreen] Creating scheduled game from booking...');
      
      // Parse time slot (e.g., "06:00 AM - 07:00 AM")
      const timeParts = booking.time.split(' - ');
      const startTime = timeParts[0] || '09:00 AM';
      const endTime = timeParts[1] || '10:00 AM';

      const userId = await AsyncStorage.getItem('userId');
      const userName = await AsyncStorage.getItem('userEmail');

      const scheduledGamePayload = {
        sport: booking.sport === 'cricket' ? 'Cricket' : booking.sport === 'badminton' ? 'Badminton' : booking.sport === 'football' ? 'Football' : 'Sports',
        title: `Game at ${booking.arenaName}`,
        description: `Court booked`,
        scheduledDate: booking.date,
        startTime: startTime,
        endTime: endTime,
        location: {
          address: booking.arenaName,
          arenaName: booking.arenaName,
        },
        maxPlayers: parseInt(players) || 10,
        paymentType: 'prepaid',
        costPerPlayer: Math.floor(booking.totalCost / parseInt(players)),
        isPublic: true,
        genderRestriction: 'all',
        status: 'scheduled',
        shareCode: shareCode,
        bookingId: booking.id,
      };

      console.log('[BookingScreen] Creating game via API:', scheduledGamePayload);

      // Save to backend
      const response = await api.post('/api/games', scheduledGamePayload);
      console.log('[BookingScreen] ✅ Scheduled game created successfully:', response.data);
    } catch (error) {
      console.error('[BookingScreen] ❌ Error creating scheduled game:', error);
    }
  };

  const handleShareInvite = async () => {
    if (!bookingId) return;

    try {
      const bookingsJson = await AsyncStorage.getItem('bookingHistory');
      const bookings = bookingsJson ? JSON.parse(bookingsJson) : [];
      const currentBooking = bookings.find((b: any) => b.id === bookingId);

      if (!currentBooking) {
        Alert.alert('Error', 'Booking details not found');
        return;
      }

      const shareMessage = `🏟️ Join my game on CrushIT!

📍 ${currentBooking.arena}
📅 ${currentBooking.day}, ${currentBooking.date}
⏰ ${currentBooking.time}
👥 ${currentBooking.players} players needed
💰 ₹${Math.floor(currentBooking.totalPrice / parseInt(currentBooking.players))} per player

🎮 Share Code: ${currentBooking.shareCode}

Download CrushIT app and use the share code to join!
`;

      await Share.share({
        message: shareMessage,
        title: 'Join my game!',
      });
    } catch (error) {
      console.error('[BookingScreen] Error sharing invite:', error);
    }
  };

  const handleDone = () => {
    setShowSuccessModal(false);
    navigation.navigate('Home');
  };

  const handleViewBookings = () => {
    setShowSuccessModal(false);
    navigation.navigate('MoreTab', { screen: 'Profile' });
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Book {arena?.name || 'Arena'}</Text>
      <Text style={styles.subtitle}>{arena?.type?.toUpperCase() || 'SPORTS'} • ⭐ {arena?.rating || '4.5'}</Text>

      {/* Player Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Details</Text>
        <TextInput
          style={[styles.input, errors.playerName && styles.inputError]}
          placeholder="Full Name *"
          placeholderTextColor={colors.text.tertiary}
          value={playerName}
          onChangeText={(text) => {
            setPlayerName(text);
            if (errors.playerName) setErrors({...errors, playerName: false});
          }}
        />
        <TextInput
          style={[styles.input, { marginTop: 12 }, errors.contactNumber && styles.inputError]}
          placeholder="Contact Number *"
          placeholderTextColor={colors.text.tertiary}
          value={contactNumber}
          onChangeText={(text) => {
            setContactNumber(text);
            if (errors.contactNumber) setErrors({...errors, contactNumber: false});
          }}
          keyboardType="phone-pad"
        />
      </View>

      {/* Select Day of Week */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, errors.selectedDay && styles.sectionTitleError]}>Select Day *</Text>
        <View style={styles.daysContainer}>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayChip, selectedDay === day && styles.dayChipSelected]}
              onPress={() => {
                setSelectedDay(day);
                if (errors.selectedDay) setErrors({...errors, selectedDay: false});
              }}
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
        <Text style={[styles.sectionTitle, errors.selectedDate && styles.sectionTitleError]}>Select Date *</Text>
        <TextInput
          style={[styles.input, errors.selectedDate && styles.inputError]}
          placeholder="YYYY-MM-DD *"
          placeholderTextColor={colors.text.tertiary}
          value={selectedDate}
          onChangeText={(text) => {
            setSelectedDate(text);
            if (errors.selectedDate) setErrors({...errors, selectedDate: false});
          }}
        />
        <Text style={styles.helperText}>Format: 2025-12-08</Text>
      </View>

      {/* Select Time Slot */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, errors.selectedSlot && styles.sectionTitleError]}>Select Time Slot *</Text>
        <View style={styles.slotsContainer}>
          {slots.map((slot) => (
            <TouchableOpacity
              key={slot}
              style={[styles.slot, selectedSlot === slot && styles.slotSelected]}
              onPress={() => {
                setSelectedSlot(slot);
                if (errors.selectedSlot) setErrors({...errors, selectedSlot: false});
              }}
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
        <Text style={[styles.sectionTitle, errors.players && styles.sectionTitleError]}>Number of Players *</Text>
        <TextInput
          style={[styles.input, errors.players && styles.inputError]}
          placeholder="Enter number of players *"
          placeholderTextColor={colors.text.tertiary}
          value={players}
          onChangeText={(text) => {
            setPlayers(text);
            if (errors.players) setErrors({...errors, players: false});
          }}
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
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel="Confirm booking and proceed to payment"
        accessibilityRole="button"
      >
        <Text style={styles.buttonText}>💳 Confirm Booking & Pay</Text>
      </TouchableOpacity>
      
      <View style={{ height: 20 }} />

      {/* Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Booking</Text>
            <View style={styles.modalDetails}>
              <Text style={styles.modalDetailText}>Arena: {arena?.name}</Text>
              <Text style={styles.modalDetailText}>Day: {selectedDay}</Text>
              <Text style={styles.modalDetailText}>Date: {selectedDate}</Text>
              <Text style={styles.modalDetailText}>Time: {selectedSlot}</Text>
              <Text style={styles.modalDetailText}>Players: {players}</Text>
              <Text style={styles.modalDetailText}>Name: {playerName}</Text>
              <Text style={styles.modalDetailText}>Contact: {contactNumber}</Text>
              <View style={styles.modalDivider} />
              <Text style={styles.modalTotalText}>Total: ₹{totalPrice}</Text>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleConfirmPayment}
              >
                <Text style={styles.modalButtonText}>Confirm & Pay</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="slide"
        onRequestClose={handleDone}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.modalTitle}>Booking Confirmed!</Text>
            <View style={styles.modalDetails}>
              <Text style={styles.modalDetailText}>
                Your court at {arena?.name} has been booked!
              </Text>
              <Text style={styles.modalDetailText}>Day: {selectedDay}</Text>
              <Text style={styles.modalDetailText}>Time: {selectedSlot}</Text>
              <Text style={styles.modalDetailText}>Players: {players}</Text>
              <View style={styles.modalDivider} />
              <Text style={styles.bookingIdText}>Booking ID: {bookingId}</Text>
              <Text style={styles.modalHintText}>
                A scheduled game has been created in your Games tab
              </Text>
              
              {/* Share Invite Section */}
              <View style={styles.shareSection}>
                <Text style={styles.shareSectionTitle}>🎮 Invite Players</Text>
                <Text style={styles.shareHintText}>Share this code with friends to join your game</Text>
                <TouchableOpacity 
                  style={styles.shareInviteButton}
                  onPress={handleShareInvite}
                >
                  <Text style={styles.shareInviteButtonText}>📤 Share Invite Link</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={handleViewBookings}
              >
                <Text style={styles.modalButtonTextSecondary}>View My Bookings</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={handleDone}
              >
                <Text style={styles.modalButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
    backgroundColor: '#FFF5F5',
  },
  sectionTitleError: {
    color: colors.error,
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
    paddingVertical: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalDetails: {
    marginBottom: 24,
  },
  modalDetailText: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: 8,
    lineHeight: 22,
  },
  modalDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  modalTotalText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonSecondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  successEmoji: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  bookingIdText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  modalHintText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  shareSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  shareSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
  },
  shareHintText: {
    fontSize: 13,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  shareInviteButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  shareInviteButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
