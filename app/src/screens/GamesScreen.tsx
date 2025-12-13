import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MyGamesScreen from './Games/MyGamesScreen';
import RecommendedScreen from './Games/RecommendedScreen';
import { colors } from '@/theme';

export default function GamesScreen() {
  const [activeTab, setActiveTab] = useState<'myCrushList' | 'recommended'>('myCrushList');

  return (
    <View style={styles.container}>
      {/* Tab Header */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'myCrushList' && styles.activeTab]}
          onPress={() => setActiveTab('myCrushList')}
        >
          <Text style={[styles.tabText, activeTab === 'myCrushList' && styles.activeTabText]}>
            My Crush List
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recommended' && styles.activeTab]}
          onPress={() => setActiveTab('recommended')}
        >
          <Text style={[styles.tabText, activeTab === 'recommended' && styles.activeTabText]}>
            Recommended
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === 'myCrushList' && <MyGamesScreen />}
        {activeTab === 'recommended' && <RecommendedScreen />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.secondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
});
