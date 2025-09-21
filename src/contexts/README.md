# DayLeaf テーマシステム

DayLeafアプリのテーマシステムは、一貫したデザインと季節に応じた自動テーマ切り替えを提供します。

## 機能

### テーマタイプ
- **Light**: 明るいテーマ
- **Dark**: 暗いテーマ  
- **Seasonal**: 季節に応じて自動的に色調が変わるテーマ

### 季節テーマ
現在の季節に基づいて背景色が自動的に調整されます：
- **春 (3-5月)**: 薄ピンク系
- **夏 (6-8月)**: 淡緑系
- **秋 (9-11月)**: 紅葉色系
- **冬 (12-2月)**: 淡青系

## 使用方法

### 基本セットアップ

```tsx
import { ThemeProvider } from './contexts';

function App() {
  return (
    <ThemeProvider>
      <YourAppContent />
    </ThemeProvider>
  );
}
```

### テーマの使用

```tsx
import { useTheme } from './contexts';

const MyComponent = () => {
  const { theme, themeType, setThemeType, currentSeason } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text }}>
        現在のテーマ: {themeType}
      </Text>
      <Text style={{ color: theme.colors.textSecondary }}>
        季節: {currentSeason}
      </Text>
    </View>
  );
};
```

### テーマ切り替え

```tsx
import { ThemeType } from './types';
import { useTheme } from './contexts';

const SettingsScreen = () => {
  const { themeType, setThemeType, isSeasonalThemeEnabled, setSeasonalThemeEnabled } = useTheme();

  const handleThemeChange = (newTheme: ThemeType) => {
    setThemeType(newTheme);
  };

  return (
    <View>
      <Button 
        title="ライトテーマ" 
        onPress={() => handleThemeChange(ThemeType.LIGHT)} 
      />
      <Button 
        title="ダークテーマ" 
        onPress={() => handleThemeChange(ThemeType.DARK)} 
      />
      <Button 
        title="季節テーマ" 
        onPress={() => handleThemeChange(ThemeType.SEASONAL)} 
      />
    </View>
  );
};
```

## カスタムフック

### useThemeStyles
テーマを使用したスタイル作成のためのフック：

```tsx
import { useThemeStyles } from '../hooks';

const MyComponent = () => {
  const styles = useThemeStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.md,
      borderRadius: theme.borderRadius.md,
    },
    title: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>タイトル</Text>
    </View>
  );
};
```

### useCommonStyles
よく使用される共通スタイルを提供：

```tsx
import { useCommonStyles } from '../hooks';

const MyComponent = () => {
  const commonStyles = useCommonStyles();

  return (
    <View style={commonStyles.container}>
      <View style={commonStyles.spaceBetween}>
        <Text style={commonStyles.textPrimary}>左側</Text>
        <Text style={commonStyles.textSecondary}>右側</Text>
      </View>
    </View>
  );
};
```

## テーマ構造

### Colors
```typescript
interface Colors {
  // 基本色
  primary: string;
  secondary: string;
  
  // 季節色
  spring: string;
  summer: string;
  autumn: string;
  winter: string;
  
  // システム色
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  
  // 状態色
  success: string;
  warning: string;
  error: string;
}
```

### Typography
```typescript
interface Typography {
  h1: { fontSize: number; fontWeight: string };
  h2: { fontSize: number; fontWeight: string };
  h3: { fontSize: number; fontWeight: string };
  body: { fontSize: number; fontWeight: string };
  caption: { fontSize: number; fontWeight: string };
  small: { fontSize: number; fontWeight: string };
}
```

### Spacing & Border Radius
```typescript
interface Theme {
  spacing: {
    xs: 4;
    sm: 8;
    md: 16;
    lg: 24;
    xl: 32;
  };
  borderRadius: {
    sm: 4;
    md: 8;
    lg: 16;
  };
}
```

## 設定の永続化

テーマ設定は自動的にローカルデータベースに保存され、アプリ再起動時に復元されます。

## 季節の自動検出

システムは1時間ごとに現在の季節をチェックし、季節が変わった場合は自動的にテーマを更新します。