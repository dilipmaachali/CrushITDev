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

const ARENAS = [
  { id: '1', name: 'Sports Complex A', location: '123 Main St, Downtown', courts: 5 },
  { id: '2', name: 'Arena Center', location: '456 Park Ave, Midtown', courts: 8 },
  { id: '3', name: 'Elite Sports Club', location: '789 Oak Rd, Uptown', courts: 3 },
  { id: '4', name: 'Community Courts', location: '321 Elm St, Westside', courts: 6 },
  { id: '5', name: 'Pro Arena', location: '654 Pine Blvd, Eastside', courts: 10 },
];

export default function SelectArenaScreen({ navigation, route }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredArenas = ARENAS.filter(arena =>
    arena.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    arena.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectArena = (arena: typeof ARENAS[0]) => {
    // Navigate back to either CreateGame or EditGame based on previous screen
    if (route.params?.fromEdit) {
      navigation.navigate('EditGame', { gameId: route.params.gameId, selectedArena: arena });
    } else {
      navigation.navigate('CreateGame', { selectedArena: arena });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Arena</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="Search by name or location..."
        placeholderTextColor={colors.text.tertiary}
        value={searchQuery}
        onChangeText={setSearchQuery}
        autoFocus
      />

      <FlatList
        data={filteredArenas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.arenaItem}
            onPress={() => selectArena(item)}
          >
            <View style={styles.arenaIcon}>
              <Text style={styles.arenaIconText}>📍</Text>
            </View>
            <View style={styles.arenaInfo}>
              <Text style={styles.arenaName}>{item.name}</Text>
              <Text style={styles.arenaLocation}>{item.location}</Text>
              <Text style={styles.arenaCourts}>{item.courts} courts available</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No arenas found nearby</Text>
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
  arenaItem: {
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
  arenaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  arenaIconText: {
    fontSize: 24,
  },
  arenaInfo: {
    flex: 1,
  },
  arenaName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  arenaLocation: {
    fontSize: 13,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  arenaCourts: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.text.tertiary,
    marginTop: 32,
    fontSize: 15,
  },
});
