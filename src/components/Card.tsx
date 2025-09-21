import React, { ReactNode } from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../contexts';

export interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'default',
  padding = 'medium',
}) => {
  const { theme } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      backgroundColor: theme.colors.surface,
    };

    // パディング設定
    switch (padding) {
      case 'none':
        // パディングなし
        break;
      case 'small':
        baseStyle.padding = theme.spacing.sm;
        break;
      case 'large':
        baseStyle.padding = theme.spacing.lg;
        break;
      case 'medium':
      default:
        baseStyle.padding = theme.spacing.md;
        break;
    }

    // バリアント設定
    switch (variant) {
      case 'elevated':
        // React Nativeでは影の実装がプラットフォーム依存
        baseStyle.shadowColor = '#000';
        baseStyle.shadowOffset = {
          width: 0,
          height: 2,
        };
        baseStyle.shadowOpacity = 0.1;
        baseStyle.shadowRadius = 4;
        baseStyle.elevation = 3; // Android用
        break;
      case 'outlined':
        baseStyle.borderWidth = 1;
        baseStyle.borderColor = theme.colors.border;
        baseStyle.backgroundColor = theme.colors.background;
        break;
      case 'default':
      default:
        // デフォルトスタイル
        break;
    }

    return baseStyle;
  };

  const cardStyle = getCardStyle();

  if (onPress) {
    return (
      <TouchableOpacity
        style={[cardStyle, style]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[cardStyle, style]}>
      {children}
    </View>
  );
};