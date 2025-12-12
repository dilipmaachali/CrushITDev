import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, AccessibilityInfo, Image } from 'react-native';
import { colors } from '@/theme';
import { getArenaImage } from '@/utils/imageUtils';

interface ArenaCardProps {
  arena: {
    id: string;
    name: string;
    type: string;
    pricing: number;
    rating: number;
    distance: string;
    reviews?: number;
    amenities?: string[];
    image?: string;
    images?: string[];
  };
  onPress?: () => void;
}

export default function ArenaCard({ arena, onPress }: ArenaCardProps) {
  // Determine rating color based on score (like Zomato)
  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return colors.ratingExcellent;
    if (rating >= 3.5) return colors.ratingGood;
    if (rating >= 2.5) return colors.ratingAverage;
    return colors.ratingPoor;
  };

  // Format arena type to display name
  const formatType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  // Get arena image
  const arenaImageUri = arena.images?.[0] || arena.image || getArenaImage(arena.type);

  // Accessibility label for screen readers
  const accessibilityLabel = `${arena.name}, ${formatType(arena.type)}, ₹${arena.pricing} per hour, Rating: ${arena.rating} stars from ${arena.reviews || 0} reviews, ${arena.distance} away`;

  const handlePress = () => {
    console.log('[ArenaCard] Card pressed:', arena.name);
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityHint="Double tap to view arena details"
    >
      {/* Image Section */}
      <View style={styles.imageContainer}>
        <Image
          source={
            typeof arenaImageUri === 'string' && arenaImageUri.startsWith('/')
              ? { uri: arenaImageUri }
              : arenaImageUri
          }
          style={styles.image}
          resizeMode="cover"
        />
        
        {/* Rating Badge - Zomato Style */}
        <View 
          style={[styles.ratingBadge, { backgroundColor: getRatingColor(arena.rating) }]}
          accessible={true}
          accessibilityLabel={`Rating ${arena.rating} out of 5`}
        >
          <Text style={styles.ratingText}>{arena.rating}</Text>
          <Text style={styles.ratingSubtext}>★</Text>
        </View>

        {/* Tag/Type Badge */}
        <View style={styles.typeBadge}>
          <Text style={styles.typeText} numberOfLines={1}>
            {formatType(arena.type)}
          </Text>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Arena Name and Review Count */}
        <View style={styles.header}>
          <Text 
            style={styles.name} 
            numberOfLines={2}
            accessibilityRole="header"
          >
            {arena.name}
          </Text>
          <Text 
            style={styles.reviewCount}
            accessible={true}
            accessibilityLabel={`${arena.reviews || 0} reviews`}
          >
            ({arena.reviews || 0})
          </Text>
        </View>

        {/* Amenities - horizontal scroll indicator */}
        {arena.amenities && arena.amenities.length > 0 && (
          <View style={styles.amenitiesContainer}>
            <Text style={styles.amenityTag}>{arena.amenities[0]}</Text>
            {arena.amenities.length > 1 && (
              <Text style={styles.amenityTag}>+{arena.amenities.length - 1}</Text>
            )}
          </View>
        )}

        {/* Footer: Price, Distance, CTA */}
        <View style={styles.footer}>
          <View style={styles.priceDistance}>
            <Text 
              style={styles.pricing}
              accessible={true}
              accessibilityLabel={`₹${arena.pricing} per hour`}
            >
              ₹{arena.pricing}
            </Text>
            <Text style={styles.pricingLabel}>per hour</Text>
            
            <Text style={styles.separator}>•</Text>
            
            <Text 
              style={styles.distance}
              accessible={true}
              accessibilityLabel={`${arena.distance} away`}
            >
              {arena.distance}
            </Text>
          </View>
          
          <View style={styles.ctaButton}>
            <Text style={styles.ctaText} accessible={false}>→</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.divider,
    // Accessible shadow
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  imageContainer: {
    position: 'relative',
    backgroundColor: colors.surface,
    height: 160,
    width: '100%',
  },

  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
  },

  placeholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.surface,
  },

  // Zomato-style rating badge
  ratingBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text.inverse,
  },

  ratingSubtext: {
    fontSize: 12,
    color: colors.text.inverse,
  },

  // Type badge
  typeBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    maxWidth: 120,
  },

  typeText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
  },

  // Content
  content: {
    padding: 12,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },

  name: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    lineHeight: 20,
  },

  reviewCount: {
    fontSize: 12,
    color: colors.text.secondary,
    marginLeft: 8,
  },

  // Amenities
  amenitiesContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },

  amenityTag: {
    fontSize: 11,
    color: colors.text.secondary,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    fontWeight: '500',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },

  priceDistance: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  pricing: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },

  pricingLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    marginLeft: 4,
  },

  separator: {
    color: colors.border,
    marginHorizontal: 8,
    fontSize: 10,
  },

  distance: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },

  ctaButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },

  ctaText: {
    fontSize: 16,
    color: colors.text.inverse,
    fontWeight: 'bold',
  },
});
