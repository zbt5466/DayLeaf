import { useMemo } from 'react';
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../contexts';

/**
 * テーマを使用したスタイル作成のためのカスタムフック
 * StyleSheet.createを使用してパフォーマンスを最適化
 */
export const useThemeStyles = <T extends Record<string, ViewStyle | TextStyle>>(
  createStyles: (theme: ReturnType<typeof useTheme>['theme']) => T
): T => {
  const { theme } = useTheme();
  
  return useMemo(() => {
    return StyleSheet.create(createStyles(theme));
  }, [theme, createStyles]);
};

/**
 * よく使用される共通スタイルを提供するフック
 */
export const useCommonStyles = () => {
  const { theme } = useTheme();
  
  return useMemo(() => StyleSheet.create({
    // レイアウト
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    spaceBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    
    // マージン・パディング
    marginXs: { margin: theme.spacing.xs },
    marginSm: { margin: theme.spacing.sm },
    marginMd: { margin: theme.spacing.md },
    marginLg: { margin: theme.spacing.lg },
    marginXl: { margin: theme.spacing.xl },
    
    paddingXs: { padding: theme.spacing.xs },
    paddingSm: { padding: theme.spacing.sm },
    paddingMd: { padding: theme.spacing.md },
    paddingLg: { padding: theme.spacing.lg },
    paddingXl: { padding: theme.spacing.xl },
    
    // テキストスタイル
    textPrimary: {
      color: theme.colors.text,
    },
    textSecondary: {
      color: theme.colors.textSecondary,
    },
    textSuccess: {
      color: theme.colors.success,
    },
    textWarning: {
      color: theme.colors.warning,
    },
    textError: {
      color: theme.colors.error,
    },
    
    // 背景色
    backgroundPrimary: {
      backgroundColor: theme.colors.primary,
    },
    backgroundSecondary: {
      backgroundColor: theme.colors.secondary,
    },
    backgroundSurface: {
      backgroundColor: theme.colors.surface,
    },
    
    // ボーダー
    border: {
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    borderRadius: {
      borderRadius: theme.borderRadius.md,
    },
    
    // 影（elevation）
    shadow: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
  }), [theme]);
};