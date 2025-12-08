import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import RootNavigator from '@/navigation';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <RootNavigator />
    </NavigationContainer>
  );
}
