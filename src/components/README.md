# DayLeaf UI Components

このディレクトリには、DayLeafアプリで使用される再利用可能なUIコンポーネントが含まれています。

## 利用可能なコンポーネント

### Button
汎用的なボタンコンポーネント

**Props:**
- `title`: ボタンのテキスト
- `onPress`: タップ時のコールバック
- `variant`: 'primary' | 'secondary' | 'outline' | 'text'
- `size`: 'small' | 'medium' | 'large'
- `disabled`: 無効状態
- `loading`: ローディング状態

**使用例:**
```tsx
<Button 
  title="保存" 
  onPress={handleSave} 
  variant="primary" 
  size="medium" 
/>
```

### Card
コンテンツをグループ化するカードコンポーネント

**Props:**
- `children`: カード内のコンテンツ
- `onPress`: タップ可能にする場合のコールバック
- `variant`: 'default' | 'elevated' | 'outlined'
- `padding`: 'none' | 'small' | 'medium' | 'large'

**使用例:**
```tsx
<Card variant="elevated" padding="medium">
  <Text>カードの内容</Text>
</Card>
```

### Input
テキスト入力フィールドコンポーネント

**Props:**
- `label`: ラベルテキスト
- `error`: エラーメッセージ
- `helperText`: ヘルパーテキスト
- `variant`: 'outlined' | 'filled'
- `size`: 'small' | 'medium' | 'large'

**使用例:**
```tsx
<Input
  label="メモ"
  placeholder="今日の出来事を入力..."
  value={memo}
  onChangeText={setMemo}
  error={memoError}
/>
```

### ThemeDemo
テーマシステムのデモンストレーション用コンポーネント（開発用）

## テーマシステムの使用

すべてのコンポーネントは自動的にテーマシステムを使用します。

```tsx
import { ThemeProvider } from '../contexts';
import { Button, Card, Input } from '../components';

function App() {
  return (
    <ThemeProvider>
      <YourAppContent />
    </ThemeProvider>
  );
}
```

## カスタムスタイルの作成

テーマを使用したカスタムスタイルを作成する場合：

```tsx
import { useThemeStyles } from '../hooks';

const MyComponent = () => {
  const styles = useThemeStyles((theme) => ({
    container: {
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
    },
    text: {
      ...theme.typography.body,
      color: theme.colors.text,
    },
  }));

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello World</Text>
    </View>
  );
};
```