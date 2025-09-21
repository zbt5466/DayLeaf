export { Database } from './database';
export { EntryRepository } from './entryRepository';
export { SettingsRepository } from './settingsRepository';
export { InitializationService, type InitializationResult } from './initializationService';

// Database service singleton for easy access
import { Database } from './database';
import { EntryRepository } from './entryRepository';
import { SettingsRepository } from './settingsRepository';

export class DatabaseService {
  private static instance: DatabaseService;
  private database: Database;
  private _entryRepository: EntryRepository | null = null;
  private _settingsRepository: SettingsRepository | null = null;

  private constructor() {
    this.database = Database.getInstance();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async initialize(): Promise<void> {
    await this.database.initialize();
  }

  public get entryRepository(): EntryRepository {
    if (!this._entryRepository) {
      this._entryRepository = new EntryRepository();
    }
    return this._entryRepository;
  }

  public get settingsRepository(): SettingsRepository {
    if (!this._settingsRepository) {
      this._settingsRepository = new SettingsRepository();
    }
    return this._settingsRepository;
  }

  public async close(): Promise<void> {
    await this.database.close();
    this._entryRepository = null;
    this._settingsRepository = null;
  }
}