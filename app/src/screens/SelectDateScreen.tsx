import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { colors } from '@/theme';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function SelectDateScreen({ navigation, route }: any) {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const isPastDate = (date: Date) => {
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    return checkDate < todayDate;
  };

  const isSameDate = (date1: Date | null, date2: Date) => {
    if (!date1) return false;
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const isToday = (date: Date) => {
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(currentYear, currentMonth, day));
    }

    return days;
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleSelectDate = (date: Date) => {
    if (isPastDate(date)) return;
    setSelectedDate(date);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      // Format date manually to avoid timezone offset issues with toISOString()
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;
      
      // Navigate back to either CreateGame or EditGame based on previous screen
      if (route.params?.fromEdit) {
        navigation.navigate('EditGame', { gameId: route.params.gameId, selectedDate: dateString });
      } else {
        navigation.navigate('CreateGame', { selectedDate: dateString });
      }
    }
  };

  const calendarDays = generateCalendarDays();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Select Date</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.calendarContainer}>
        {/* Month Navigation */}
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthTitle}>
            {MONTHS[currentMonth]} {currentYear}
          </Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Day Headers */}
        <View style={styles.dayHeaders}>
          {DAYS.map((day) => (
            <View key={day} style={styles.dayHeader}>
              <Text style={styles.dayHeaderText}>{day}</Text>
            </View>
          ))}
        </View>

        {/* Calendar Grid */}
        <ScrollView style={styles.calendarScroll}>
          <View style={styles.calendarGrid}>
            {calendarDays.map((date, index) => {
              if (!date) {
                return <View key={`empty-${index}`} style={styles.emptyDay} />;
              }

              const isSelected = isSameDate(selectedDate, date);
              const isPast = isPastDate(date);
              const isTodayDate = isToday(date);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDay,
                    isPast && styles.pastDay,
                    isTodayDate && !isSelected && styles.todayDay,
                  ]}
                  onPress={() => handleSelectDate(date)}
                  disabled={isPast}
                >
                  <Text
                    style={[
                      styles.dayText,
                      isSelected && styles.selectedDayText,
                      isPast && styles.pastDayText,
                      isTodayDate && !isSelected && styles.todayDayText,
                    ]}
                  >
                    {date.getDate()}
                  </Text>
                  {isTodayDate && !isSelected && (
                    <View style={styles.todayDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            !selectedDate && styles.confirmButtonDisabled,
          ]}
          onPress={handleConfirm}
          disabled={!selectedDate}
        >
          <Text style={styles.confirmButtonText}>
            {selectedDate
              ? `Confirm - ${selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
              : 'Select a date'}
          </Text>
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
  calendarContainer: {
    flex: 1,
    padding: 16,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: colors.surface,
  },
  navButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: '600',
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  calendarScroll: {
    flex: 1,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  emptyDay: {
    width: '14.28%',
    aspectRatio: 1,
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedDay: {
    backgroundColor: colors.primary,
  },
  pastDay: {
    opacity: 0.3,
  },
  todayDay: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text.primary,
  },
  selectedDayText: {
    color: colors.white,
    fontWeight: '700',
  },
  pastDayText: {
    color: colors.text.tertiary,
  },
  todayDayText: {
    color: colors.primary,
    fontWeight: '700',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 2,
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
  confirmButtonDisabled: {
    backgroundColor: colors.border,
  },
  confirmButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
