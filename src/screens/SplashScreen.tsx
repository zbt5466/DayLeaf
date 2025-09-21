import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();

  useEffect(() => {
    // Initialize app (database, settings, etc.)
    const initializeApp = async () => {
      try {
        // TODO: Initialize database
        // TODO: Load settings
        // TODO: Check if app lock is enabled
        
        // Simulate initialization time (max 3 seconds as per requirements)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Navigate to main app
        navigation.replace('Main');
      } catch (error) {
        console.error('App initialization failed:', error);
        // Still navigate to main app even if initialization fails
        navigation.replace('Main');
      }
    };

    initializeApp();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🍃 DayLeaf</Text>
      <Text style={styles.subtitle}>1日1回「しおり」を残すアプリ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A90A4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
});