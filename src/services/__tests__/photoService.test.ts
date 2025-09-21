import * as FileSystem from 'expo-file-system';
import { PhotoService } from '../photoService';

// Mock FileSystem
jest.mock('expo-file-system');
const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

describe('PhotoService', () => {
  const mockPhotosDir = 'file://documents/photos/';
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock FileSystem.documentDirectory
    Object.defineProperty(FileSystem, 'documentDirectory', {
      value: 'file://documents/',
      writable: false,
    });
  });

  describe('initializePhotosDirectory', () => {
    it('creates photos directory if it does not exist', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: false,
        isDirectory: false,
        uri: mockPhotosDir,
      });

      mockFileSystem.makeDirectoryAsync.mockResolvedValue();

      await PhotoService.initializePhotosDirectory();

      expect(mockFileSystem.getInfoAsync).toHaveBeenCalledWith(mockPhotosDir);
      expect(mockFileSystem.makeDirectoryAsync).toHaveBeenCalledWith(
        mockPhotosDir,
        { intermediates: true }
      );
    });

    it('does not create directory if it already exists', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: true,
        uri: mockPhotosDir,
        size: 0,
        modificationTime: Date.now(),
      });

      await PhotoService.initializePhotosDirectory();

      expect(mockFileSystem.getInfoAsync).toHaveBeenCalledWith(mockPhotosDir);
      expect(mockFileSystem.makeDirectoryAsync).not.toHaveBeenCalled();
    });

    it('throws error when directory creation fails', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: false,
        isDirectory: false,
        uri: mockPhotosDir,
      });

      mockFileSystem.makeDirectoryAsync.mockRejectedValue(new Error('Permission denied'));

      await expect(PhotoService.initializePhotosDirectory()).rejects.toThrow(
        '写真ディレクトリの初期化に失敗しました'
      );
    });
  });

  describe('photoExists', () => {
    it('returns true when photo exists', async () => {
      const photoPath = 'file://documents/photos/test.jpg';
      
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        uri: photoPath,
        size: 1024,
        modificationTime: Date.now(),
      });

      const result = await PhotoService.photoExists(photoPath);

      expect(result).toBe(true);
      expect(mockFileSystem.getInfoAsync).toHaveBeenCalledWith(photoPath);
    });

    it('returns false when photo does not exist', async () => {
      const photoPath = 'file://documents/photos/nonexistent.jpg';
      
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: false,
        isDirectory: false,
        uri: photoPath,
      });

      const result = await PhotoService.photoExists(photoPath);

      expect(result).toBe(false);
    });

    it('returns false when getInfoAsync throws error', async () => {
      const photoPath = 'file://documents/photos/error.jpg';
      
      mockFileSystem.getInfoAsync.mockRejectedValue(new Error('File system error'));

      const result = await PhotoService.photoExists(photoPath);

      expect(result).toBe(false);
    });
  });

  describe('deletePhoto', () => {
    it('deletes photo when it exists', async () => {
      const photoPath = 'file://documents/photos/test.jpg';
      
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        uri: photoPath,
        size: 1024,
        modificationTime: Date.now(),
      });

      mockFileSystem.deleteAsync.mockResolvedValue();

      await PhotoService.deletePhoto(photoPath);

      expect(mockFileSystem.deleteAsync).toHaveBeenCalledWith(photoPath);
    });

    it('does not attempt to delete when photo does not exist', async () => {
      const photoPath = 'file://documents/photos/nonexistent.jpg';
      
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: false,
        isDirectory: false,
        uri: photoPath,
      });

      await PhotoService.deletePhoto(photoPath);

      expect(mockFileSystem.deleteAsync).not.toHaveBeenCalled();
    });

    it('throws error when deletion fails', async () => {
      const photoPath = 'file://documents/photos/test.jpg';
      
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        uri: photoPath,
        size: 1024,
        modificationTime: Date.now(),
      });

      mockFileSystem.deleteAsync.mockRejectedValue(new Error('Permission denied'));

      await expect(PhotoService.deletePhoto(photoPath)).rejects.toThrow(
        '写真の削除に失敗しました'
      );
    });
  });

  describe('cleanupUnusedPhotos', () => {
    it('deletes unused photos', async () => {
      const usedPhotoPaths = [
        'file://documents/photos/used1.jpg',
        'file://documents/photos/used2.jpg',
      ];

      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: true,
        uri: mockPhotosDir,
        size: 0,
        modificationTime: Date.now(),
      });

      mockFileSystem.readDirectoryAsync.mockResolvedValue([
        'used1.jpg',
        'used2.jpg',
        'unused1.jpg',
        'unused2.jpg',
      ]);

      mockFileSystem.deleteAsync.mockResolvedValue();

      await PhotoService.cleanupUnusedPhotos(usedPhotoPaths);

      expect(mockFileSystem.deleteAsync).toHaveBeenCalledWith(
        'file://documents/photos/unused1.jpg'
      );
      expect(mockFileSystem.deleteAsync).toHaveBeenCalledWith(
        'file://documents/photos/unused2.jpg'
      );
      expect(mockFileSystem.deleteAsync).toHaveBeenCalledTimes(2);
    });

    it('does not delete anything when directory does not exist', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: false,
        isDirectory: false,
        uri: mockPhotosDir,
      });

      await PhotoService.cleanupUnusedPhotos([]);

      expect(mockFileSystem.readDirectoryAsync).not.toHaveBeenCalled();
      expect(mockFileSystem.deleteAsync).not.toHaveBeenCalled();
    });
  });

  describe('getPhotosDirectorySize', () => {
    it('calculates total size of photos directory', async () => {
      mockFileSystem.getInfoAsync
        .mockResolvedValueOnce({
          exists: true,
          isDirectory: true,
          uri: mockPhotosDir,
          size: 0,
          modificationTime: Date.now(),
        })
        .mockResolvedValueOnce({
          exists: true,
          isDirectory: false,
          size: 1024 * 1024, // 1MB
          uri: 'file://documents/photos/photo1.jpg',
          modificationTime: Date.now(),
        })
        .mockResolvedValueOnce({
          exists: true,
          isDirectory: false,
          size: 2 * 1024 * 1024, // 2MB
          uri: 'file://documents/photos/photo2.jpg',
          modificationTime: Date.now(),
        });

      mockFileSystem.readDirectoryAsync.mockResolvedValue([
        'photo1.jpg',
        'photo2.jpg',
      ]);

      const size = await PhotoService.getPhotosDirectorySize();

      expect(size).toBe(3); // 3MB total
    });

    it('returns 0 when directory does not exist', async () => {
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: false,
        isDirectory: false,
        uri: mockPhotosDir,
      });

      const size = await PhotoService.getPhotosDirectorySize();

      expect(size).toBe(0);
    });
  });

  describe('normalizePath', () => {
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

  describe('getPhotoMetadata', () => {
    it('returns metadata for existing photo', async () => {
      const photoPath = 'file://documents/photos/test.jpg';
      const mockTime = Date.now();
      
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: true,
        isDirectory: false,
        size: 1024,
        uri: photoPath,
        modificationTime: mockTime,
      });

      const metadata = await PhotoService.getPhotoMetadata(photoPath);

      expect(metadata).toEqual({
        size: 1024,
        modificationTime: mockTime,
        exists: true,
      });
    });

    it('returns exists: false for non-existent photo', async () => {
      const photoPath = 'file://documents/photos/nonexistent.jpg';
      
      mockFileSystem.getInfoAsync.mockResolvedValue({
        exists: false,
        isDirectory: false,
        uri: photoPath,
      });

      const metadata = await PhotoService.getPhotoMetadata(photoPath);

      expect(metadata).toEqual({
        size: 0,
        modificationTime: 0,
        exists: false,
      });
    });

    it('returns null when getInfoAsync throws error', async () => {
      const photoPath = 'file://documents/photos/error.jpg';
      
      mockFileSystem.getInfoAsync.mockRejectedValue(new Error('File system error'));

      const metadata = await PhotoService.getPhotoMetadata(photoPath);

      expect(metadata).toBeNull();
    });
  });
});