export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  SEASONAL = 'seasonal'
}

export interface Settings {
  theme: ThemeType;
  notificationTime: string; // HH:MM形式
  notificationEnabled: boolean;
  appLockEnabled: boolean;
  appLockType: 'pin' | 'biometric';
  isPremium: boolean;
  seasonalThemeEnabled: boolean;
}

export interface SettingsUpdate extends Partial<Settings> {}