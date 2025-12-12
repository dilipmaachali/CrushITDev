import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeContextType {
  galaxyThemeEnabled: boolean;
  toggleGalaxyTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [galaxyThemeEnabled, setGalaxyThemeEnabled] = useState(false);

  // Load theme preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const value = await AsyncStorage.getItem('galaxyThemeEnabled');
      console.log('[ThemeContext] Loaded galaxy theme preference from storage:', value);
      if (value !== null) {
        setGalaxyThemeEnabled(value === 'true');
        console.log('[ThemeContext] Galaxy theme enabled:', value === 'true');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleGalaxyTheme = async () => {
    try {
      const newValue = !galaxyThemeEnabled;
      console.log('[ThemeContext] Toggling galaxy theme:', galaxyThemeEnabled, '->', newValue);
      setGalaxyThemeEnabled(newValue);
      await AsyncStorage.setItem('galaxyThemeEnabled', newValue.toString());
      console.log('[ThemeContext] Galaxy theme saved to storage:', newValue);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ galaxyThemeEnabled, toggleGalaxyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
