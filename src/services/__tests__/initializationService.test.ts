import { InitializationService } from '../initializationService';

// Mock the Database and SettingsRepository
jest.mock('../database');
jest.mock('../settingsRepository');

describe('InitializationService', () => {
  let initService: InitializationService;

  beforeEach(() => {
    initService = InitializationService.getInstance();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should successfully initialize the app', async () => {
      const result = await initService.initialize();

      expect(result.success).toBe(true);
      expect(result.initializationTime).toBeGreaterThan(0);
      expect(typeof result.requiresAuth).toBe('boolean');
    });

    it('should complete initialization within 3 seconds', async () => {
      const startTime = Date.now();
      const result = await initService.initialize();
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(3000);
      expect(result.initializationTime).toBeLessThan(3000);
    });

    it('should handle initialization errors gracefully', async () => {
      // Mock database initialization to fail
      const mockDatabase = require('../database');
      mockDatabase.Database.getInstance.mockReturnValue({
        initialize: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      const result = await initService.initialize();

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.requiresAuth).toBe(false); // Should default to false on error
    });
  });

  describe('isAppInitialized', () => {
    it('should return false before initialization', () => {
      expect(initService.isAppInitialized()).toBe(false);
    });

    it('should return true after successful initialization', async () => {
      await initService.initialize();
      expect(initService.isAppInitialized()).toBe(true);
    });
  });

  describe('performHealthCheck', () => {
    it('should return true when all services are healthy', async () => {
      await initService.initialize();
      const isHealthy = await initService.performHealthCheck();
      expect(isHealthy).toBe(true);
    });
  });

  describe('recoverFromError', () => {
    it('should attempt to recover from initialization errors', async () => {
      const recovered = await initService.recoverFromError();
      expect(typeof recovered).toBe('boolean');
    });
  });
});