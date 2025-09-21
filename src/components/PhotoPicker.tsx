import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { useTheme } from '../contexts/ThemeContext';
import { 
  processImageToSquare, 
  validateProcessingPerformance,
  calculateOptimalQuality 
} from '../utils/imageProcessingUtils';

interface PhotoPickerProps {
  onPhotoSelected: (photoPath: string) => void;
  currentPhoto?: string;
  disabled?: boolean;
}

export const PhotoPicker: React.FC<PhotoPickerProps> = ({
  onPhotoSelected,
  currentPhoto,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [isProcessing, setIsProcessing] = useState(false);

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        '権限が必要です',
        '写真を使用するには、カメラとフォトライブラリへのアクセス権限が必要です。設定から権限を有効にしてください。',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const processImage = async (imageUri: string): Promise<string> => {
    try {
      // 最適な品質を計算
      const { width, height } = await new Promise<{ width: number; height: number }>((resolve, reject) => {
        Image.getSize(
          imageUri,
          (width, height) => resolve({ width, height }),
          (error) => reject(error)
        );
      });

      const optimalQuality = calculateOptimalQuality(width, height);

      // 画像を正方形にトリミング・リサイズ
      const result = await processImageToSquare(imageUri, {
        targetSize: 800,
        quality: optimalQuality,
      });

      // パフォーマンス検証
      const performanceResult = validateProcessingPerformance(result.processingTime);
      console.log(performanceResult.message);

      if (!performanceResult.isWithinRequirement) {
        console.warn('Image processing exceeded 5-second requirement');
      }

      // ローカルディレクトリに保存
      const fileName = `photo_${Date.now()}.jpg`;
      const localPath = `${(FileSystem as any).documentDirectory}photos/${fileName}`;
      
      // photos ディレクトリを作成（存在しない場合）
      const photosDir = `${(FileSystem as any).documentDirectory}photos/`;
      const dirInfo = await FileSystem.getInfoAsync(photosDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(photosDir, { intermediates: true });
      }

      // 画像をローカルに保存
      await FileSystem.copyAsync({
        from: result.uri,
        to: localPath,
      });

      return localPath;
    } catch (error) {
      console.error('Image processing error:', error);
      throw new Error('画像の処理に失敗しました');
    }
  };

  const showImagePickerOptions = () => {
    Alert.alert(
      '写真を選択',
      '写真の取得方法を選択してください',
      [
        {
          text: 'カメラで撮影',
          onPress: () => pickImage('camera'),
        },
        {
          text: 'ギャラリーから選択',
          onPress: () => pickImage('gallery'),
        },
        {
          text: 'キャンセル',
          style: 'cancel',
        },
      ]
    );
  };

  const pickImage = async (source: 'camera' | 'gallery') => {
    if (disabled || isProcessing) return;

    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    setIsProcessing(true);

    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // 自前でトリミングするため無効
        quality: 1,
      };

      let result: ImagePicker.ImagePickerResult;

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets[0]) {
        const processedImagePath = await processImage(result.assets[0].uri);
        onPhotoSelected(processedImagePath);
      }
    } catch (error) {
      console.error('Photo picker error:', error);
      Alert.alert(
        'エラー',
        '写真の選択に失敗しました。もう一度お試しください。',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const removePhoto = () => {
    Alert.alert(
      '写真を削除',
      '選択した写真を削除しますか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => onPhotoSelected(''),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.photoContainer,
          { borderColor: colors.border },
          disabled && styles.disabled,
        ]}
        onPress={currentPhoto ? removePhoto : showImagePickerOptions}
        disabled={disabled || isProcessing}
      >
        {isProcessing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
              処理中...
            </Text>
          </View>
        ) : currentPhoto ? (
          <Image 
            source={{ uri: currentPhoto }} 
            style={styles.photo}
            testID="photo-image"
          />
        ) : (
          <View style={styles.placeholder}>
            <Text style={[styles.placeholderText, { color: colors.textSecondary }]}>
              📷
            </Text>
            <Text style={[styles.placeholderSubText, { color: colors.textSecondary }]}>
              写真を追加
            </Text>
          </View>
        )}
      </TouchableOpacity>
      
      {currentPhoto && !isProcessing && (
        <TouchableOpacity
          style={[styles.changeButton, { backgroundColor: colors.primary }]}
          onPress={showImagePickerOptions}
          disabled={disabled}
        >
          <Text style={styles.changeButtonText}>写真を変更</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  photoContainer: {
    width: 200,
    height: 200,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 48,
    marginBottom: 8,
  },
  placeholderSubText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  changeButton: {
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});