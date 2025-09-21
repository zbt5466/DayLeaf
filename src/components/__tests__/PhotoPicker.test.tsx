import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { PhotoPicker } from '../PhotoPicker';
import { ThemeProvider } from '../../contexts/ThemeContext';

// Mock dependencies
jest.mock('expo-image-picker');
jest.mock('expo-image-manipulator');
jest.mock('expo-file-system');

const mockImagePicker = ImagePicker as jest.Mocked<typeof ImagePicker>;
const mockImageManipulator = ImageManipulator as jest.Mocked<typeof ImageManipulator>;
const mockFileSystem = FileSystem as jest.Mocked<typeof FileSystem>;

// Mock Alert
jest.spyOn(Alert, 'alert');

const MockedThemeProvider = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('PhotoPicker', () => {
  const mockOnPhotoSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
      status: ImagePicker.PermissionStatus.GRANTED,
      expires: 'never',
      canAskAgain: true,
      granted: true,
    });
    
    mockImagePicker.requestMediaLibraryPermissionsAsync.mockResolvedValue({
      status: ImagePicker.PermissionStatus.GRANTED,
      expires: 'never',
      canAskAgain: true,
      granted: true,
    });

    mockFileSystem.getInfoAsync.mockResolvedValue({
      exists: true,
      isDirectory: true,
      modificationTime: Date.now(),
      size: 0,
      uri: 'file://test',
    });

    mockFileSystem.makeDirectoryAsync.mockResolvedValue();
    mockFileSystem.copyAsync.mockResolvedValue();
  });

  it('renders placeholder when no photo is selected', () => {
    const { getByText } = render(
      <MockedThemeProvider>
        <PhotoPicker onPhotoSelected={mockOnPhotoSelected} />
      </MockedThemeProvider>
    );

    expect(getByText('📷')).toBeTruthy();
    expect(getByText('写真を追加')).toBeTruthy();
  });

  it('renders photo when currentPhoto is provided', () => {
    const { getByTestId } = render(
      <MockedThemeProvider>
        <PhotoPicker 
          onPhotoSelected={mockOnPhotoSelected} 
          currentPhoto="file://test-photo.jpg"
        />
      </MockedThemeProvider>
    );

    // Photo should be displayed
    expect(getByTestId('photo-image')).toBeTruthy();
  });

  it('shows image picker options when placeholder is tapped', async () => {
    const { getByText } = render(
      <MockedThemeProvider>
        <PhotoPicker onPhotoSelected={mockOnPhotoSelected} />
      </MockedThemeProvider>
    );

    fireEvent.press(getByText('写真を追加'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '写真を選択',
        '写真の取得方法を選択してください',
        expect.arrayContaining([
          expect.objectContaining({ text: 'カメラで撮影' }),
          expect.objectContaining({ text: 'ギャラリーから選択' }),
          expect.objectContaining({ text: 'キャンセル' }),
        ])
      );
    });
  });

  it('processes image correctly when camera is used', async () => {
    const mockImageUri = 'file://test-image.jpg';
    const mockProcessedUri = 'file://processed-image.jpg';
    // const mockLocalPath = 'file://documents/photos/photo_123.jpg';

    // Mock Image.getSize
    const mockGetSize = jest.fn((uri, success) => {
      success(1000, 800); // width, height
    });
    require('react-native').Image.getSize = mockGetSize;

    mockImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: mockImageUri, width: 1000, height: 800 }],
    });

    mockImageManipulator.manipulateAsync.mockResolvedValue({
      uri: mockProcessedUri,
      width: 800,
      height: 800,
    });

    const { getByText } = render(
      <MockedThemeProvider>
        <PhotoPicker onPhotoSelected={mockOnPhotoSelected} />
      </MockedThemeProvider>
    );

    fireEvent.press(getByText('写真を追加'));

    // Simulate camera selection
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const cameraOption = alertCall[2].find((option: any) => option.text === 'カメラで撮影');
    await cameraOption.onPress();

    await waitFor(() => {
      expect(mockImagePicker.launchCameraAsync).toHaveBeenCalled();
      expect(mockImageManipulator.manipulateAsync).toHaveBeenCalledWith(
        mockImageUri,
        expect.arrayContaining([
          expect.objectContaining({
            crop: expect.objectContaining({
              originX: 100, // (1000 - 800) / 2
              originY: 0,   // (800 - 800) / 2
              width: 800,
              height: 800,
            }),
          }),
          expect.objectContaining({
            resize: {
              width: 800,
              height: 800,
            },
          }),
        ]),
        expect.objectContaining({
          compress: 0.8,
          format: ImageManipulator.SaveFormat.JPEG,
        })
      );
    });
  });

  it('handles permission denial gracefully', async () => {
    mockImagePicker.requestCameraPermissionsAsync.mockResolvedValue({
      status: ImagePicker.PermissionStatus.DENIED,
      expires: 'never',
      canAskAgain: true,
      granted: false,
    });

    const { getByText } = render(
      <MockedThemeProvider>
        <PhotoPicker onPhotoSelected={mockOnPhotoSelected} />
      </MockedThemeProvider>
    );

    fireEvent.press(getByText('写真を追加'));

    // Simulate camera selection
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const cameraOption = alertCall[2].find((option: any) => option.text === 'カメラで撮影');
    await cameraOption.onPress();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        '権限が必要です',
        '写真を使用するには、カメラとフォトライブラリへのアクセス権限が必要です。設定から権限を有効にしてください。',
        [{ text: 'OK' }]
      );
    });

    expect(mockOnPhotoSelected).not.toHaveBeenCalled();
  });

  it('shows loading state during image processing', async () => {
    const mockImageUri = 'file://test-image.jpg';
    
    // Mock a slow image processing
    mockImageManipulator.manipulateAsync.mockImplementation(() => 
      new Promise(resolve => 
        setTimeout(() => resolve({
          uri: 'file://processed.jpg',
          width: 800,
          height: 800,
        }), 100)
      )
    );

    mockImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: mockImageUri, width: 1000, height: 800 }],
    });

    const { getByText, queryByText } = render(
      <MockedThemeProvider>
        <PhotoPicker onPhotoSelected={mockOnPhotoSelected} />
      </MockedThemeProvider>
    );

    fireEvent.press(getByText('写真を追加'));

    // Simulate camera selection
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const cameraOption = alertCall[2].find((option: any) => option.text === 'カメラで撮影');
    await cameraOption.onPress();

    // Should show loading state
    await waitFor(() => {
      expect(queryByText('処理中...')).toBeTruthy();
    });
  });

  it('is disabled when disabled prop is true', () => {
    const { getByText } = render(
      <MockedThemeProvider>
        <PhotoPicker 
          onPhotoSelected={mockOnPhotoSelected} 
          disabled={true}
        />
      </MockedThemeProvider>
    );

    const photoContainer = getByText('写真を追加').parent;
    fireEvent.press(photoContainer);

    expect(Alert.alert).not.toHaveBeenCalled();
  });

  it('handles image processing errors gracefully', async () => {
    const mockImageUri = 'file://test-image.jpg';
    
    mockImagePicker.launchCameraAsync.mockResolvedValue({
      canceled: false,
      assets: [{ uri: mockImageUri, width: 1000, height: 800 }],
    });

    mockImageManipulator.manipulateAsync.mockRejectedValue(new Error('Processing failed'));

    const { getByText } = render(
      <MockedThemeProvider>
        <PhotoPicker onPhotoSelected={mockOnPhotoSelected} />
      </MockedThemeProvider>
    );

    fireEvent.press(getByText('写真を追加'));

    // Simulate camera selection
    const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
    const cameraOption = alertCall[2].find((option: any) => option.text === 'カメラで撮影');
    await cameraOption.onPress();

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        '写真の選択に失敗しました。もう一度お試しください。',
        [{ text: 'OK' }]
      );
    });

    expect(mockOnPhotoSelected).not.toHaveBeenCalled();
  });
});