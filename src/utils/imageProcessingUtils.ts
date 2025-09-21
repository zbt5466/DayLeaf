import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';

export interface ImageProcessingResult {
  uri: string;
  processingTime: number;
  originalDimensions: { width: number; height: number };
  finalDimensions: { width: number; height: number };
}

export interface ImageProcessingOptions {
  targetSize?: number;
  quality?: number;
  format?: ImageManipulator.SaveFormat;
}

/**
 * 画像を正方形にトリミングし、指定サイズにリサイズする
 */
export const processImageToSquare = async (
  imageUri: string,
  options: ImageProcessingOptions = {}
): Promise<ImageProcessingResult> => {
  const startTime = Date.now();
  
  const {
    targetSize = 800,
    quality = 0.8,
    format = ImageManipulator.SaveFormat.JPEG,
  } = options;

  try {
    // 元画像のサイズを取得
    const originalDimensions = await getImageDimensions(imageUri);
    const { width, height } = originalDimensions;

    // 正方形トリミングの計算
    const size = Math.min(width, height);
    const originX = (width - size) / 2;
    const originY = (height - size) / 2;

    // 画像処理を実行
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [
        {
          crop: {
            originX,
            originY,
            width: size,
            height: size,
          },
        },
        {
          resize: {
            width: targetSize,
            height: targetSize,
          },
        },
      ],
      {
        compress: quality,
        format,
      }
    );

    const processingTime = Date.now() - startTime;

    return {
      uri: manipulatedImage.uri,
      processingTime,
      originalDimensions,
      finalDimensions: { width: targetSize, height: targetSize },
    };
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Image processing failed:', error);
    throw new Error(`画像処理に失敗しました (処理時間: ${processingTime}ms)`);
  }
};

/**
 * 画像の寸法を取得する
 */
export const getImageDimensions = (imageUri: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    Image.getSize(
      imageUri,
      (width, height) => resolve({ width, height }),
      (error) => reject(error)
    );
  });
};

/**
 * 画像処理のパフォーマンスを検証する
 */
export const validateProcessingPerformance = (
  processingTime: number,
  maxAllowedTime: number = 5000
): {
  isWithinRequirement: boolean;
  performanceRating: 'excellent' | 'good' | 'acceptable' | 'slow';
  message: string;
} => {
  const isWithinRequirement = processingTime <= maxAllowedTime;
  
  let performanceRating: 'excellent' | 'good' | 'acceptable' | 'slow';
  let message: string;

  if (processingTime <= 1000) {
    performanceRating = 'excellent';
    message = `優秀: ${processingTime}ms で処理完了`;
  } else if (processingTime <= 2500) {
    performanceRating = 'good';
    message = `良好: ${processingTime}ms で処理完了`;
  } else if (processingTime <= 5000) {
    performanceRating = 'acceptable';
    message = `許容範囲: ${processingTime}ms で処理完了`;
  } else {
    performanceRating = 'slow';
    message = `要改善: ${processingTime}ms で処理完了（5秒を超過）`;
  }

  return {
    isWithinRequirement,
    performanceRating,
    message,
  };
};

/**
 * 画像ファイルサイズを推定する（KB単位）
 */
export const estimateImageFileSize = (
  width: number,
  height: number,
  quality: number = 0.8,
  format: ImageManipulator.SaveFormat = ImageManipulator.SaveFormat.JPEG
): number => {
  const pixels = width * height;
  
  if (format === ImageManipulator.SaveFormat.PNG) {
    // PNG: 4 bytes per pixel (RGBA)
    return (pixels * 4) / 1024;
  } else {
    // JPEG: 圧縮率を考慮した推定
    const baseSize = (pixels * 3) / 1024; // 3 bytes per pixel (RGB)
    const compressionFactor = 1 - quality + 0.1; // 圧縮による削減
    return baseSize * compressionFactor;
  }
};

/**
 * 最適な画像品質を計算する
 */
export const calculateOptimalQuality = (
  originalWidth: number,
  originalHeight: number,
  targetSize: number = 800
): number => {
  const originalPixels = originalWidth * originalHeight;
  const targetPixels = targetSize * targetSize;
  
  // 元画像が大きいほど品質を下げて処理時間を短縮
  const sizeRatio = targetPixels / originalPixels;
  
  if (sizeRatio >= 1) {
    // アップスケールの場合は高品質を維持
    return 0.9;
  } else if (sizeRatio >= 0.5) {
    // 適度なダウンスケール
    return 0.8;
  } else if (sizeRatio >= 0.25) {
    // 大幅なダウンスケール
    return 0.7;
  } else {
    // 極端なダウンスケール
    return 0.6;
  }
};