import { Colors, Typography, Theme, Season } from '../types/theme';

// カラーパレット定義
export const lightColors: Colors = {
  // 基本色
  primary: '#4A90A4',      // メインブルー
  secondary: '#7FB069',    // アクセントグリーン
  
  // 季節色
  spring: '#FFB3BA',       // 薄ピンク
  summer: '#BAFFC9',       // 淡緑
  autumn: '#FFD93D',       // 紅葉色
  winter: '#BAE1FF',       // 淡青
  
  // システム色
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
  
  // 状態色
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};

export const darkColors: Colors = {
  // 基本色
  primary: '#6BB6C7',      // ライトブルー
  secondary: '#9FD085',    // ライトグリーン
  
  // 季節色
  spring: '#FF8A95',       // ダークピンク
  summer: '#8FE99F',       // ダークグリーン
  autumn: '#FFB347',       // ダークオレンジ
  winter: '#87CEEB',       // ダークブルー
  
  // システム色
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textSecondary: '#CCCCCC',
  border: '#333333',
  
  // 状態色
  success: '#66BB6A',
  warning: '#FFA726',
  error: '#EF5350',
};

// タイポグラフィ定義
export const typography: Typography = {
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: 'bold' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' },
};

// 共通スタイル定義
const commonTheme = {
  typography,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
  },
};

// ライトテーマ
export const lightTheme: Theme = {
  colors: lightColors,
  ...commonTheme,
};

// ダークテーマ
export const darkTheme: Theme = {
  colors: darkColors,
  ...commonTheme,
};

// 季節判定関数
export const getCurrentSeason = (): Season => {
  const month = new Date().getMonth() + 1; // 0-11 -> 1-12
  
  if (month >= 3 && month <= 5) {
    return Season.SPRING;
  } else if (month >= 6 && month <= 8) {
    return Season.SUMMER;
  } else if (month >= 9 && month <= 11) {
    return Season.AUTUMN;
  } else {
    return Season.WINTER;
  }
};

// 季節テーマ生成関数
export const createSeasonalTheme = (baseTheme: Theme, season: Season): Theme => {
  const seasonalColors = { ...baseTheme.colors };
  
  // 季節に応じて背景色を調整
  switch (season) {
    case Season.SPRING:
      seasonalColors.surface = baseTheme === lightTheme ? '#FFF5F5' : '#2A1F1F';
      break;
    case Season.SUMMER:
      seasonalColors.surface = baseTheme === lightTheme ? '#F0FFF4' : '#1F2A1F';
      break;
    case Season.AUTUMN:
      seasonalColors.surface = baseTheme === lightTheme ? '#FFFAF0' : '#2A2A1F';
      break;
    case Season.WINTER:
      seasonalColors.surface = baseTheme === lightTheme ? '#F0F8FF' : '#1F1F2A';
      break;
  }
  
  return {
    ...baseTheme,
    colors: seasonalColors,
  };
};