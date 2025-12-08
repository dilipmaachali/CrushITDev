import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { colors } from '@/theme';

export default function CommunityScreen() {
  const teams = [
    { id: '1', name: 'Cricket Warriors', members: 12, sport: 'Cricket' },
    { id: '2', name: 'Football United', members: 15, sport: 'Football' },
  ];

  const tournaments = [
    { id: '1', name: 'Summer Cricket League', participants: 24, status: 'Ongoing' },
    { id: '2', name: 'Football Championship', participants: 32, status: 'Upcoming' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Community</Text>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>My Teams</Text>
          <TouchableOpacity>
            <Text style={styles.actionText}>+ New</Text>
          </TouchableOpacity>
        </View>
        {teams.map((team) => (
          <TouchableOpacity key={team.id} style={styles.card}>
            <View>
              <Text style={styles.cardTitle}>{team.name}</Text>
              <Text style={styles.cardSubtitle}>{team.sport}</Text>
            </View>
            <Text style={styles.cardMeta}>{team.members} members</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Tournaments</Text>
          <TouchableOpacity>
            <Text style={styles.actionText}>View All</Text>
          </TouchableOpacity>
        </View>
        {tournaments.map((tournament) => (
          <TouchableOpacity key={tournament.id} style={styles.card}>
            <View>
              <Text style={styles.cardTitle}>{tournament.name}</Text>
              <Text style={styles.cardSubtitle}>{tournament.participants} participants</Text>
            </View>
            <View style={[styles.badge, tournament.status === 'Ongoing' && styles.badgeActive]}>
              <Text
                style={[
                  styles.badgeText,
                  tournament.status === 'Ongoing' && styles.badgeTextActive,
                ]}
              >
                {tournament.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearby Players</Text>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.playerCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>👤</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.playerName}>Player {i}</Text>
              <Text style={styles.playerInfo}>2.5 km away • Cricket enthusiast</Text>
            </View>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>
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
    marginBottom: 20,
    marginTop: 10,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  actionText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  badge: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeActive: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  badgeText: {
    fontSize: 10,
    color: colors.text.secondary,
  },
  badgeTextActive: {
    color: '#FFFFFF',
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
  },
  playerInfo: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  followButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  followButtonText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
});
