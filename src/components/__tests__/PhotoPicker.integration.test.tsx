/**
 * Integration test for PhotoPicker component
 * Tests the complete photo selection and processing workflow
 */

import { PhotoService } from '../../services/photoService';
import { 
  processImageToSquare, 
  validateProcessingPerformance,
  calculateOptimalQuality 
} from '../../utils/imageProcessingUtils';

// Mock dependencies for integration testing
jest.mock('expo-file-system');
jest.mock('expo-image-picker');
jest.mock('expo-image-manipulator');

describe('PhotoPicker Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Photo Service Integration', () => {
    it('should initialize photos directory successfully', async () => {
      const mockFileSystem = require('expo-file-system');
      
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: false,
        isDirectory: false,
        uri: 'file://documents/photos/',
        size: 0,
        modificationTime: Date.now(),
      });
      
      mockFileSystem.makeDirectoryAsync.mockResolvedValue();

      await expect(PhotoService.initializePhotosDirectory()).resolves.not.toThrow();
    });

    it('should handle photo existence check', async () => {
      const mockFileSystem = require('expo-file-system');
      
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        uri: 'file://documents/photos/test.jpg',
        size: 1024,
        modificationTime: Date.now(),
      });

      const exists = await PhotoService.photoExists('file://documents/photos/test.jpg');
      expect(exists).toBe(true);
    });
  });

  describe('Image Processing Integration', () => {
    it('should calculate optimal quality based on image dimensions', () => {
      // Test different scenarios
      expect(calculateOptimalQuality(800, 600, 800)).toBe(0.9); // Upscale
      expect(calculateOptimalQuality(1600, 1200, 800)).toBe(0.8); // Moderate downscale
      expect(calculateOptimalQuality(3200, 2400, 800)).toBe(0.7); // Large downscale
      expect(calculateOptimalQuality(6400, 4800, 800)).toBe(0.6); // Extreme downscale
    });

    it('should validate processing performance correctly', () => {
      const excellent = validateProcessingPerformance(500);
      expect(excellent.performanceRating).toBe('excellent');
      expect(excellent.isWithinRequirement).toBe(true);

      const good = validateProcessingPerformance(2000);
      expect(good.performanceRating).toBe('good');
      expect(good.isWithinRequirement).toBe(true);

      const acceptable = validateProcessingPerformance(4000);
      expect(acceptable.performanceRating).toBe('acceptable');
      expect(acceptable.isWithinRequirement).toBe(true);

      const slow = validateProcessingPerformance(6000);
      expect(slow.performanceRating).toBe('slow');
      expect(slow.isWithinRequirement).toBe(false);
    });

    it('should process image to square format', async () => {
      const mockImageManipulator = require('expo-image-manipulator');
      
      // Mock Image.getSize
      const mockGetSize = jest.fn((uri, success) => {
        success(1000, 800); // width, height
      });
      require('react-native').Image = { getSize: mockGetSize };

      mockImageManipulator.manipulateAsync.mockResolvedValue({
        uri: 'file://processed.jpg',
        width: 800,
        height: 800,
      });

      const result = await processImageToSquare('file://test.jpg');

      expect(result.uri).toBe('file://processed.jpg');
      expect(result.finalDimensions).toEqual({ width: 800, height: 800 });
      expect(result.originalDimensions).toEqual({ width: 1000, height: 800 });
      expect(result.processingTime).toBeGreaterThan(0);
    });
  });

  describe('Performance Requirements', () => {
    it('should meet the 5-second processing requirement', async () => {
      const mockImageManipulator = require('expo-image-manipulator');
      
      // Mock fast processing
      mockImageManipulator.manipulateAsync.mockImplementation(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            uri: 'file://processed.jpg',
            width: 800,
            height: 800,
          }), 100) // 100ms processing time
        )
      );

      const mockGetSize = jest.fn((uri, success) => {
        success(2000, 1500); // Large image
      });
      require('react-native').Image = { getSize: mockGetSize };

      const startTime = Date.now();
      const result = await processImageToSquare('file://large-image.jpg');
      const totalTime = Date.now() - startTime;

      expect(totalTime).toBeLessThan(5000);
      expect(result.processingTime).toBeLessThan(5000);
    });

    it('should handle multiple concurrent operations efficiently', async () => {
      const mockFileSystem = require('expo-file-system');
      
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: true,
        uri: 'file://documents/photos/',
        size: 0,
        modificationTime: Date.now(),
      });

      const startTime = Date.now();
      
      // Simulate multiple concurrent operations
      const operations = Array.from({ length: 5 }, () => 
        PhotoService.initializePhotosDirectory()
      );
      
      await Promise.all(operations);
      
      const totalTime = Date.now() - startTime;
      
      // Multiple operations should complete quickly
      expect(totalTime).toBeLessThan(1000);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle file system errors gracefully', async () => {
      const mockFileSystem = require('expo-file-system');
      
      mockFileSystem.getInfoAsync.mockRejectedValue(new Error('Permission denied'));

      const exists = await PhotoService.photoExists('file://test.jpg');
      expect(exists).toBe(false); // Should return false on error
    });

    it('should handle image processing errors gracefully', async () => {
      const mockImageManipulator = require('expo-image-manipulator');
      
      mockImageManipulator.manipulateAsync.mockRejectedValue(new Error('Processing failed'));

      const mockGetSize = jest.fn((uri, success) => {
        success(1000, 800);
      });
      require('react-native').Image = { getSize: mockGetSize };

      await expect(processImageToSquare('file://test.jpg')).rejects.toThrow(
        '画像処理に失敗しました'
      );
    });
  });

  describe('Path Management Integration', () => {
    it('should normalize paths correctly', () => {
      expect(PhotoService.normalizePath('')).toBe('');
      expect(PhotoService.normalizePath('test.jpg')).toBe('file://documents/photos/test.jpg');
      expect(PhotoService.normalizePath('file://documents/photos/test.jpg')).toBe('file://documents/photos/test.jpg');
    });

    it('should handle cleanup operations', async () => {
      const mockFileSystem = require('expo-file-system');
      
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: true,
        uri: 'file://documents/photos/',
        size: 0,
        modificationTime: Date.now(),
      });

      mockFileSystem.readDirectoryAsync.mockResolvedValue([
        'used.jpg',
        'unused1.jpg',
        'unused2.jpg',
      ]);

      mockFileSystem.deleteAsync.mockResolvedValue();

      await PhotoService.cleanupUnusedPhotos(['file://documents/photos/used.jpg']);

      expect(mockFileSystem.deleteAsync).toHaveBeenCalledWith('file://documents/photos/unused1.jpg');
      expect(mockFileSystem.deleteAsync).toHaveBeenCalledWith('file://documents/photos/unused2.jpg');
      expect(mockFileSystem.deleteAsync).toHaveBeenCalledTimes(2);
    });
  });
});