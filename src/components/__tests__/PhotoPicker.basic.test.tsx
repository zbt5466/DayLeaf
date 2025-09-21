/**
 * PhotoPicker基本動作テスト
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { PhotoPicker } from '../PhotoPicker';

// 最小限のThemeProviderモック
const MockThemeProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

// useThemeフックのモック
jest.mock('../../contexts/ThemeContext', () => ({
  useTheme: () => ({
    theme: {
      colors: {
        primary: '#007AFF',
        background: '#FFFFFF',
        text: '#000000',
        textSecondary: '#666666',
        border: '#E5E5E5',
      },
    },
  }),
}));

// Expo modules のモック
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
  },
  PermissionStatus: {
    GRANTED: 'granted',
    DENIED: 'denied',
  },
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file://documents/',
  getInfoAsync: jest.fn(),
  makeDirectoryAsync: jest.fn(),
  copyAsync: jest.fn(),
  deleteAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
}));

jest.mock('expo-image-manipulator', () => ({
  manipulateAsync: jest.fn(),
  SaveFormat: {
    JPEG: 'jpeg',
    PNG: 'png',
  },
}));

// React Native Image のモック
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Image: {
      ...RN.Image,
      getSize: jest.fn(),
    },
    Alert: {
      alert: jest.fn(),
    },
  };
});

describe('PhotoPicker Basic Tests', () => {
  const mockOnPhotoSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { getByText } = render(
      <MockThemeProvider>
        <PhotoPicker onPhotoSelected={mockOnPhotoSelected} />
      </MockThemeProvider>
    );

    expect(getByText('📷')).toBeTruthy();
    expect(getByText('写真を追加')).toBeTruthy();
  });

  it('shows photo when currentPhoto is provided', () => {
    const { queryByText } = render(
      <MockThemeProvider>
        <PhotoPicker 
          onPhotoSelected={mockOnPhotoSelected} 
          currentPhoto="file://test-photo.jpg"
        />
      </MockThemeProvider>
    );

    // プレースホルダーテキストが表示されないことを確認
    expect(queryByText('写真を追加')).toBeNull();
  });

  it('is disabled when disabled prop is true', () => {
    const { getByText } = render(
      <MockThemeProvider>
        <PhotoPicker 
          onPhotoSelected={mockOnPhotoSelected} 
          disabled={true}
        />
      </MockThemeProvider>
    );

    // コンポーネントがレンダリングされることを確認
    expect(getByText('📷')).toBeTruthy();
  });
});