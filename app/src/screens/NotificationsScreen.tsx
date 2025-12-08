import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { colors } from '@/theme';

export default function NotificationsScreen() {
  const notifications = [
    {
      id: '1',
      type: 'booking',
      title: 'Booking Confirmed',
      description: 'Your cricket turf booking for tomorrow is confirmed',
      time: '2 hours ago',
      unread: true,
    },
    {
      id: '2',
      type: 'offer',
      title: 'Special Offer',
      description: '50% off on next booking - Use code CRUSH50',
      time: '5 hours ago',
      unread: true,
    },
    {
      id: '3',
      type: 'team',
      title: 'Team Invitation',
      description: 'You are invited to join Cricket Warriors team',
      time: '1 day ago',
      unread: false,
    },
    {
      id: '4',
      type: 'tournament',
      title: 'Tournament Started',
      description: 'Summer Cricket League has started',
      time: '2 days ago',
      unread: false,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return '📅';
      case 'offer':
        return '🎁';
      case 'team':
        return '👥';
      case 'tournament':
        return '🏆';
      default:
        return '🔔';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Notifications</Text>
        <TouchableOpacity>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.notification, item.unread && styles.notificationUnread]}
          >
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{getIcon(item.type)}</Text>
            </View>
            <View style={styles.notificationContent}>
              <Text style={styles.notificationTitle}>{item.title}</Text>
              <Text style={styles.notificationDescription}>{item.description}</Text>
              <Text style={styles.notificationTime}>{item.time}</Text>
            </View>
            {item.unread && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        )}
        scrollEnabled={false}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  clearText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  notification: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    alignItems: 'flex-start',
  },
  notificationUnread: {
    backgroundColor: 'rgba(90, 0, 255, 0.03)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  notificationDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 11,
    color: colors.text.tertiary,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginLeft: 8,
    marginTop: 6,
  },
});
