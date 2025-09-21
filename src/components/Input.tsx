import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../contexts';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  variant = 'outlined',
  size = 'medium',
  containerStyle,
  inputStyle,
  labelStyle,
  onFocus,
  onBlur,
  ...textInputProps
}) => {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      marginBottom: theme.spacing.sm,
    };

    return baseStyle;
  };

  const getInputContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
    };

    // サイズ設定
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = theme.spacing.sm;
        baseStyle.paddingVertical = theme.spacing.xs;
        baseStyle.minHeight = 32;
        break;
      case 'large':
        baseStyle.paddingHorizontal = theme.spacing.md;
        baseStyle.paddingVertical = theme.spacing.md;
        baseStyle.minHeight = 48;
        break;
      case 'medium':
      default:
        baseStyle.paddingHorizontal = theme.spacing.md;
        baseStyle.paddingVertical = theme.spacing.sm;
        baseStyle.minHeight = 40;
        break;
    }

    // バリアント設定
    switch (variant) {
      case 'filled':
        baseStyle.backgroundColor = theme.colors.surface;
        baseStyle.borderColor = 'transparent';
        if (isFocused) {
          baseStyle.borderColor = theme.colors.primary;
        }
        if (error) {
          baseStyle.borderColor = theme.colors.error;
        }
        break;
      case 'outlined':
      default:
        baseStyle.backgroundColor = theme.colors.background;
        baseStyle.borderColor = theme.colors.border;
        if (isFocused) {
          baseStyle.borderColor = theme.colors.primary;
          baseStyle.borderWidth = 2;
        }
        if (error) {
          baseStyle.borderColor = theme.colors.error;
          baseStyle.borderWidth = 2;
        }
        break;
    }

    return baseStyle;
  };

  const getInputStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...theme.typography.body,
      color: theme.colors.text,
      flex: 1,
    };

    // サイズに応じたフォントサイズ調整
    switch (size) {
      case 'small':
        baseStyle.fontSize = theme.typography.caption.fontSize;
        break;
      case 'large':
        baseStyle.fontSize = theme.typography.h3.fontSize;
        break;
    }

    return baseStyle;
  };

  const getLabelStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...theme.typography.caption,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.xs,
    };

    if (error) {
      baseStyle.color = theme.colors.error;
    }

    return baseStyle;
  };

  const getHelperTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      ...theme.typography.small,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    };

    if (error) {
      baseStyle.color = theme.colors.error;
    }

    return baseStyle;
  };

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {label && (
        <Text style={[getLabelStyle(), labelStyle]}>
          {label}
        </Text>
      )}
      <View style={getInputContainerStyle()}>
        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...textInputProps}
        />
      </View>
      {(error || helperText) && (
        <Text style={getHelperTextStyle()}>
          {error || helperText}
        </Text>
      )}
    </View>
  );
};