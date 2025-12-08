import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ScrollView, Modal } from 'react-native';
import { colors } from '@/theme';
import { ProductCard } from '@/components';
import AsyncStorage from '@react-native-async-storage/async-storage';

const mockProducts = [
  {
    id: '1',
    name: 'Cricket Bat - Premium Willow',
    price: 3500,
    rating: 4.7,
    category: 'cricket',
    stock: 15,
    image: { uri: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&h=400&fit=crop' },
  },
  {
    id: '2',
    name: 'Cricket Ball - Leather',
    price: 800,
    rating: 4.6,
    category: 'cricket',
    stock: 25,
    image: { uri: 'https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=400&h=400&fit=crop' },
  },
  {
    id: '3',
    name: 'Badminton Racquet Pro',
    price: 2500,
    rating: 4.8,
    category: 'badminton',
    stock: 12,
    image: { uri: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=400&fit=crop' },
  },
  {
    id: '4',
    name: 'Shuttlecock Set (12 pcs)',
    price: 600,
    rating: 4.5,
    category: 'badminton',
    stock: 30,
    image: { uri: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&h=400&fit=crop' },
  },
  {
    id: '5',
    name: 'Football - Size 5',
    price: 1200,
    rating: 4.7,
    category: 'football',
    stock: 20,
    image: { uri: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=400&fit=crop' },
  },
  {
    id: '6',
    name: 'Tennis Racquet',
    price: 3200,
    rating: 4.6,
    category: 'tennis',
    stock: 8,
    image: { uri: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=400&h=400&fit=crop' },
  },
  {
    id: '7',
    name: 'Basketball - Indoor/Outdoor',
    price: 1500,
    rating: 4.5,
    category: 'basketball',
    stock: 18,
    image: { uri: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&h=400&fit=crop' },
  },
  {
    id: '8',
    name: 'Sports Bag - Duffle',
    price: 1800,
    rating: 4.4,
    category: 'accessories',
    stock: 10,
    image: { uri: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop' },
  },
];

export default function ShopScreen({ navigation }: any) {
  const [cart, setCart] = useState<any[]>([]);
  const [showCartModal, setShowCartModal] = useState(false);

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    Alert.alert('Added to Cart', `${product.name} added to your cart!`);
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.quantity + delta;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const saveOrderToHistory = async (orderId: string) => {
    try {
      const order = {
        id: orderId,
        items: cart,
        total: getTotalPrice(),
        date: new Date().toISOString(),
        status: 'Confirmed',
      };
      const existingOrders = await AsyncStorage.getItem('orderHistory');
      const orders = existingOrders ? JSON.parse(existingOrders) : [];
      orders.unshift(order);
      await AsyncStorage.setItem('orderHistory', JSON.stringify(orders));
    } catch (error) {
      console.log('Error saving order:', error);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Cart Empty', 'Please add items to cart before checkout');
      return;
    }

    const itemsList = cart.map(item => `${item.name} (x${item.quantity})`).join('\n');
    Alert.alert(
      'Checkout',
      `Items:\n${itemsList}\n\nTotal: ₹${getTotalPrice()}\n\nProceed to payment?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Pay Now',
          onPress: async () => {
            const orderId = `ORD${Date.now().toString().slice(-6)}`;
            await saveOrderToHistory(orderId);
            Alert.alert('Order Placed!', `Your order has been placed successfully!\n\nOrder ID: ${orderId}\n\nCheck your order history in Profile.`, [
              { text: 'OK', onPress: () => {
                setCart([]);
                setShowCartModal(false);
              }}
            ]);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sports Shop</Text>
          <Text style={styles.subtitle}>{mockProducts.length} products available</Text>
        </View>
        {cart.length > 0 && (
          <TouchableOpacity style={styles.cartButton} onPress={() => setShowCartModal(true)}>
            <Text style={styles.cartIcon}>🛒</Text>
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{getTotalItems()}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={mockProducts}
        renderItem={({ item }) => (
          <View style={styles.productWrapper}>
            <ProductCard product={item} />
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(item)}
            >
              <Text style={styles.addButtonText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />

      {cart.length > 0 && (
        <TouchableOpacity style={styles.cartSummary} onPress={() => setShowCartModal(true)}>
          <View>
            <Text style={styles.cartSummaryLabel}>{getTotalItems()} items</Text>
            <Text style={styles.cartSummaryPrice}>₹{getTotalPrice()}</Text>
          </View>
          <View style={styles.viewCartButton}>
            <Text style={styles.viewCartText}>View Cart →</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Cart Modal */}
      <Modal
        visible={showCartModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCartModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Your Cart</Text>
            <TouchableOpacity onPress={() => setShowCartModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.cartItems}>
            {cart.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <View style={styles.cartItemInfo}>
                  <Text style={styles.cartItemName}>{item.name}</Text>
                  <Text style={styles.cartItemPrice}>₹{item.price}</Text>
                </View>
                <View style={styles.cartItemActions}>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Text style={styles.quantityButtonText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.quantity}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.quantityButton}
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Text style={styles.quantityButtonText}>+</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeFromCart(item.id)}
                  >
                    <Text style={styles.removeButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.modalFooter}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total ({getTotalItems()} items)</Text>
              <Text style={styles.totalPrice}>₹{getTotalPrice()}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButtonLarge} onPress={handleCheckout}>
              <Text style={styles.checkoutButtonLargeText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 4,
  },
  cartButton: {
    position: 'relative',
    padding: 8,
  },
  cartIcon: {
    fontSize: 28,
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 8,
    paddingBottom: 100,
  },
  productWrapper: {
    flex: 1,
    margin: 8,
  },
  addButton: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  cartSummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  cartSummaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  cartSummaryPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  viewCartButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewCartText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  checkoutButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
  },
  checkoutButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  // Cart Modal
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  closeButton: {
    fontSize: 28,
    color: colors.text.tertiary,
    paddingHorizontal: 8,
  },
  cartItems: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cartItemInfo: {
    marginBottom: 12,
  },
  cartItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  cartItemPrice: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  cartItemActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '600',
  },
  quantity: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginHorizontal: 16,
  },
  removeButton: {
    marginLeft: 'auto',
    padding: 8,
  },
  removeButtonText: {
    fontSize: 20,
  },
  modalFooter: {
    backgroundColor: colors.white,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  checkoutButtonLarge: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonLargeText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
