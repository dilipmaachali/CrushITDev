import { useState, useEffect } from 'react';
import { AccessibilityInfo, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AccessibilitySettings {
  isScreenReaderEnabled: boolean;
  isBoldTextEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  textScale: number;
  highContrastMode: boolean;
}

const STORAGE_KEY = '@accessibility_settings';

export const useAccessibility = () => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    isScreenReaderEnabled: false,
    isBoldTextEnabled: false,
    isReduceMotionEnabled: false,
    isReduceTransparencyEnabled: false,
    textScale: 1.0,
    highContrastMode: false,
  });

  useEffect(() => {
    loadAccessibilitySettings();
    
    // Listen for screen reader changes
    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (isEnabled: boolean) => {
        setSettings(prev => ({ ...prev, isScreenReaderEnabled: isEnabled }));
      }
    );

    // Listen for reduce motion changes
    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (isEnabled: boolean) => {
        setSettings(prev => ({ ...prev, isReduceMotionEnabled: isEnabled }));
      }
    );

    // Listen for bold text changes (iOS only)
    if (Platform.OS === 'ios') {
      const boldTextSubscription = AccessibilityInfo.addEventListener(
        'boldTextChanged',
        (isEnabled: boolean) => {
          setSettings(prev => ({ ...prev, isBoldTextEnabled: isEnabled }));
        }
      );

      return () => {
        screenReaderSubscription.remove();
        reduceMotionSubscription.remove();
        boldTextSubscription.remove();
      };
    }

    return () => {
      screenReaderSubscription.remove();
      reduceMotionSubscription.remove();
    };
  }, []);

  const loadAccessibilitySettings = async () => {
    try {
      // Load system settings
      const isScreenReaderEnabled = await AccessibilityInfo.isScreenReaderEnabled();
      const isBoldTextEnabled = Platform.OS === 'ios' 
        ? await AccessibilityInfo.isBoldTextEnabled() 
        : false;
      const isReduceMotionEnabled = await AccessibilityInfo.isReduceMotionEnabled();
      const isReduceTransparencyEnabled = Platform.OS === 'ios'
        ? await AccessibilityInfo.isReduceTransparencyEnabled()
        : false;

      // Load user preferences from AsyncStorage
      const storedSettings = await AsyncStorage.getItem(STORAGE_KEY);
      const userPrefs = storedSettings ? JSON.parse(storedSettings) : {};

      setSettings({
        isScreenReaderEnabled,
        isBoldTextEnabled,
        isReduceMotionEnabled,
        isReduceTransparencyEnabled,
        textScale: userPrefs.textScale || 1.0,
        highContrastMode: userPrefs.highContrastMode || false,
      });
    } catch (error) {
      console.error('Error loading accessibility settings:', error);
    }
  };

  const updateTextScale = async (scale: number) => {
    try {
      const newSettings = { ...settings, textScale: scale };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        textScale: scale,
        highContrastMode: settings.highContrastMode,
      }));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating text scale:', error);
    }
  };

  const toggleHighContrast = async () => {
    try {
      const newValue = !settings.highContrastMode;
      const newSettings = { ...settings, highContrastMode: newValue };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        textScale: settings.textScale,
        highContrastMode: newValue,
      }));
      setSettings(newSettings);
    } catch (error) {
      console.error('Error toggling high contrast:', error);
    }
  };

  const getAnimationDuration = (baseDuration: number): number => {
    // Return 0 if reduce motion is enabled
    return settings.isReduceMotionEnabled ? 0 : baseDuration;
  };

  const getFontWeight = (baseFontWeight: string | number): string => {
    // Increase font weight for bold text or high contrast
    if (settings.isBoldTextEnabled || settings.highContrastMode) {
      const baseWeight = typeof baseFontWeight === 'string' 
        ? parseInt(baseFontWeight) || 400 
        : baseFontWeight;
      return String(Math.min(baseWeight + 100, 900));
    }
    return String(baseFontWeight);
  };

  const getScaledSize = (baseSize: number): number => {
    return baseSize * settings.textScale;
  };

  const getBorderWidth = (baseBorderWidth: number): number => {
    return settings.highContrastMode ? baseBorderWidth * 2 : baseBorderWidth;
  };

  return {
    settings,
    updateTextScale,
    toggleHighContrast,
    getAnimationDuration,
    getFontWeight,
    getScaledSize,
    getBorderWidth,
  };
};
