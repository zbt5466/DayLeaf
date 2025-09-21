import { Database } from './database';
import { Settings, SettingsUpdate, ThemeType } from '../types';
import { handleDatabaseError } from '../utils/databaseErrors';

export class SettingsRepository {
  private database: Database;

  constructor() {
    this.database = Database.getInstance();
  }

  public async get(): Promise<Settings> {
    const db = this.database.getDatabase();

    try {
      const results = await db.getAllAsync<{ key: string; value: string }>(
        'SELECT key, value FROM settings'
      );

      const settingsMap = new Map<string, string>();
      results.forEach(row => {
        settingsMap.set(row.key, row.value);
      });

      return {
        theme: (settingsMap.get('theme') as ThemeType) || ThemeType.SEASONAL,
        notificationTime: settingsMap.get('notificationTime') || '20:00',
        notificationEnabled: settingsMap.get('notificationEnabled') === 'true',
        appLockEnabled: settingsMap.get('appLockEnabled') === 'true',
        appLockType: (settingsMap.get('appLockType') as 'pin' | 'biometric') || 'pin',
        isPremium: settingsMap.get('isPremium') === 'true',
        seasonalThemeEnabled: settingsMap.get('seasonalThemeEnabled') === 'true'
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      throw new Error('設定の取得に失敗しました');
    }
  }

  public async update(updates: SettingsUpdate): Promise<Settings> {
    const db = this.database.getDatabase();

    try {
      for (const [key, value] of Object.entries(updates)) {
        if (value !== undefined && value !== null) {
          const stringValue = typeof value === 'boolean' ? value.toString() : String(value);
          await db.runAsync(
            'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
            [key, stringValue]
          );
        }
      }

      return await this.get();
    } catch (error) {
      console.error('Error updating settings:', error);
      throw new Error('設定の更新に失敗しました');
    }
  }

  public async getSetting(key: string): Promise<string | null> {
    const db = this.database.getDatabase();

    try {
      const result = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM settings WHERE key = ?',
        [key]
      );

      return result?.value || null;
    } catch (error) {
      console.error('Error getting setting:', error);
      throw new Error('設定の取得に失敗しました');
    }
  }

  public async setSetting(key: string, value: string): Promise<void> {
    const db = this.database.getDatabase();

    try {
      await db.runAsync(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, value]
      );
    } catch (error) {
      console.error('Error setting value:', error);
      throw new Error('設定の保存に失敗しました');
    }
  }

  public async reset(): Promise<void> {
    const db = this.database.getDatabase();

    try {
      await db.runAsync('DELETE FROM settings');
      
      // デフォルト設定を再挿入
      const defaultSettings = [
        { key: 'theme', value: 'seasonal' },
        { key: 'notificationTime', value: '20:00' },
        { key: 'notificationEnabled', value: 'true' },
        { key: 'appLockEnabled', value: 'false' },
        { key: 'appLockType', value: 'pin' },
        { key: 'isPremium', value: 'false' },
        { key: 'seasonalThemeEnabled', value: 'true' }
      ];

      for (const setting of defaultSettings) {
        await db.runAsync(
          'INSERT INTO settings (key, value) VALUES (?, ?)',
          [setting.key, setting.value]
        );
      }
    } catch (error) {
      console.error('Error resetting settings:', error);
      throw new Error('設定のリセットに失敗しました');
    }
  }
}