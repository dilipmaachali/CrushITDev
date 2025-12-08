import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '@/config/api';
import { colors } from '@/theme';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  createdAt: string;
  balanceAfter: number;
}

interface Wallet {
  userId: string;
  balance: number;
  transactions: Transaction[];
}

export default function WalletScreen() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [recharging, setRecharging] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'razorpay' | 'wallet'>('razorpay');

  useEffect(() => {
    loadWallet();
  }, []);

  const loadWallet = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const userResponse = await axios.get(`${API_CONFIG.BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const walletResponse = await axios.get(
        `${API_CONFIG.BASE_URL}/wallet/${userResponse.data.id}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setWallet(walletResponse.data);
    } catch (error) {
      console.error('Failed to load wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRecharge = async (amount: number) => {
    await processRecharge(amount);
  };

  const handleCustomRecharge = async () => {
    if (!rechargeAmount || parseInt(rechargeAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }
    await processRecharge(parseInt(rechargeAmount));
  };

  const processRecharge = async (amount: number) => {
    setRecharging(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) return;

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/wallet/${wallet?.userId}/recharge`,
        { amount, method: selectedPaymentMethod },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.success) {
        setWallet(response.data.newBalance);
        setRechargeAmount('');
        setShowRechargeModal(false);
        Alert.alert('Success', `₹${amount} added to wallet!`);
        await loadWallet();
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Recharge failed');
    } finally {
      setRecharging(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balance}>₹{wallet?.balance?.toLocaleString() || '0'}</Text>
        <Text style={styles.currency}>Indian Rupees</Text>

        <TouchableOpacity
          style={styles.addMoneyButton}
          onPress={() => setShowRechargeModal(true)}
        >
          <Text style={styles.addMoneyButtonText}>+ Add Money</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Recharge */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Recharge</Text>
        <View style={styles.quickAmounts}>
          {[500, 1000, 2000, 5000].map((amount) => (
            <TouchableOpacity
              key={amount}
              style={styles.quickButton}
              onPress={() => handleQuickRecharge(amount)}
            >
              <Text style={styles.quickButtonText}>₹{amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Transaction History */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Transaction History</Text>
          <TouchableOpacity onPress={loadWallet}>
            <Text style={styles.refreshText}>↻ Refresh</Text>
          </TouchableOpacity>
        </View>

        {wallet?.transactions && wallet.transactions.length > 0 ? (
          wallet.transactions
            .slice()
            .reverse()
            .slice(0, 10)
            .map((transaction) => (
              <View key={transaction.id} style={styles.transaction}>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionDesc}>{transaction.description}</Text>
                  <Text style={styles.transactionDate}>
                    {new Date(transaction.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text
                    style={[
                      styles.amount,
                      {
                        color: transaction.type === 'credit' ? colors.success || '#00AA00' : colors.black,
                      },
                    ]}
                  >
                    {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount}
                  </Text>
                  <Text style={styles.balance}>Balance: ₹{transaction.balanceAfter}</Text>
                </View>
              </View>
            ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No transactions yet</Text>
          </View>
        )}
      </View>

      {/* Recharge Modal */}
      <Modal
        visible={showRechargeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRechargeModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Money to Wallet</Text>
              <TouchableOpacity onPress={() => setShowRechargeModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Custom Amount */}
            <View style={styles.inputSection}>
              <Text style={styles.label}>Enter Amount</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter amount"
                  placeholderTextColor={colors.grey}
                  value={rechargeAmount}
                  onChangeText={setRechargeAmount}
                  keyboardType="numeric"
                  editable={!recharging}
                />
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.paymentSection}>
              <Text style={styles.label}>Payment Method</Text>
              <TouchableOpacity
                style={[
                  styles.methodButton,
                  selectedPaymentMethod === 'razorpay' && styles.methodButtonActive,
                ]}
                onPress={() => setSelectedPaymentMethod('razorpay')}
              >
                <View
                  style={[
                    styles.radioButton,
                    selectedPaymentMethod === 'razorpay' && styles.radioButtonActive,
                  ]}
                />
                <Text style={styles.methodText}>Razorpay (Credit/Debit Card, UPI)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.methodButton,
                  selectedPaymentMethod === 'wallet' && styles.methodButtonActive,
                ]}
                onPress={() => setSelectedPaymentMethod('wallet')}
              >
                <View
                  style={[
                    styles.radioButton,
                    selectedPaymentMethod === 'wallet' && styles.radioButtonActive,
                  ]}
                />
                <Text style={styles.methodText}>Wallet</Text>
              </TouchableOpacity>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowRechargeModal(false)}
                disabled={recharging}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.rechargeButton, recharging && styles.disabledButton]}
                onPress={handleCustomRecharge}
                disabled={recharging}
              >
                {recharging ? (
                  <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <Text style={styles.rechargeButtonText}>Recharge Now</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Info */}
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                💡 Minimum recharge amount: ₹100 | No charges applied
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.lightBackground,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  balanceCard: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 16,
    marginVertical: 16,
    alignItems: 'center',
    elevation: 4,
  },
  balanceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
    fontWeight: '500',
  },
  balance: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
  },
  currency: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 16,
  },
  addMoneyButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addMoneyButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.black,
  },
  refreshText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
  quickAmounts: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  quickButton: {
    flex: 1,
    minWidth: '22%',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
  },
  quickButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  transaction: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightGrey,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDesc: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.grey,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: colors.grey,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 24,
    paddingHorizontal: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  closeButton: {
    fontSize: 24,
    color: colors.grey,
  },
  inputSection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.grey,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.lightBackground,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.black,
  },
  paymentSection: {
    marginBottom: 20,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    borderRadius: 8,
  },
  methodButtonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(0, 150, 136, 0.05)',
  },
  radioButton: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.lightGrey,
    marginRight: 12,
  },
  radioButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  methodText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.black,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.lightGrey,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: colors.black,
    fontWeight: '600',
    fontSize: 14,
  },
  rechargeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  rechargeButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  disabledButton: {
    opacity: 0.7,
  },
  infoBox: {
    backgroundColor: colors.lightBackground,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  infoText: {
    fontSize: 12,
    color: colors.grey,
    lineHeight: 16,
  },
});
