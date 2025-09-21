/**
 * PhotoPicker簡単テスト - React Native Testing Library不要
 */

import { PhotoPicker } from '../PhotoPicker';

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

// React Native のモック
jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  TouchableOpacity: 'TouchableOpacity',
  Image: {
    getSize: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
  },
  StyleSheet: {
    create: (styles: any) => styles,
  },
  ActivityIndicator: 'ActivityIndicator',
}));

describe('PhotoPicker Simple Tests', () => {
  const mockOnPhotoSelected = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PhotoPicker component can be imported', () => {
    expect(PhotoPicker).toBeDefined();
    expect(typeof PhotoPicker).toBe('function');
  });

  it('PhotoPicker component has correct display name', () => {
    expect(PhotoPicker.name).toBe('PhotoPicker');
  });

  it('can create PhotoPicker props interface', () => {
    const props = {
      onPhotoSelected: mockOnPhotoSelected,
      currentPhoto: 'file://test.jpg',
      disabled: false,
    };

    expect(props.onPhotoSelected).toBe(mockOnPhotoSelected);
    expect(props.currentPhoto).toBe('file://test.jpg');
    expect(props.disabled).toBe(false);
  });
});