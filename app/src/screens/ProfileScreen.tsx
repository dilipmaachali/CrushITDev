import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  Switch,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '@/theme';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProfileScreen({ navigation }: any) {
  const [userName, setUserName] = useState('Test User');
  const [userEmail, setUserEmail] = useState('test@crushit.app');
  const [userPhone, setUserPhone] = useState('+91 9876543210');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(userName);
  const [editPhone, setEditPhone] = useState(userPhone);
  const [showBookings, setShowBookings] = useState(false);
  const [showPartners, setShowPartners] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const { galaxyThemeEnabled, toggleGalaxyTheme } = useTheme();

  useFocusEffect(
    React.useCallback(() => {
      loadOrderHistory();
    }, [])
  );

  const loadOrderHistory = async () => {
    try {
      const orders = await AsyncStorage.getItem('orderHistory');
      if (orders) {
        setOrderHistory(JSON.parse(orders));
      }
    } catch (error) {
      console.log('Error loading orders:', error);
    }
  };

  const handleViewOrders = () => {
    if (orderHistory.length === 0) {
      Alert.alert('No Orders', 'You haven\'t placed any orders yet. Visit the Shop tab to buy sports equipment!');
      return;
    }
    setShowOrders(true);
  };

  const handleViewBookings = () => {
    const bookings = [
      { id: '1', arena: 'Elite Cricket Turf', date: 'Today, 6:00 PM', status: 'Upcoming' },
      { id: '2', arena: 'Badminton Palace', date: 'Yesterday', status: 'Completed' },
    ];
    
    const bookingsList = bookings.map(b => `${b.arena}\n${b.date} - ${b.status}`).join('\n\n');
    Alert.alert('My Bookings', bookingsList, [
      { text: 'Close' },
      { text: 'View All', onPress: () => Alert.alert('View All Bookings', 'Full booking history coming soon!') }
    ]);
  };

  const handleManagePartners = () => {
    Alert.alert(
      'Your Partners',
      'Current Partners:\n\n1. John Doe (Cricket)\n2. Sarah Smith (Badminton)\n3. Mike Johnson (Football)',
      [
        { text: 'Close' },
        { text: 'Add Partner', onPress: () => Alert.alert('Add Partner', 'Enter partner details:\n\n(Feature coming soon)') }
      ]
    );
  };

  const menuSections = [
    {
      title: 'My Activity',
      items: [
        {
          icon: '📅',
          title: 'My Bookings',
          subtitle: 'View and manage your bookings',
          onPress: handleViewBookings,
        },
        {
          icon: '🛍️',
          title: 'My Orders',
          subtitle: `${orderHistory.length} orders placed`,
          onPress: handleViewOrders,
        },
        {
          icon: '🎮',
          title: 'Recent Games',
          subtitle: 'Games you played recently',
          onPress: () => Alert.alert('Recent Games', 'Last 3 games:\n\n🏏 Cricket - Dec 7, 2025\n🏸 Badminton - Dec 5, 2025\n⚽ Football - Dec 3, 2025'),
        },
      ],
    },
    {
      title: 'Partners & Rewards',
      items: [
        {
          icon: '🤝',
          title: 'Your Partners',
          subtitle: 'View and manage your partners',
          onPress: handleManagePartners,
        },
        {
          icon: '🎁',
          title: 'Offers',
          subtitle: 'Available offers and discounts',
          onPress: () => Alert.alert('Special Offers', 'CRUSH50 - 50% off first booking\nWEEKEND - Free weekend slot\nPOINTS2X - Double points\n\nTap offer code to copy', [
            { text: 'Close' },
            { text: 'Copy CRUSH50', onPress: () => Alert.alert('Copied!', 'Code CRUSH50 copied to clipboard') }
          ]),
        },
        {
          icon: '💰',
          title: 'Invite & Earn',
          subtitle: 'Refer friends and earn rewards',
          onPress: () => Alert.alert('Invite & Earn', 'Your Referral Code: CRUSH2025\n\nRewards:\n• You earn ₹500 per referral\n• Friend gets ₹200 off\n\nTotal Earnings: ₹0\nReferrals: 0', [
            { text: 'Close' },
            { text: 'Share Code', onPress: () => Alert.alert('Share', 'Share your code CRUSH2025 with friends!') }
          ]),
        },
      ],
    },
    {
      title: 'Settings',
      items: [
        {
          icon: '🌌',
          title: 'Galaxy Theme',
          subtitle: galaxyThemeEnabled ? 'Enabled - Deep space vibes' : 'Disabled - Default theme',
          onPress: () => {},
          isSwitch: true,
        },
        {
          icon: '⚙️',
          title: 'Preferences & Privacy',
          subtitle: 'Manage your preferences',
          onPress: () => navigation.navigate('Settings'),
        },
        {
          icon: '❓',
          title: 'Help & Support',
          subtitle: 'Get help or contact us',
          onPress: () => Alert.alert('Help & Support', 'Email: support@crushit.app\nPhone: +91 80 1234 5678\n\nFAQ available in settings'),
        },
      ],
    },
  ];

  const handleEditProfile = () => {
    setEditName(userName);
    setEditPhone(userPhone);
    setIsEditing(true);
  };

  const handleSaveProfile = async () => {
    setUserName(editName);
    setUserPhone(editPhone);
    // Save to AsyncStorage so it syncs to home page
    try {
      await AsyncStorage.setItem('userName', editName);
      await AsyncStorage.setItem('userPhone', editPhone);
    } catch (error) {
      console.log('Error saving profile:', error);
    }
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            Alert.alert('Logged Out', 'You have been logged out successfully');
          },
        },
      ]
    );
  };

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
          </View>
          <Text style={styles.userName}>{userName}</Text>
          <Text style={styles.userEmail}>{userEmail}</Text>
          <Text style={styles.userPhone}>{userPhone}</Text>
          
          <TouchableOpacity 
            style={styles.editButton}
            onPress={handleEditProfile}
            activeOpacity={0.8}
          >
            <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <View key={sectionIndex} style={styles.section}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, itemIndex) => (
            <TouchableOpacity
              key={itemIndex}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={item.isSwitch ? 1 : 0.7}
            >
              <View style={styles.menuItemLeft}>
                <Text style={styles.menuIcon}>{item.icon}</Text>
                <View style={styles.menuItemText}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                </View>
              </View>
              {item.isSwitch ? (
                <Switch
                  value={galaxyThemeEnabled}
                  onValueChange={toggleGalaxyTheme}
                  trackColor={{ false: '#767577', true: '#667eea' }}
                  thumbColor={galaxyThemeEnabled ? '#764ba2' : '#f4f3f4'}
                />
              ) : (
                <Text style={styles.menuArrow}>›</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>

    {/* Edit Profile Modal */}
    <Modal
      visible={isEditing}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setIsEditing(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Edit Profile</Text>
          
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={editName}
            onChangeText={setEditName}
            placeholder="Enter your name"
            placeholderTextColor={colors.text.tertiary}
          />

          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={editPhone}
            onChangeText={setEditPhone}
            placeholder="Enter phone number"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Email (Read-only)</Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={userEmail}
            editable={false}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton]}
              onPress={() => setIsEditing(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.saveButton]}
              onPress={handleSaveProfile}
            >
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>

    {/* Orders Modal */}
    <Modal
      visible={showOrders}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowOrders(false)}
    >
      <View style={styles.ordersModalContainer}>
        <View style={styles.ordersModalHeader}>
          <Text style={styles.ordersModalTitle}>My Orders</Text>
          <TouchableOpacity onPress={() => setShowOrders(false)}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.ordersList}>
          {orderHistory.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.orderId}>Order #{order.id}</Text>
                <Text style={styles.orderStatus}>{order.status}</Text>
              </View>
              <Text style={styles.orderDate}>
                {new Date(order.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
              <View style={styles.orderItems}>
                {order.items.map((item: any, index: number) => (
                  <Text key={index} style={styles.orderItem}>
                    • {item.name} (x{item.quantity})
                  </Text>
                ))}
              </View>
              <View style={styles.orderFooter}>
                <Text style={styles.orderTotal}>Total: ₹{order.total}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: 40,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.9,
    marginBottom: 16,
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.white,
  },
  editButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  menuItemText: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 13,
    color: colors.text.secondary,
  },
  menuArrow: {
    fontSize: 24,
    color: colors.text.tertiary,
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff4444',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ff4444',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputDisabled: {
    backgroundColor: colors.text.tertiary + '20',
    color: colors.text.secondary,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  saveButton: {
    backgroundColor: colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  // Orders Modal
  ordersModalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  ordersModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  ordersModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: 28,
    color: colors.text.tertiary,
    paddingHorizontal: 8,
  },
  ordersList: {
    flex: 1,
    padding: 16,
  },
  orderCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text.primary,
  },
  orderStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  orderDate: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: 4,
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 12,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    textAlign: 'right',
  },
});
