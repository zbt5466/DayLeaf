/**
 * Image Processing Utilities テスト
 */

import {
  validateProcessingPerformance,
  calculateOptimalQuality,
  estimateImageFileSize,
} from '../imageProcessingUtils';

// Expo modules のモック
jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  },
}));

// React Native のモック
jest.mock('react-native', () => ({
  Image: {
    getSize: jest.fn(),
  },
}));

describe('Image Processing Utils Tests', () => {
  describe('validateProcessingPerformance', () => {
    it('returns excellent for fast processing', () => {
      const result = validateProcessingPerformance(500);
      expect(result.performanceRating).toBe('excellent');
      expect(result.isWithinRequirement).toBe(true);
      expect(result.message).toContain('優秀');
    });

    it('returns good for moderate processing', () => {
      const result = validateProcessingPerformance(2000);
      expect(result.performanceRating).toBe('good');
      expect(result.isWithinRequirement).toBe(true);
      expect(result.message).toContain('良好');
    });

    it('returns acceptable for slower processing', () => {
      const result = validateProcessingPerformance(4000);
      expect(result.performanceRating).toBe('acceptable');
      expect(result.isWithinRequirement).toBe(true);
      expect(result.message).toContain('許容範囲');
    });

    it('returns slow for processing over 5 seconds', () => {
      const result = validateProcessingPerformance(6000);
      expect(result.performanceRating).toBe('slow');
      expect(result.isWithinRequirement).toBe(false);
      expect(result.message).toContain('要改善');
    });
  });

  describe('calculateOptimalQuality', () => {
    it('returns high quality for upscaling', () => {
      const quality = calculateOptimalQuality(800, 600, 800);
      expect(quality).toBe(0.9);
    });

    it('returns good quality for moderate downscaling', () => {
      const quality = calculateOptimalQuality(1600, 1200, 800);
      expect(quality).toBe(0.7);
    });

    it('returns lower quality for large downscaling', () => {
      const quality = calculateOptimalQuality(3200, 2400, 800);
      expect(quality).toBe(0.6);
    });

    it('returns lowest quality for extreme downscaling', () => {
      const quality = calculateOptimalQuality(6400, 4800, 800);
      expect(quality).toBe(0.6);
    });
  });

  describe('estimateImageFileSize', () => {
    it('estimates PNG file size correctly', () => {
      const size = estimateImageFileSize(800, 600, 0.8, 'png' as any);
      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe('number');
    });

    it('estimates JPEG file size correctly', () => {
      const size = estimateImageFileSize(800, 600, 0.8, 'jpeg' as any);
      expect(size).toBeGreaterThan(0);
      expect(typeof size).toBe('number');
    });

    it('returns larger size for larger images', () => {
      const smallSize = estimateImageFileSize(400, 300, 0.8);
      const largeSize = estimateImageFileSize(1600, 1200, 0.8);
      expect(largeSize).toBeGreaterThan(smallSize);
    });
  });
});