import { Database } from './database';
import { SettingsRepository } from './settingsRepository';
import { PerformanceMonitor, measureAsync } from '../utils/performanceUtils';

export interface InitializationResult {
  success: boolean;
  error?: string;
  requiresAuth: boolean;
  initializationTime: number;
}

export class InitializationService {
  private static instance: InitializationService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): InitializationService {
    if (!InitializationService.instance) {
      InitializationService.instance = new InitializationService();
    }
    return InitializationService.instance;
  }

  public async initialize(): Promise<InitializationResult> {
    const performanceMonitor = PerformanceMonitor.getInstance();
    performanceMonitor.startPhase('app-startup');
    
    try {
      // データベース初期化
      const { result: dbResult } = await measureAsync(
        () => this.initializeDatabase(),
        'Database initialization'
      );
      
      // 設定の読み込みと検証
      const { result: settings } = await measureAsync(
        () => this.loadSettings(),
        'Settings loading'
      );
      
      // 初期化完了
      this.isInitialized = true;
      
      const initializationTime = performanceMonitor.endPhase('app-startup');
      
      // パフォーマンス要件チェック（3秒以内）
      if (!performanceMonitor.isStartupTimeWithinRequirement()) {
        console.warn(`Initialization took ${initializationTime}ms (exceeds 3000ms requirement)`);
      }
      
      // パフォーマンスレポートをログ出力
      performanceMonitor.logPerformanceReport();
      
      return {
        success: true,
        requiresAuth: settings.appLockEnabled,
        initializationTime,
      };
      
    } catch (error) {
      const initializationTime = performanceMonitor.endPhase('app-startup');
      console.error('Initialization failed:', error);
      
      performanceMonitor.logPerformanceReport();
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown initialization error',
        requiresAuth: false, // エラー時は認証をスキップ
        initializationTime,
      };
    }
  }

  private async initializeDatabase(): Promise<void> {
    try {
      const database = Database.getInstance();
      await database.initialize();
    } catch (error) {
      console.error('Database initialization failed:', error);
      throw new Error('データベースの初期化に失敗しました');
    }
  }

  private async loadSettings(): Promise<{ appLockEnabled: boolean }> {
    try {
      const settingsRepo = new SettingsRepository();
      const settings = await settingsRepo.get();
      
      // 設定の妥当性チェック
      this.validateSettings(settings);
      
      return {
        appLockEnabled: settings.appLockEnabled,
      };
    } catch (error) {
      console.error('Settings loading failed:', error);
      
      // 設定読み込みに失敗した場合はデフォルト値を使用
      return {
        appLockEnabled: false,
      };
    }
  }

  private validateSettings(settings: any): void {
    // 必要な設定項目の存在チェック
    const requiredSettings = [
      'theme',
      'notificationTime',
      'notificationEnabled',
      'appLockEnabled',
      'appLockType',
      'isPremium',
      'seasonalThemeEnabled'
    ];

    for (const setting of requiredSettings) {
      if (settings[setting] === undefined || settings[setting] === null) {
        console.warn(`Missing setting: ${setting}`);
      }
    }
  }

  public isAppInitialized(): boolean {
    return this.isInitialized;
  }

  public async performHealthCheck(): Promise<boolean> {
    try {
      // データベース接続チェック
      const database = Database.getInstance();
      const db = database.getDatabase();
      await db.getFirstAsync('SELECT 1');
      
      // 設定読み込みチェック
      const settingsRepo = new SettingsRepository();
      await settingsRepo.get();
      
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  public async recoverFromError(): Promise<boolean> {
    try {
      console.log('Attempting to recover from initialization error...');
      
      // データベース再初期化を試行
      const database = Database.getInstance();
      await database.close();
      await database.initialize();
      
      // 設定の再読み込み
      const settingsRepo = new SettingsRepository();
      await settingsRepo.get();
      
      this.isInitialized = true;
      console.log('Recovery successful');
      return true;
      
    } catch (error) {
      console.error('Recovery failed:', error);
      return false;
    }
  }
}