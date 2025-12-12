import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from '@/navigation';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '@/services';

export default function App() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigationRef = React.useRef<any>(null);

  useEffect(() => {
    // Set navigation reference for API service
    api.setNavigationRef(navigationRef);
    
    // Check authentication on app startup
    checkAuthentication();
    
    // Listen for auth state changes
    const authListener = setInterval(async () => {
      const token = await AsyncStorage.getItem('authToken');
      const currentAuth = !!token && token !== 'test-token-dev-mode';
      if (currentAuth !== isAuthenticated && !isCheckingAuth) {
        setIsAuthenticated(currentAuth);
      }
    }, 1000);
    
    return () => clearInterval(authListener);
  }, [isAuthenticated, isCheckingAuth]);

  const checkAuthentication = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      
      if (!token || token === 'test-token-dev-mode') {
        setIsAuthenticated(false);
      } else {
        // Validate token with backend
        const isValid = await api.validateToken();
        setIsAuthenticated(isValid);
        
        if (!isValid) {
          // Invalid token - clear storage
          await AsyncStorage.multiRemove(['authToken', 'userToken', 'userEmail', 'userId']);
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer ref={navigationRef}>
        <StatusBar style="dark" />
        <RootNavigator initialRouteName={isAuthenticated ? 'MainApp' : 'LoginSignup'} />
      </NavigationContainer>
    </ThemeProvider>
  );
}
