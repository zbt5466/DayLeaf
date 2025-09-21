import * as SQLite from 'expo-sqlite';

export class Database {
  private static instance: Database;
  private db: SQLite.SQLiteDatabase | null = null;

  private constructor() {}

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public async initialize(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('dayleaf.db');
      await this.createTables();
      await this.initializeSettings();
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw new Error('データベースの初期化に失敗しました');
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Entriesテーブル作成
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS entries (
        id TEXT PRIMARY KEY,
        date TEXT UNIQUE NOT NULL,
        photo TEXT,
        mood TEXT NOT NULL,
        weather TEXT NOT NULL,
        good_thing TEXT,
        bad_thing TEXT,
        memo TEXT NOT NULL DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Settingsテーブル作成
    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // インデックス作成
    await this.db.execAsync(`
      CREATE INDEX IF NOT EXISTS idx_entries_date ON entries(date);
    `);
  }

  private async initializeSettings(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // デフォルト設定値を挿入（存在しない場合のみ）
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
      await this.db.runAsync(
        'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
        [setting.key, setting.value]
      );
    }
  }

  public getDatabase(): SQLite.SQLiteDatabase {
    if (!this.db) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.db;
  }

  public async close(): Promise<void> {
    if (this.db) {
      await this.db.closeAsync();
      this.db = null;
    }
  }
}