import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme, Season, ThemeType } from '../types';
import { 
  lightTheme, 
  darkTheme, 
  getCurrentSeason, 
  createSeasonalTheme 
} from '../utils/themeUtils';
import { SettingsRepository } from '../services';

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  currentSeason: Season;
  setThemeType: (themeType: ThemeType) => void;
  isSeasonalThemeEnabled: boolean;
  setSeasonalThemeEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeType, setThemeTypeState] = useState<ThemeType>(ThemeType.LIGHT);
  const [isSeasonalThemeEnabled, setSeasonalThemeEnabledState] = useState<boolean>(false);
  const [currentSeason, setCurrentSeason] = useState<Season>(getCurrentSeason());

  // 設定の初期化
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const settingsRepo = new SettingsRepository();
        const settings = await settingsRepo.get();
        setThemeTypeState(settings.theme);
        setSeasonalThemeEnabledState(settings.seasonalThemeEnabled);
      } catch (error) {
        console.error('Failed to load theme settings:', error);
        // デフォルト値を使用
      }
    };

    initializeTheme();
  }, []);

  // 季節の自動更新（1日1回チェック）
  useEffect(() => {
    const checkSeason = () => {
      const newSeason = getCurrentSeason();
      if (newSeason !== currentSeason) {
        setCurrentSeason(newSeason);
      }
    };

    // 初回チェック
    checkSeason();

    // 1時間ごとにチェック（日付変更を検出するため）
    const interval = setInterval(checkSeason, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [currentSeason]);

  // テーマタイプ変更時の設定保存
  const setThemeType = async (newThemeType: ThemeType) => {
    try {
      const settingsRepo = new SettingsRepository();
      await settingsRepo.update({ theme: newThemeType });
      setThemeTypeState(newThemeType);
    } catch (error) {
      console.error('Failed to save theme setting:', error);
      // エラーが発生してもUIは更新する
      setThemeTypeState(newThemeType);
    }
  };

  // 季節テーマ有効/無効切り替え
  const setSeasonalThemeEnabled = async (enabled: boolean) => {
    try {
      const settingsRepo = new SettingsRepository();
      await settingsRepo.update({ seasonalThemeEnabled: enabled });
      setSeasonalThemeEnabledState(enabled);
    } catch (error) {
      console.error('Failed to save seasonal theme setting:', error);
      // エラーが発生してもUIは更新する
      setSeasonalThemeEnabledState(enabled);
    }
  };

  // 現在のテーマを計算
  const getCurrentTheme = (): Theme => {
    let baseTheme: Theme;

    // ベーステーマの決定
    switch (themeType) {
      case ThemeType.DARK:
        baseTheme = darkTheme;
        break;
      case ThemeType.SEASONAL:
      case ThemeType.LIGHT:
      default:
        baseTheme = lightTheme;
        break;
    }

    // 季節テーマが有効な場合は季節に応じて調整
    if (themeType === ThemeType.SEASONAL || isSeasonalThemeEnabled) {
      return createSeasonalTheme(baseTheme, currentSeason);
    }

    return baseTheme;
  };

  const theme = getCurrentTheme();

  const contextValue: ThemeContextType = {
    theme,
    themeType,
    currentSeason,
    setThemeType,
    isSeasonalThemeEnabled,
    setSeasonalThemeEnabled,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// カスタムフック
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};