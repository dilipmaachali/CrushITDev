import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
} from 'react-native';
import { colors } from '@/theme';

const SPORTS = [
  { id: 'cricket', name: 'Cricket', icon: '🏏' },
  { id: 'badminton', name: 'Badminton', icon: '🏸' },
  { id: 'football', name: 'Football/Soccer', icon: '⚽' },
  { id: 'pickleball', name: 'Pickleball', icon: '🎾' },
  { id: 'table-tennis', name: 'Table Tennis', icon: '🏓' },
];

export default function SelectSportScreen({ navigation, route }: any) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSports = SPORTS.filter(sport =>
    sport.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectSport = (sport: typeof SPORTS[0]) => {
    // Navigate back to either CreateGame or EditGame based on previous screen
    if (route.params?.fromEdit) {
      navigation.navigate('EditGame', { gameId: route.params.gameId, selectedSport: sport });
    } else {
      navigation.navigate('CreateGame', { selectedSport: sport });
    }
  };  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Sport</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search sports..."
        placeholderTextColor={colors.text.tertiary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoFocus
      />

      <FlatList
        data={filteredSports}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.sportItem}
            onPress={() => selectSport(item)}
          >
            <Text style={styles.sportIcon}>{item.icon}</Text>
            <Text style={styles.sportName}>{item.name}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No sports found</Text>
        }
      />
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
  closeButton: {
    fontSize: 24,
    color: colors.text.secondary,
    padding: 4,
  },
  searchInput: {
    backgroundColor: colors.surface,
    margin: 16,
    padding: 12,
    borderRadius: 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sportIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  sportName: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.text.tertiary,
    marginTop: 32,
    fontSize: 15,
  },
});
