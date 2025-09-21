import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useAppInitialization } from '../hooks';
import { useTheme } from '../contexts';
import { PerformanceMonitor } from '../utils';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

export default function SplashScreen() {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const { isInitializing, currentStep, steps, result, error } = useAppInitialization();
  const { theme } = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [logoScale] = useState(new Animated.Value(0.8));

  useEffect(() => {
    // パフォーマンス監視開始
    const performanceMonitor = PerformanceMonitor.getInstance();
    performanceMonitor.startPhase('splash-screen-display');
    
    // ロゴアニメーション
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, logoScale]);

  // 初期化完了時の画面遷移
  useEffect(() => {
    if (!isInitializing && result) {
      const navigateToNextScreen = async () => {
        const performanceMonitor = PerformanceMonitor.getInstance();
        
        // 最低表示時間の確保（UX向上のため）
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // スプラッシュスクリーン表示時間を記録
        performanceMonitor.endPhase('splash-screen-display');
        
        if (error) {
          // エラーが発生してもメイン画面に遷移（アプリを使用可能にする）
          console.warn('Initialization error:', error);
        }

        if (result.requiresAuth) {
          navigation.replace('Auth');
        } else {
          navigation.replace('Main');
        }
      };

      navigateToNextScreen();
    }
  }, [isInitializing, result, error, navigation]);



  // テーマが利用できない場合のフォールバック
  const fallbackColors = {
    surface: '#F5F5F5',
    primary: '#4A90A4',
    text: '#333333',
    textSecondary: '#666666',
    border: '#E0E0E0',
  };

  const colors = theme?.colors || fallbackColors;

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Animated.View 
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: logoScale }],
          }
        ]}
      >
        <Text style={[styles.logo, { color: colors.primary }]}>
          📖🍃
        </Text>
        <Text style={[styles.appName, { color: colors.text }]}>
          DayLeaf
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          1日1回「しおり」を残すアプリ
        </Text>
      </Animated.View>

      <View style={styles.initializationContainer}>
        <ActivityIndicator 
          size="small" 
          color={colors.primary} 
          style={styles.loadingIndicator}
        />
        
        <Text style={[styles.currentStepText, { color: colors.textSecondary }]}>
          {steps[currentStep]?.name || '初期化中...'}
        </Text>
        
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepIndicator}>
              <View 
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: step.completed 
                      ? colors.primary 
                      : colors.border,
                  }
                ]} 
              />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logo: {
    fontSize: 48,
    marginBottom: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
  },
  initializationContainer: {
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  loadingIndicator: {
    marginBottom: 16,
  },
  currentStepText: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepIndicator: {
    marginHorizontal: 4,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});