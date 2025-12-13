import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { colors } from '@/theme';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = 100;
const SPACING = 12;

// Mock booked slots - in real app, fetch from backend
const BOOKED_SLOTS = [
  '09:00', '09:30', '10:00', '14:00', '14:30', '15:00', '18:00', '18:30'
];

export default function SelectTimeScreen({ navigation, route }: any) {
  const [selectedStartIndex, setSelectedStartIndex] = useState(4); // 8:00 AM
  const [selectedEndIndex, setSelectedEndIndex] = useState(6); // 9:00 AM
  const startScrollRef = useRef<ScrollView>(null);
  const endScrollRef = useRef<ScrollView>(null);

  // Generate time slots from 6 AM to 11 PM in 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = formatTime(hour, minute);
        const isBooked = BOOKED_SLOTS.includes(timeString);
        slots.push({ value: timeString, display: displayTime, isBooked });
      }
    }
    return slots;
  };

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const timeSlots = generateTimeSlots();

  const handleStartScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (ITEM_WIDTH + SPACING));
    setSelectedStartIndex(index);
  };

  const handleEndScroll = (event: any) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (ITEM_WIDTH + SPACING));
    setSelectedEndIndex(index);
  };

  const handleSelectStart = (index: number) => {
    if (timeSlots[index].isBooked) return;
    setSelectedStartIndex(index);
    startScrollRef.current?.scrollTo({
      x: index * (ITEM_WIDTH + SPACING),
      animated: true,
    });
    // Auto-adjust end time if needed
    if (index >= selectedEndIndex) {
      const newEndIndex = Math.min(index + 2, timeSlots.length - 1);
      setSelectedEndIndex(newEndIndex);
    }
  };

  const handleSelectEnd = (index: number) => {
    if (timeSlots[index].isBooked) return;
    if (index <= selectedStartIndex) return; // End must be after start
    setSelectedEndIndex(index);
    endScrollRef.current?.scrollTo({
      x: index * (ITEM_WIDTH + SPACING),
      animated: true,
    });
  };

  const handleConfirm = () => {
    const startTime = timeSlots[selectedStartIndex].value;
    const endTime = timeSlots[selectedEndIndex].value;
    // Navigate back to either CreateGame or EditGame based on previous screen
    if (route.params?.fromEdit) {
      navigation.navigate('EditGame', { 
        gameId: route.params.gameId,
        selectedTime: { start: startTime, end: endTime }
      });
    } else {
      navigation.navigate('CreateGame', {
        selectedTime: { start: startTime, end: endTime }
      });
    }
  };

  const renderTimeSlot = (
    item: typeof timeSlots[0],
    index: number,
    selectedIndex: number,
    onSelect: (index: number) => void,
    isEndTime: boolean = false
  ) => {
    const isSelected = selectedIndex === index;
    const distance = Math.abs(selectedIndex - index);
    const opacity = Math.max(0.3, 1 - distance * 0.15);
    const scale = isSelected ? 1 : Math.max(0.8, 1 - distance * 0.1);
    
    // Disable if booked or if end time is before/equal to start time
    const isDisabled = item.isBooked || (isEndTime && index <= selectedStartIndex);

    return (
      <TouchableOpacity
        key={index}
        style={[
          styles.timeSlot,
          { opacity: isDisabled ? 0.3 : opacity, transform: [{ scale }] },
          isSelected && styles.timeSlotSelected,
          isDisabled && styles.timeSlotDisabled,
        ]}
        onPress={() => !isDisabled && onSelect(index)}
        disabled={isDisabled}
      >
        <Text style={[
          styles.timeText,
          isSelected && styles.timeTextSelected,
          isDisabled && styles.timeTextDisabled,
        ]}>
          {item.display}
        </Text>
        {item.isBooked && !isEndTime && (
          <Text style={styles.bookedLabel}>Booked</Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Time</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.content}>
        {/* Start Time */}
        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>Start Time</Text>
          <View style={styles.pickerContainer}>
            <View style={styles.selectionIndicator} />
            <ScrollView
              ref={startScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={ITEM_WIDTH + SPACING}
              decelerationRate="fast"
              onScroll={handleStartScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{
                paddingHorizontal: (width / 2) - (ITEM_WIDTH / 2),
              }}
            >
              {timeSlots.map((slot, index) => 
                renderTimeSlot(slot, index, selectedStartIndex, handleSelectStart, false)
              )}
            </ScrollView>
          </View>
        </View>

        {/* End Time */}
        <View style={styles.timeSection}>
          <Text style={styles.sectionTitle}>End Time</Text>
          <View style={styles.pickerContainer}>
            <View style={styles.selectionIndicator} />
            <ScrollView
              ref={endScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={ITEM_WIDTH + SPACING}
              decelerationRate="fast"
              onScroll={handleEndScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{
                paddingHorizontal: (width / 2) - (ITEM_WIDTH / 2),
              }}
            >
              {timeSlots.map((slot, index) => 
                renderTimeSlot(slot, index, selectedEndIndex, handleSelectEnd, true)
              )}
            </ScrollView>
          </View>
        </View>

        {/* Duration Info */}
        <View style={styles.durationInfo}>
          <Text style={styles.durationLabel}>Duration</Text>
          <Text style={styles.durationValue}>
            {(() => {
              const startMinutes = selectedStartIndex * 30 + 360; // 6 AM = 360 min
              const endMinutes = selectedEndIndex * 30 + 360;
              const duration = endMinutes - startMinutes;
              const hours = Math.floor(duration / 60);
              const mins = duration % 60;
              return `${hours}h ${mins > 0 ? mins + 'm' : ''}`;
            })()}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Confirm Time</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  backButton: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '600',
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  timeSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  pickerContainer: {
    position: 'relative',
    height: 100,
  },
  selectionIndicator: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: ITEM_WIDTH,
    height: 70,
    marginLeft: -ITEM_WIDTH / 2,
    marginTop: -35,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary,
    backgroundColor: colors.primary + '08',
    zIndex: 1,
    pointerEvents: 'none',
  },
  timeSlot: {
    width: ITEM_WIDTH,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  timeSlotSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '15',
  },
  timeSlotDisabled: {
    backgroundColor: colors.background,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  timeTextSelected: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 18,
  },
  timeTextDisabled: {
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  bookedLabel: {
    fontSize: 10,
    color: colors.error,
    marginTop: 4,
    fontWeight: '600',
  },
  durationInfo: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  durationLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  durationValue: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.primary,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
  confirmButton: {
    backgroundColor: colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
