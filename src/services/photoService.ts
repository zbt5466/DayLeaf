import * as FileSystem from 'expo-file-system';

export class PhotoService {
  private static get PHOTOS_DIR(): string {
    return `${(FileSystem as any).documentDirectory}photos/`;
  }

  /**
   * 写真ディレクトリを初期化
   */
  static async initializePhotosDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.PHOTOS_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.PHOTOS_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to initialize photos directory:', error);
      throw new Error('写真ディレクトリの初期化に失敗しました');
    }
  }

  /**
   * 写真ファイルが存在するかチェック
   */
  static async photoExists(photoPath: string): Promise<boolean> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(photoPath);
      return fileInfo.exists;
    } catch (error) {
      console.error('Error checking photo existence:', error);
      return false;
    }
  }

  /**
   * 写真ファイルを削除
   */
  static async deletePhoto(photoPath: string): Promise<void> {
    try {
      const exists = await this.photoExists(photoPath);
      if (exists) {
        await FileSystem.deleteAsync(photoPath);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw new Error('写真の削除に失敗しました');
    }
  }

  /**
   * 使用されていない写真ファイルをクリーンアップ
   */
  static async cleanupUnusedPhotos(usedPhotoPaths: string[]): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.PHOTOS_DIR);
      if (!dirInfo.exists) return;

      const files = await FileSystem.readDirectoryAsync(this.PHOTOS_DIR);
      
      for (const fileName of files) {
        const fullPath = `${this.PHOTOS_DIR}${fileName}`;
        const isUsed = usedPhotoPaths.some(usedPath => usedPath === fullPath);
        
        if (!isUsed) {
          await FileSystem.deleteAsync(fullPath);
          console.log(`Cleaned up unused photo: ${fileName}`);
        }
      }
    } catch (error) {
      console.error('Error during photo cleanup:', error);
    }
  }

  /**
   * 写真ディレクトリのサイズを取得（MB単位）
   */
  static async getPhotosDirectorySize(): Promise<number> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.PHOTOS_DIR);
      if (!dirInfo.exists) return 0;

      const files = await FileSystem.readDirectoryAsync(this.PHOTOS_DIR);
      let totalSize = 0;

      for (const fileName of files) {
        const filePath = `${this.PHOTOS_DIR}${fileName}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists && fileInfo.size) {
          totalSize += fileInfo.size;
        }
      }

      return totalSize / (1024 * 1024); // Convert to MB
    } catch (error) {
      console.error('Error calculating photos directory size:', error);
      return 0;
    }
  }

  /**
   * 写真ファイルのパスを正規化
   */
  static normalizePath(photoPath: string): string {
    if (!photoPath) return '';
    
    // 既に正しいパスの場合はそのまま返す
    if (photoPath.startsWith(this.PHOTOS_DIR)) {
      return photoPath;
    }
    
    // ファイル名のみの場合は完全パスを構築
    if (!photoPath.includes('/')) {
      return `${this.PHOTOS_DIR}${photoPath}`;
    }
    
    return photoPath;
  }

  /**
   * 写真ファイルのメタデータを取得
   */
  static async getPhotoMetadata(photoPath: string): Promise<{
    size: number;
    modificationTime: number;
    exists: boolean;
  } | null> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(photoPath);
      if (!fileInfo.exists) {
        return { size: 0, modificationTime: 0, exists: false };
      }

      return {
        size: fileInfo.size || 0,
        modificationTime: (fileInfo as any).modificationTime || 0,
        exists: true,
      };
    } catch (error) {
      console.error('Error getting photo metadata:', error);
      return null;
    }
  }
}