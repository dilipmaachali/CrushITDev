import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, ScrollView } from 'react-native';
import { colors } from '@/theme';
import { PetCareCard } from '@/components';

const mockPetCare = [
  {
    id: '1',
    name: 'Paws & Grooming Studio',
    serviceType: 'grooming',
    pricing: 500,
    rating: 4.9,
    distance: '1.8 km',
    services: ['Bath & Brush', 'Nail Trim', 'Full Grooming'],
    image: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=800&h=600&fit=crop',
  },
  {
    id: '2',
    name: 'Pet Paradise Veterinary',
    serviceType: 'veterinary',
    pricing: 800,
    rating: 4.8,
    distance: '2.3 km',
    services: ['Checkup', 'Vaccination', 'Emergency Care'],
    image: 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=800&h=600&fit=crop',
  },
  {
    id: '3',
    name: 'Happy Tails Training',
    serviceType: 'training',
    pricing: 1200,
    rating: 4.7,
    distance: '3.1 km',
    services: ['Basic Training', 'Behavior Modification', 'Advanced Tricks'],
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&h=600&fit=crop',
  },
  {
    id: '4',
    name: 'Doggy Daycare Center',
    serviceType: 'daycare',
    pricing: 600,
    rating: 4.6,
    distance: '1.5 km',
    services: ['Day Boarding', 'Play Sessions', 'Socialization'],
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&h=600&fit=crop',
  },
];

export default function PetCareScreen({ navigation }: any) {
  const [selectedService, setSelectedService] = useState<any>(null);
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  const handleBookService = (service: any) => {
    setSelectedService(service);
  };

  const confirmBooking = () => {
    if (!petName || !petType || !appointmentDate || !appointmentTime) {
      Alert.alert('Missing Information', 'Please fill all fields to book the service');
      return;
    }

    Alert.alert(
      'Confirm Booking',
      `Service: ${selectedService.name}\nPet: ${petName} (${petType})\nDate: ${appointmentDate}\nTime: ${appointmentTime}\nPrice: ₹${selectedService.pricing}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            Alert.alert(
              '✅ Booking Confirmed!',
              `Your pet care appointment is booked!\n\nBooking ID: PC${Date.now().toString().slice(-6)}\n\nYou'll receive a confirmation SMS shortly.`,
              [
                { text: 'OK', onPress: () => {
                  setSelectedService(null);
                  setPetName('');
                  setPetType('');
                  setAppointmentDate('');
                  setAppointmentTime('');
                }}
              ]
            );
          }
        }
      ]
    );
  };

  if (selectedService) {
    return (
      <ScrollView style={styles.container}>
        <TouchableOpacity onPress={() => setSelectedService(null)} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back to Services</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Book {selectedService.name}</Text>
        <Text style={styles.subtitle}>{selectedService.serviceType.toUpperCase()} • ₹{selectedService.pricing}</Text>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Pet Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Pet Name *"
            placeholderTextColor={colors.text.tertiary}
            value={petName}
            onChangeText={setPetName}
          />
          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            placeholder="Pet Type (e.g., Dog, Cat) *"
            placeholderTextColor={colors.text.tertiary}
            value={petType}
            onChangeText={setPetType}
          />
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Appointment Details</Text>
          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD) *"
            placeholderTextColor={colors.text.tertiary}
            value={appointmentDate}
            onChangeText={setAppointmentDate}
          />
          <TextInput
            style={[styles.input, { marginTop: 12 }]}
            placeholder="Time (e.g., 10:00 AM) *"
            placeholderTextColor={colors.text.tertiary}
            value={appointmentTime}
            onChangeText={setAppointmentTime}
          />
        </View>

        <View style={styles.servicesSection}>
          <Text style={styles.sectionTitle}>Available Services</Text>
          {selectedService.services.map((service: string, index: number) => (
            <View key={index} style={styles.serviceItem}>
              <Text style={styles.serviceItemText}>✓ {service}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Booking Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Service:</Text>
            <Text style={styles.summaryValue}>{selectedService.name}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Pet:</Text>
            <Text style={styles.summaryValue}>{petName || 'Not entered'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Date:</Text>
            <Text style={styles.summaryValue}>{appointmentDate || 'Not selected'}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time:</Text>
            <Text style={styles.summaryValue}>{appointmentTime || 'Not selected'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalPrice}>₹{selectedService.pricing}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.bookButton} onPress={confirmBooking}>
          <Text style={styles.bookButtonText}>Confirm Booking</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pet Care Services</Text>
      <Text style={styles.subtitle}>{mockPetCare.length} services available</Text>
      <FlatList
        data={mockPetCare}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => handleBookService(item)}>
            <PetCareCard service={item} />
            <TouchableOpacity
              style={styles.bookServiceButton}
              onPress={() => handleBookService(item)}
            >
              <Text style={styles.bookServiceButtonText}>Book Now</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  bookServiceButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookServiceButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  formSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  servicesSection: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  serviceItem: {
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  serviceItemText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  summarySection: {
    backgroundColor: colors.surface,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },
  bookButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  bookButtonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
