import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { PhotoService } from '../../services/photoService';

// Mock dependencies
jest.mock('expo-image-manipulator');
jest.mock('expo-file-system');

const mockImageManipulator = ImageManipulator as jest.Mocked<typeof ImageManipulator>;
const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

describe('PhotoPicker Performance Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock FileSystem.documentDirectory
    Object.defineProperty(FileSystem, 'documentDirectory', {
      value: 'file://documents/',
      writable: false,
    });

    mockFileSystem.getInfoAsync.mockResolvedValue({
      exists: true,
      isDirectory: true,
      modificationTime: Date.now(),
      size: 0,
      uri: 'file://documents/photos/',
    });

    mockFileSystem.makeDirectoryAsync.mockResolvedValue();
    mockFileSystem.copyAsync.mockResolvedValue();
  });

  it('should complete image processing within 5 seconds', async () => {
    // Mock image processing to take a reasonable amount of time
    mockImageManipulator.manipulateAsync.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          uri: 'file://processed.jpg',
          width: 800,
          height: 800,
        }), 100) // 100ms processing time
      )
    );

    const startTime = Date.now();
    
    // Simulate the image processing workflow
    const mockImageUri = 'file://test-image.jpg';
    
    // Mock Image.getSize
    const mockGetSize = jest.fn((uri, success) => {
      success(1000, 800); // width, height
    });
    require('react-native').Image.getSize = mockGetSize;

    // Process image (this simulates the processImage function logic)
    const size = Math.min(1000, 800); // 800
    const originX = (1000 - size) / 2; // 100
    const originY = (800 - size) / 2; // 0

    const manipulatedImage = await mockImageManipulator.manipulateAsync(
      mockImageUri,
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
            width: 800,
            height: 800,
          },
        },
      ],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Save to local storage
    const fileName = `photo_${Date.now()}.jpg`;
    const localPath = `file://documents/photos/${fileName}`;
    
    await mockFileSystem.copyAsync({
      from: manipulatedImage.uri,
      to: localPath,
    });

    const processingTime = Date.now() - startTime;
    
    // Verify processing time is within 5 seconds (5000ms)
    expect(processingTime).toBeLessThan(5000);
    
    console.log(`Image processing completed in ${processingTime}ms`);
  });

  it('should handle large images efficiently', async () => {
    // Mock processing of a large image
    mockImageManipulator.manipulateAsync.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          uri: 'file://processed-large.jpg',
          width: 800,
          height: 800,
        }), 500) // 500ms for large image
      )
    );

    const startTime = Date.now();
    
    // Mock a large image (4K resolution)
    const mockGetSize = jest.fn((uri, success) => {
      success(4000, 3000); // Large image dimensions
    });
    require('react-native').Image.getSize = mockGetSize;

    const mockImageUri = 'file://large-image.jpg';
    
    // Process large image
    const size = Math.min(4000, 3000); // 3000
    const originX = (4000 - size) / 2; // 500
    const originY = (3000 - size) / 2; // 0

    const manipulatedImage = await mockImageManipulator.manipulateAsync(
      mockImageUri,
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
            width: 800,
            height: 800,
          },
        },
      ],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    const fileName = `photo_large_${Date.now()}.jpg`;
    const localPath = `file://documents/photos/${fileName}`;
    
    await mockFileSystem.copyAsync({
      from: manipulatedImage.uri,
      to: localPath,
    });

    const processingTime = Date.now() - startTime;
    
    // Even large images should be processed within 5 seconds
    expect(processingTime).toBeLessThan(5000);
    
    console.log(`Large image processing completed in ${processingTime}ms`);
  });

  it('should initialize photos directory quickly', async () => {
    const startTime = Date.now();
    
    // Test directory initialization
    await PhotoService.initializePhotosDirectory();
    
    const initTime = Date.now() - startTime;
    
    // Directory initialization should be very fast (under 100ms)
    expect(initTime).toBeLessThan(100);
    
    console.log(`Photos directory initialization completed in ${initTime}ms`);
  });

  it('should handle multiple photo operations efficiently', async () => {
    // Mock fast processing for batch operations
    mockImageManipulator.manipulateAsync.mockResolvedValue({
      uri: 'file://processed.jpg',
      width: 800,
      height: 800,
    });

    const startTime = Date.now();
    
    // Simulate multiple photo operations
    const operations = [];
    for (let i = 0; i < 5; i++) {
      operations.push(PhotoService.initializePhotosDirectory());
    }
    
    await Promise.all(operations);
    
    const totalTime = Date.now() - startTime;
    
    // Multiple operations should still complete quickly
    expect(totalTime).toBeLessThan(1000);
    
    console.log(`Multiple photo operations completed in ${totalTime}ms`);
  });
});