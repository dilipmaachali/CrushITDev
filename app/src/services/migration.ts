/**
 * Data Migration Helper
 * Utilities to migrate local AsyncStorage data to backend API
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';

export class DataMigration {
  /**
   * Migrate bookings from AsyncStorage to backend
   */
  static async migrateBookings(): Promise<{ success: number; failed: number }> {
    try {
      const bookingsJson = await AsyncStorage.getItem('bookingHistory');
      if (!bookingsJson) {
        return { success: 0, failed: 0 };
      }

      const bookings = JSON.parse(bookingsJson);
      let success = 0;
      let failed = 0;

      for (const booking of bookings) {
        try {
          await api.post('/api/bookings', {
            arenaId: booking.arenaId || 'unknown',
            arenaName: booking.arena,
            sport: booking.type,
            date: booking.date,
            time: booking.time,
            duration: 60, // Default
            totalCost: booking.totalPrice,
            status: booking.status || 'confirmed',
            players: booking.players ? [booking.players] : [],
            notes: `Player: ${booking.playerName}, Contact: ${booking.contactNumber}`,
          });
          success++;
        } catch (error) {
          console.error('Failed to migrate booking:', booking.id, error);
          failed++;
        }
      }

      return { success, failed };
    } catch (error) {
      console.error('Booking migration failed:', error);
      return { success: 0, failed: 0 };
    }
  }

  /**
   * Migrate matches from AsyncStorage to backend
   */
  static async migrateMatches(sport: 'cricket' | 'badminton' | 'football'): Promise<{ success: number; failed: number }> {
    try {
      const storageKey = `${sport}Matches`;
      const matchesJson = await AsyncStorage.getItem(storageKey);
      if (!matchesJson) {
        return { success: 0, failed: 0 };
      }

      const matches = JSON.parse(matchesJson);
      let success = 0;
      let failed = 0;

      for (const match of matches) {
        try {
          await api.post('/api/matches', {
            sport,
            matchData: match,
            status: match.status || (match.currentInning ? 'in-progress' : 'completed'),
          });
          success++;
        } catch (error) {
          console.error(`Failed to migrate ${sport} match:`, match.id, error);
          failed++;
        }
      }

      return { success, failed };
    } catch (error) {
      console.error(`${sport} migration failed:`, error);
      return { success: 0, failed: 0 };
    }
  }

  /**
   * Migrate all data types
   */
  static async migrateAll(): Promise<void> {
    console.log('🔄 Starting data migration...');
    
    const bookings = await this.migrateBookings();
    console.log(`✅ Bookings: ${bookings.success} migrated, ${bookings.failed} failed`);
    
    const cricket = await this.migrateMatches('cricket');
    console.log(`✅ Cricket: ${cricket.success} migrated, ${cricket.failed} failed`);
    
    const badminton = await this.migrateMatches('badminton');
    console.log(`✅ Badminton: ${badminton.success} migrated, ${badminton.failed} failed`);
    
    const football = await this.migrateMatches('football');
    console.log(`✅ Football: ${football.success} migrated, ${football.failed} failed`);
    
    console.log('✅ Migration complete');
  }
}
