import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PhotoPicker } from './PhotoPicker';
import { useTheme } from '../contexts/ThemeContext';

export const PhotoPickerDemo: React.FC = () => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [selectedPhoto, setSelectedPhoto] = useState<string>('');
  const [processingTime] = useState<number | null>(null);

  const handlePhotoSelected = (photoPath: string) => {
    setSelectedPhoto(photoPath);
    console.log('Photo selected:', photoPath);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>
          PhotoPicker Demo
        </Text>
        
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          写真選択・処理機能のデモ
        </Text>

        <View style={styles.pickerContainer}>
          <PhotoPicker
            onPhotoSelected={handlePhotoSelected}
            currentPhoto={selectedPhoto}
          />
        </View>

        {selectedPhoto ? (
          <View style={styles.infoContainer}>
            <Text style={[styles.infoTitle, { color: colors.text }]}>
              選択された写真:
            </Text>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              {selectedPhoto}
            </Text>
            
            {processingTime && (
              <Text style={[styles.performanceText, { color: colors.primary }]}>
                処理時間: {processingTime}ms
              </Text>
            )}
          </View>
        ) : (
          <View style={styles.infoContainer}>
            <Text style={[styles.infoText, { color: colors.textSecondary }]}>
              写真が選択されていません
            </Text>
          </View>
        )}

        <View style={styles.featuresContainer}>
          <Text style={[styles.featuresTitle, { color: colors.text }]}>
            実装済み機能:
          </Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
            ✅ カメラ・ギャラリー選択
          </Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
            ✅ 正方形トリミング
          </Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
            ✅ ローカル保存とパス管理
          </Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
            ✅ 5秒以内の処理完了
          </Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
            ✅ エラーハンドリング
          </Text>
          <Text style={[styles.featureItem, { color: colors.textSecondary }]}>
            ✅ 権限管理
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  pickerContainer: {
    marginBottom: 32,
  },
  infoContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  performanceText: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  featuresContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  featureItem: {
    fontSize: 14,
    marginBottom: 6,
    paddingLeft: 8,
  },
});