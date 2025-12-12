import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';
import { api } from '@/services';

export default function EditGameScreen({ route, navigation }: any) {
  const { gameId } = route.params;
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Form fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [arenaName, setArenaName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState('');
  const [costPerPlayer, setCostPerPlayer] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadGame();
  }, []);

  const loadGame = async () => {
    try {
      // Fetch from backend API
      const response = await api.get(`/api/games/${gameId}`);
      const foundGame = response.data;
      
      if (foundGame) {
        setGame(foundGame);
        setTitle(foundGame.title);
        setDescription(foundGame.description);
        setScheduledDate(foundGame.scheduledDate);
        setStartTime(foundGame.startTime);
        setEndTime(foundGame.endTime);
        setLocation(foundGame.location.address);
        setArenaName(foundGame.location.arenaName || '');
        setMaxPlayers(foundGame.maxPlayers.toString());
        setCostPerPlayer(foundGame.costPerPlayer?.toString() || '0');
        setIsPublic(foundGame.isPublic);
      } else {
        Alert.alert('Error', 'Game not found');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading game:', error);
      Alert.alert('Error', 'Failed to load game details');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a game title');
      return false;
    }
    if (!scheduledDate.trim()) {
      Alert.alert('Validation Error', 'Please enter a date (YYYY-MM-DD)');
      return false;
    }
    if (!startTime.trim() || !endTime.trim()) {
      Alert.alert('Validation Error', 'Please enter start and end times');
      return false;
    }
    if (!location.trim()) {
      Alert.alert('Validation Error', 'Please enter a location/arena');
      return false;
    }
    if (!maxPlayers || parseInt(maxPlayers) < 2) {
      Alert.alert('Validation Error', 'Maximum players must be at least 2');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      // Update via backend API
      const updatedData = {
        title: title,
        description: description,
        scheduledDate: scheduledDate,
        startTime: startTime,
        endTime: endTime,
        location: {
          address: location,
          arenaName: arenaName || location,
        },
        maxPlayers: parseInt(maxPlayers),
        costPerPlayer: parseFloat(costPerPlayer) || 0,
        isPublic: isPublic,
      };

      const response = await api.put(`/api/games/${gameId}`, updatedData);
      console.log('Game updated:', response.data);

      Alert.alert('Success', 'Game updated successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error saving game:', error);
      const errorMessage = error.response?.data?.error || 'Failed to update game. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const updateLinkedBooking = async (updatedGame: any) => {
    try {
      const bookingsJson = await AsyncStorage.getItem('bookingHistory');
      if (bookingsJson) {
        const bookings = JSON.parse(bookingsJson);
        const bookingIndex = bookings.findIndex((b: any) => b.id === updatedGame.bookingId);
        
        if (bookingIndex !== -1) {
          bookings[bookingIndex] = {
            ...bookings[bookingIndex],
            arena: updatedGame.location.arenaName,
            date: updatedGame.scheduledDate,
            time: `${updatedGame.startTime} - ${updatedGame.endTime}`,
            players: updatedGame.maxPlayers.toString(),
          };
          await AsyncStorage.setItem('bookingHistory', JSON.stringify(bookings));
        }
      }
    } catch (error) {
      console.error('Error updating linked booking:', error);
    }
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      // Delete via backend API
      await api.delete(`/api/games/${gameId}`);
      
      setShowDeleteModal(false);
      Alert.alert('Success', 'Game deleted successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error: any) {
      console.error('Error deleting game:', error);
      const errorMessage = error.response?.data?.error || 'Failed to delete game. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading game details...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Game Details</Text>
        
        <Text style={styles.label}>Game Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Weekend Cricket Match"
          placeholderTextColor={colors.text.tertiary}
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Add details about the game..."
          placeholderTextColor={colors.text.tertiary}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Date & Time</Text>
        
        <Text style={styles.label}>Date (YYYY-MM-DD) *</Text>
        <TextInput
          style={styles.input}
          value={scheduledDate}
          onChangeText={setScheduledDate}
          placeholder="2025-12-15"
          placeholderTextColor={colors.text.tertiary}
        />

        <Text style={styles.label}>Start Time *</Text>
        <TextInput
          style={styles.input}
          value={startTime}
          onChangeText={setStartTime}
          placeholder="06:00 AM"
          placeholderTextColor={colors.text.tertiary}
        />

        <Text style={styles.label}>End Time *</Text>
        <TextInput
          style={styles.input}
          value={endTime}
          onChangeText={setEndTime}
          placeholder="08:00 AM"
          placeholderTextColor={colors.text.tertiary}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location</Text>
        
        <Text style={styles.label}>Arena/Location *</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="e.g., Elite Cricket Turf"
          placeholderTextColor={colors.text.tertiary}
        />

        <Text style={styles.label}>Arena Name (Optional)</Text>
        <TextInput
          style={styles.input}
          value={arenaName}
          onChangeText={setArenaName}
          placeholder="Specific arena name"
          placeholderTextColor={colors.text.tertiary}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Players & Cost</Text>
        
        <Text style={styles.label}>Maximum Players *</Text>
        <TextInput
          style={styles.input}
          value={maxPlayers}
          onChangeText={setMaxPlayers}
          placeholder="10"
          placeholderTextColor={colors.text.tertiary}
          keyboardType="number-pad"
        />

        <Text style={styles.label}>Cost Per Player (₹)</Text>
        <TextInput
          style={styles.input}
          value={costPerPlayer}
          onChangeText={setCostPerPlayer}
          placeholder="0"
          placeholderTextColor={colors.text.tertiary}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>
        
        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchLabel}>
              {isPublic ? 'Public Game' : 'Invite Only'}
            </Text>
            <Text style={styles.switchDescription}>
              {isPublic 
                ? 'Anyone can see and request to join this game' 
                : 'Only people with your invite link can join'}
            </Text>
          </View>
          <Switch
            value={isPublic}
            onValueChange={setIsPublic}
            trackColor={{ false: colors.border, true: colors.primary + '80' }}
            thumbColor={isPublic ? colors.primary : colors.text.tertiary}
          />
        </View>
      </View>

      {game?.bookingId && (
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            This game is linked to booking {game.bookingId}. Changes will update the booking details.
          </Text>
        </View>
      )}

      {/* Cricket Scoring Button */}
      {game?.sport && (game.sport.toLowerCase().includes('cricket') || game.sport.toLowerCase() === 'box cricket') && (
        <TouchableOpacity
          style={[styles.button, styles.cricketButton]}
          onPress={() => navigation.navigate('CricketMatchSetup', { gameId: game.id })}
        >
          <Text style={styles.buttonText}>🏏 Start Cricket Scoring</Text>
        </TouchableOpacity>
      )}

      {/* Badminton Scoring Button */}
      {game?.sport && game.sport.toLowerCase().includes('badminton') && (
        <TouchableOpacity
          style={[styles.button, styles.badmintonButton]}
          onPress={() => navigation.navigate('BadmintonMatchSetup', { gameId: game.id })}
        >
          <Text style={styles.buttonText}>🏸 Start Badminton Scoring</Text>
        </TouchableOpacity>
      )}

      {/* Football Scoring Button */}
      {game?.sport && (game.sport.toLowerCase().includes('football') || game.sport.toLowerCase().includes('soccer')) && (
        <TouchableOpacity
          style={[styles.button, styles.footballButton]}
          onPress={() => navigation.navigate('FootballMatchSetup', { gameId: game.id })}
        >
          <Text style={styles.buttonText}>⚽ Start Football Scoring</Text>
        </TouchableOpacity>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.saveButton]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>💾 Save Changes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>🗑️ Delete Game</Text>
        </TouchableOpacity>
      </View>

      {/* Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalIcon}>⚠️</Text>
            <Text style={styles.modalTitle}>Delete Game?</Text>
            <Text style={styles.modalMessage}>
              Are you sure you want to delete this game? This action cannot be undone.
            </Text>
            {game?.bookingId && (
              <Text style={styles.modalWarning}>
                Note: This will not cancel your booking ({game.bookingId})
              </Text>
            )}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDeleteModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmDeleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: colors.text.primary,
    backgroundColor: colors.surface,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 13,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '15',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    padding: 12,
    margin: 20,
    borderRadius: 8,
    gap: 12,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.primary,
    lineHeight: 18,
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  cricketButton: {
    backgroundColor: colors.success,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badmintonButton: {
    backgroundColor: '#FF6B35',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  footballButton: {
    backgroundColor: '#00A86B',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.error,
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 16,
    fontWeight: '700',
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
    alignItems: 'center',
  },
  modalIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 12,
  },
  modalMessage: {
    fontSize: 15,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  modalWarning: {
    fontSize: 13,
    color: colors.error,
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    color: colors.text.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  confirmDeleteButton: {
    backgroundColor: colors.error,
  },
  confirmDeleteButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
});
