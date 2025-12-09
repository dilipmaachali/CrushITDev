import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: Animated.Value;
  duration: number;
}

export const GalaxyBackground: React.FC = () => {
  const starsRef = useRef<Star[]>([]);
  
  // Generate random stars
  useEffect(() => {
    const stars: Star[] = [];
    const starCount = 50; // Subtle, not too many
    
    for (let i = 0; i < starCount; i++) {
      const star: Star = {
        id: i,
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 0.5, // 0.5-2.5px
        opacity: new Animated.Value(Math.random()),
        duration: Math.random() * 3000 + 2000, // 2-5 seconds
      };
      stars.push(star);
    }
    
    starsRef.current = stars;
    
    // Animate stars twinkling
    stars.forEach((star) => {
      const twinkle = () => {
        Animated.sequence([
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.3 + 0.1, // 0.1-0.4
            duration: star.duration,
            useNativeDriver: true,
          }),
          Animated.timing(star.opacity, {
            toValue: Math.random() * 0.3 + 0.1,
            duration: star.duration,
            useNativeDriver: true,
          }),
        ]).start(() => twinkle());
      };
      twinkle();
    });
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {/* Deep space gradient background */}
      <LinearGradient
        colors={[
          'rgba(10, 10, 30, 0.4)',    // Very dark blue (subtle)
          'rgba(20, 5, 40, 0.3)',      // Dark purple
          'rgba(5, 5, 25, 0.35)',      // Deep navy
          'rgba(15, 10, 35, 0.3)',     // Dark violet
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Blur effect for dreamy look */}
      <BlurView intensity={10} style={StyleSheet.absoluteFill} tint="dark" />
      
      {/* Nebula-like color patches (very subtle) */}
      <View style={styles.nebulaContainer}>
        <View style={[styles.nebula, styles.nebula1]} />
        <View style={[styles.nebula, styles.nebula2]} />
        <View style={[styles.nebula, styles.nebula3]} />
      </View>
      
      {/* Twinkling stars */}
      <View style={StyleSheet.absoluteFill}>
        {starsRef.current.map((star) => (
          <Animated.View
            key={star.id}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                width: star.size,
                height: star.size,
                opacity: star.opacity,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  nebulaContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  nebula: {
    position: 'absolute',
    borderRadius: 1000,
    opacity: 0.08, // Very subtle
  },
  nebula1: {
    width: 300,
    height: 300,
    backgroundColor: '#6366f1', // Indigo
    top: '10%',
    right: '20%',
    transform: [{ scale: 1.5 }],
  },
  nebula2: {
    width: 250,
    height: 250,
    backgroundColor: '#8b5cf6', // Purple
    bottom: '15%',
    left: '10%',
    transform: [{ scale: 1.3 }],
  },
  nebula3: {
    width: 200,
    height: 200,
    backgroundColor: '#ec4899', // Pink
    top: '50%',
    left: '50%',
    transform: [{ translateX: -100 }, { translateY: -100 }],
  },
  star: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 100,
  },
});
