import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';
import { useFocusEffect } from '@react-navigation/native';

interface ScheduledGame {
  id: string;
  sport: string;
  title: string;
  description: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  location: {
    address: string;
    arenaName?: string;
  };
  hostId: string;
  hostName: string;
  maxPlayers: number;
  currentPlayers: Array<{ userId: string; userName: string; gender: string; status: string }>;
  paymentType: 'prepaid' | 'pay_later' | 'free';
  costPerPlayer?: number;
  isPublic: boolean;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  shareCode: string;
  skillLevel?: 'beginner' | 'intermediate' | 'advanced' | 'all';
}

const SPORTS = [
  { id: 'Badminton', name: 'Badminton', emoji: '🏸' },
  { id: 'Pickleball', name: 'Pickleball', emoji: '🎾' },
  { id: 'Football', name: 'Football', emoji: '⚽' },
  { id: 'Squash', name: 'Squash', emoji: '🎾' },
  { id: 'Box Cricket', name: 'Box Cricket', emoji: '🏏' },
  { id: 'Table Tennis', name: 'Table Tennis', emoji: '🏓' },
];

const TIME_SLOTS = [
  { id: 'morning', label: 'Morning (6AM-12PM)' },
  { id: 'afternoon', label: 'Afternoon (12PM-5PM)' },
  { id: 'evening', label: 'Evening (5PM-9PM)' },
  { id: 'night', label: 'Night (9PM-12AM)' },
];

const SKILL_LEVELS = [
  { id: 'all', label: 'All Levels' },
  { id: 'beginner', label: 'Beginner' },
  { id: 'intermediate', label: 'Intermediate' },
  { id: 'advanced', label: 'Advanced' },
];

const JoinScreen = () => {
  const [games, setGames] = useState<ScheduledGame[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('all');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>('all');
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [dates, setDates] = useState<Array<{ date: Date; label: string; shortLabel: string }>>([]);
  const [currentUserId] = useState('USER123'); // Replace with actual user ID

  useEffect(() => {
    generateDates();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadGames();
    }, [])
  );

  const generateDates = () => {
    const dateArray = [];
    const today = new Date();
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let label = '';
      if (i === 0) label = 'Today';
      else if (i === 1) label = 'Tomorrow';
      else label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const shortLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      dateArray.push({ date, label, shortLabel });
    }
    
    setDates(dateArray);
    if (dateArray.length > 0) {
      setSelectedDate(dateArray[0].date.toDateString());
    }
  };

  const loadGames = async () => {
    try {
      const savedGames = await AsyncStorage.getItem('scheduledGames');
      if (savedGames) {
        setGames(JSON.parse(savedGames));
      }
    } catch (error) {
      console.error('Error loading games:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadGames();
    setRefreshing(false);
  };

  const getFilteredGames = () => {
    return games.filter(game => {
      // Only show public games
      if (!game.isPublic) return false;
      
      // Don't show games user is already in
      if (game.hostId === currentUserId || 
          game.currentPlayers.some(p => p.userId === currentUserId)) {
        return false;
      }
      
      // Filter by status
      if (game.status !== 'scheduled') return false;
      
      // Filter by sport
      if (selectedSport !== 'all' && game.sport !== selectedSport) return false;
      
      // Filter by date
      if (selectedDate) {
        const gameDate = new Date(game.scheduledDate);
        if (gameDate.toDateString() !== selectedDate) return false;
      }
      
      // Filter by time slot
      if (selectedTimeSlot !== 'all') {
        const startHour = parseInt(game.startTime.split(':')[0]);
        if (selectedTimeSlot === 'morning' && (startHour < 6 || startHour >= 12)) return false;
        if (selectedTimeSlot === 'afternoon' && (startHour < 12 || startHour >= 17)) return false;
        if (selectedTimeSlot === 'evening' && (startHour < 17 || startHour >= 21)) return false;
        if (selectedTimeSlot === 'night' && (startHour < 21 || startHour >= 24)) return false;
      }
      
      // Filter by skill level
      if (selectedSkillLevel !== 'all' && game.skillLevel && game.skillLevel !== 'all') {
        if (game.skillLevel !== selectedSkillLevel) return false;
      }
      
      return true;
    });
  };

  const filteredGames = getFilteredGames();

  const renderSportFilter = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.sportChip, selectedSport === item.id && styles.sportChipActive]}
      onPress={() => setSelectedSport(item.id)}
    >
      <Text style={styles.sportEmoji}>{item.emoji}</Text>
      <Text style={[styles.sportText, selectedSport === item.id && styles.sportTextActive]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderDateFilter = ({ item }: any) => {
    const isSelected = item.date.toDateString() === selectedDate;
    return (
      <TouchableOpacity
        style={[styles.dateChip, isSelected && styles.dateChipActive]}
        onPress={() => setSelectedDate(item.date.toDateString())}
      >
        <Text style={[styles.dateDay, isSelected && styles.dateDayActive]}>
          {item.shortLabel}
        </Text>
        <Text style={[styles.dateLabel, isSelected && styles.dateLabelActive]}>
          {item.label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderGameCard = (game: ScheduledGame) => (
    <TouchableOpacity
      key={game.id}
      style={styles.gameCard}
      onPress={() => {
        // Navigate to game details or join
      }}
    >
      <View style={styles.gameHeader}>
        <Text style={styles.gameTitle}>{game.title}</Text>
        {game.currentPlayers.length >= game.maxPlayers && (
          <View style={styles.fullBadge}>
            <Text style={styles.fullBadgeText}>FULL</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.gameSport}>{game.sport}</Text>
      
      <View style={styles.gameDetails}>
        <Text style={styles.detailText}>
          🕐 {game.startTime} - {game.endTime}
        </Text>
        <Text style={styles.detailText}>
          📍 {game.location.arenaName || game.location.address}
        </Text>
      </View>
      
      <View style={styles.gameFooter}>
        <Text style={styles.playersText}>
          👥 {game.currentPlayers.length}/{game.maxPlayers}
        </Text>
        {game.skillLevel && game.skillLevel !== 'all' && (
          <Text style={styles.skillText}>
            📊 {game.skillLevel}
          </Text>
        )}
        {game.paymentType !== 'free' && (
          <Text style={styles.costText}>₹{game.costPerPlayer}</Text>
        )}
      </View>
      
      <TouchableOpacity style={styles.joinButton}>
        <Text style={styles.joinButtonText}>Join Game</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Sport Quick Access */}
      <View style={styles.section}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sportScroll}>
          <TouchableOpacity
            style={[styles.sportChip, selectedSport === 'all' && styles.sportChipActive]}
            onPress={() => setSelectedSport('all')}
          >
            <Text style={styles.sportEmoji}>🎯</Text>
            <Text style={[styles.sportText, selectedSport === 'all' && styles.sportTextActive]}>
              All Sports
            </Text>
          </TouchableOpacity>
          
          {SPORTS.map(sport => (
            <TouchableOpacity
              key={sport.id}
              style={[styles.sportChip, selectedSport === sport.id && styles.sportChipActive]}
              onPress={() => setSelectedSport(sport.id)}
            >
              <Text style={styles.sportEmoji}>{sport.emoji}</Text>
              <Text style={[styles.sportText, selectedSport === sport.id && styles.sportTextActive]}>
                {sport.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Date Scroller */}
      <View style={styles.section}>
        <FlatList
          horizontal
          data={dates}
          renderItem={renderDateFilter}
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dateScroll}
        />
      </View>

      {/* Filters Button */}
      <View style={styles.filtersRow}>
        <TouchableOpacity
          style={styles.filtersButton}
          onPress={() => setShowFiltersModal(true)}
        >
          <Text style={styles.filtersButtonText}>
            ⚙️ Filters {(selectedTimeSlot !== 'all' || selectedSkillLevel !== 'all') && '•'}
          </Text>
        </TouchableOpacity>
        
        <Text style={styles.resultsCount}>
          {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'} found
        </Text>
      </View>

      {/* Games List */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredGames.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              No games available for the selected filters.
            </Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your filters or check back later!
            </Text>
          </View>
        ) : (
          filteredGames.map(renderGameCard)
        )}
      </ScrollView>

      {/* Filters Modal */}
      <Modal
        visible={showFiltersModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFiltersModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFiltersModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Time Slot Filter */}
            <Text style={styles.filterSectionTitle}>Time Slot</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[styles.filterOption, selectedTimeSlot === 'all' && styles.filterOptionActive]}
                onPress={() => setSelectedTimeSlot('all')}
              >
                <Text style={[styles.filterOptionText, selectedTimeSlot === 'all' && styles.filterOptionTextActive]}>
                  All Times
                </Text>
              </TouchableOpacity>
              
              {TIME_SLOTS.map(slot => (
                <TouchableOpacity
                  key={slot.id}
                  style={[styles.filterOption, selectedTimeSlot === slot.id && styles.filterOptionActive]}
                  onPress={() => setSelectedTimeSlot(slot.id)}
                >
                  <Text style={[styles.filterOptionText, selectedTimeSlot === slot.id && styles.filterOptionTextActive]}>
                    {slot.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Skill Level Filter */}
            <Text style={styles.filterSectionTitle}>Skill Level</Text>
            <View style={styles.filterOptions}>
              {SKILL_LEVELS.map(level => (
                <TouchableOpacity
                  key={level.id}
                  style={[styles.filterOption, selectedSkillLevel === level.id && styles.filterOptionActive]}
                  onPress={() => setSelectedSkillLevel(level.id)}
                >
                  <Text style={[styles.filterOptionText, selectedSkillLevel === level.id && styles.filterOptionTextActive]}>
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFiltersModal(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  section: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sportScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  sportChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 6,
  },
  sportChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  sportEmoji: {
    fontSize: 18,
  },
  sportText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  sportTextActive: {
    color: colors.white,
  },
  dateScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dateChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    minWidth: 80,
  },
  dateChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dateDay: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  dateDayActive: {
    color: colors.white,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  dateLabelActive: {
    color: colors.white,
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filtersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filtersButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  resultsCount: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  gameCard: {
    backgroundColor: colors.card,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  gameHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    flex: 1,
  },
  fullBadge: {
    backgroundColor: colors.error + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  fullBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.error,
  },
  gameSport: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  gameDetails: {
    marginBottom: 12,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  gameFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  playersText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
  },
  skillText: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  costText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
    marginLeft: 'auto',
  },
  joinButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  joinButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalClose: {
    fontSize: 24,
    color: colors.textSecondary,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  filterOptions: {
    gap: 8,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text,
  },
  filterOptionTextActive: {
    color: colors.white,
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default JoinScreen;
