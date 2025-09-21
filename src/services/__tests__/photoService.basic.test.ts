/**
 * PhotoService基本動作テスト
 */

import { PhotoService } from '../photoService';

// FileSystem のモック
jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://documents/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
}));

describe('PhotoService Basic Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Path normalization', () => {
    it('returns empty string for empty input', () => {
      expect(PhotoService.normalizePath('')).toBe('');
    });

    it('returns path as-is if already normalized', () => {
      const path = 'file://documents/photos/test.jpg';
      expect(PhotoService.normalizePath(path)).toBe(path);
    });

    it('constructs full path for filename only', () => {
      const filename = 'test.jpg';
      const expected = 'file://documents/photos/test.jpg';
      expect(PhotoService.normalizePath(filename)).toBe(expected);
    });

    it('returns path as-is for other path formats', () => {
      const path = 'file://other/path/test.jpg';
      expect(PhotoService.normalizePath(path)).toBe(path);
    });
  });

  describe('Directory initialization', () => {
    it('should work with photo paths correctly', () => {
      // normalizePath で間接的にPHOTOS_DIRの動作をテスト
      const normalized = PhotoService.normalizePath('test.jpg');
      expect(normalized).toContain('photos/test.jpg');
      expect(normalized).toContain('file://documents/photos/test.jpg');
    });
  });
});