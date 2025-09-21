# Design Document

## Overview

DayLeafは、React Nativeを使用したクロスプラットフォームモバイルアプリとして設計します。1日1回の日記投稿を中心とした直感的なUIと、ローカルファーストのデータ管理により、プライベートで安全な日記体験を提供します。

### 技術選択の理由
- **React Native**: AndroidとiOSの両プラットフォームで一貫した体験を提供しつつ、開発効率を最大化
- **Expo**: 開発・デプロイメントプロセスの簡素化、ネイティブ機能への容易なアクセス
- **SQLite**: ローカルデータベースとして軽量で高性能
- **React Navigation**: モバイルアプリに最適化されたナビゲーション

## Architecture

### アプリケーション構造
```
DayLeaf/
├── src/
│   ├── components/          # 再利用可能なUIコンポーネント
│   ├── screens/            # 画面コンポーネント
│   ├── navigation/         # ナビゲーション設定
│   ├── services/           # データ管理・API呼び出し
│   ├── utils/              # ユーティリティ関数
│   ├── hooks/              # カスタムReactフック
│   ├── contexts/           # React Context（テーマ、設定など）
│   └── types/              # TypeScript型定義
├── assets/                 # 画像・フォント・アイコン
└── app.json               # Expo設定
```

### データフロー
1. **ローカルファースト**: 全てのデータは最初にローカルSQLiteに保存
2. **オフライン対応**: ネットワーク接続なしでも全機能が利用可能
3. **支援プラン**: クラウド同期は支援プラン加入者のみ利用可能

## Components and Interfaces

### 画面構成

#### 1. メイン画面（タイムライン）
- **コンポーネント**: `TimelineScreen`
- **機能**: 投稿一覧表示、カレンダー切替、新規投稿ボタン
- **レイアウト**: 
  - ヘッダー: アプリロゴ、設定ボタン、表示切替ボタン
  - メインエリア: 投稿カード一覧（無限スクロール）
  - フローティングボタン: 新規投稿

#### 2. 新規投稿画面
- **コンポーネント**: `CreateEntryScreen`
- **機能**: 写真アップロード、気分・天気選択、テキスト入力
- **レイアウト**:
  - 写真エリア: 正方形プレビュー、カメラ/ギャラリー選択
  - 入力フォーム: 気分アイコン、天気アイコン、テキストフィールド
  - 保存ボタン: 右上固定

#### 3. 詳細画面（扉絵デザイン）
- **コンポーネント**: `EntryDetailScreen`
- **機能**: 投稿詳細表示、編集・削除、前後日移動
- **レイアウト**:
  - 扉絵風デザイン: 写真を中心とした装飾的レイアウト
  - スワイプナビゲーション: 左右スワイプで前後日移動
  - アクションメニュー: 編集・削除オプション

#### 4. カレンダー画面
- **コンポーネント**: `CalendarScreen`
- **機能**: 月表示カレンダー、日付別サムネイル
- **レイアウト**:
  - カレンダーグリッド: 各日付にサムネイル画像表示
  - 月切替: 左右スワイプまたはボタン

#### 5. 設定画面
- **コンポーネント**: `SettingsScreen`
- **機能**: テーマ変更、通知設定、アプリロック、支援プラン
- **レイアウト**:
  - セクション分け: 外観、通知、セキュリティ、支援

#### 6. スプラッシュスクリーン（起動画面）
- **コンポーネント**: `SplashScreen`
- **機能**: アプリ起動時の初期化処理、ブランディング表示
- **レイアウト**:
  - 中央配置: DayLeafロゴ（本に葉っぱを挟んだデザイン）
  - 背景: 季節に応じたグラデーション
  - ローディング表示: 初期化進行状況
- **表示時間**: 最大3秒（初期化完了次第遷移）

### 共通コンポーネント

#### UIコンポーネント
- `SplashScreen`: 起動画面（ロゴ表示、初期化処理）
- `PhotoPicker`: 写真選択・トリミング
- `MoodSelector`: 気分アイコン選択
- `WeatherSelector`: 天気アイコン選択
- `EntryCard`: タイムライン用投稿カード
- `ThemeProvider`: テーマ管理
- `LoadingSpinner`: ローディング表示
- `AuthScreen`: アプリロック認証画面

#### ナビゲーション
- `SplashNavigator`: 起動時の初期化とメイン画面への遷移
- `TabNavigator`: メイン画面、カレンダー、設定のタブ
- `StackNavigator`: 詳細画面、編集画面への遷移
- `ModalNavigator`: 新規投稿画面（モーダル表示）
- `AuthNavigator`: アプリロック時の認証画面（PIN/生体認証）

## Data Models

### Entry（日記エントリー）
```typescript
interface Entry {
  id: string;
  date: string; // YYYY-MM-DD形式
  photo?: string; // ローカルファイルパス
  mood: MoodType;
  weather: WeatherType;
  goodThing?: string; // null許容
  badThing?: string; // null許容
  memo: string; // 必須（空文字列可）
  createdAt: Date;
  updatedAt: Date;
}

enum MoodType {
  HAPPY = 'happy',
  GOOD = 'good',
  NORMAL = 'normal',
  SAD = 'sad',
  ANGRY = 'angry'
}

enum WeatherType {
  SUNNY = 'sunny',
  CLOUDY = 'cloudy',
  RAINY = 'rainy',
  SNOWY = 'snowy'
}
```

### Settings（設定）
```typescript
interface Settings {
  theme: ThemeType;
  notificationTime: string; // HH:MM形式
  notificationEnabled: boolean;
  appLockEnabled: boolean;
  appLockType: 'pin' | 'biometric';
  isPremium: boolean;
  seasonalThemeEnabled: boolean;
}

enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  SEASONAL = 'seasonal'
}
```

### データベーススキーマ（SQLite）
```sql
CREATE TABLE entries (
  id TEXT PRIMARY KEY,
  date TEXT UNIQUE NOT NULL,
  photo TEXT,
  mood TEXT NOT NULL,
  weather TEXT NOT NULL,
  good_thing TEXT,
  bad_thing TEXT,
  memo TEXT NOT NULL DEFAULT '',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX idx_entries_date ON entries(date);
```

## Error Handling

### エラー分類と対応

#### 1. データベースエラー
- **発生場面**: SQLite操作失敗
- **対応**: 自動リトライ、ユーザーへの分かりやすいエラーメッセージ表示
- **ログ**: エラー詳細をローカルログに記録

#### 2. ファイルシステムエラー
- **発生場面**: 写真保存・読み込み失敗
- **対応**: 代替保存場所の試行、ストレージ容量チェック
- **ユーザー通知**: 「写真の保存に失敗しました。ストレージ容量を確認してください」

#### 3. 権限エラー
- **発生場面**: カメラ・ストレージアクセス拒否
- **対応**: 権限要求ダイアログ、設定画面への誘導
- **ユーザー通知**: 「写真を使用するには権限が必要です」

#### 4. ネットワークエラー（支援プラン機能）
- **発生場面**: クラウド同期失敗
- **対応**: オフライン状態での継続利用、再接続時の自動同期
- **ユーザー通知**: 「同期は後で行われます」

### エラー処理パターン
```typescript
// エラーハンドリングのベースクラス
class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public userMessage: string
  ) {
    super(message);
  }
}

// エラー処理フック
const useErrorHandler = () => {
  const showError = (error: AppError) => {
    // ユーザーフレンドリーなエラー表示
    Alert.alert('エラー', error.userMessage);
    // ログ記録
    console.error(`[${error.code}] ${error.message}`);
  };
  
  return { showError };
};
```

## Testing Strategy

### テスト構成

#### 1. ユニットテスト
- **対象**: ユーティリティ関数、データ変換ロジック、バリデーション
- **ツール**: Jest
- **カバレッジ目標**: 80%以上

#### 2. コンポーネントテスト
- **対象**: 個別UIコンポーネント
- **ツール**: React Native Testing Library
- **テスト内容**: レンダリング、ユーザーインタラクション、プロパティ変更

#### 3. 統合テスト
- **対象**: 画面間遷移、データフロー
- **ツール**: Detox（E2Eテスト）
- **シナリオ**: 
  - 新規投稿作成から保存まで
  - 投稿編集・削除
  - 設定変更

#### 4. パフォーマンステスト
- **対象**: 大量データでの動作、メモリ使用量
- **ツール**: Flipper、React Native Performance Monitor
- **指標**: 
  - アプリ起動時間: 3秒以内
  - 画面遷移: 300ms以内
  - 画像読み込み: 5秒以内

### テスト実行戦略
```typescript
// テストデータ生成
const createMockEntry = (overrides?: Partial<Entry>): Entry => ({
  id: 'test-id',
  date: '2024-01-01',
  mood: MoodType.HAPPY,
  weather: WeatherType.SUNNY,
  goodThing: 'テスト用良いこと',
  badThing: 'テスト用悪いこと',
  memo: 'テスト用メモ',
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides
});

// コンポーネントテスト例
describe('EntryCard', () => {
  it('should display entry information correctly', () => {
    const entry = createMockEntry();
    const { getByText } = render(<EntryCard entry={entry} />);
    
    expect(getByText('テスト用良いこと')).toBeTruthy();
    expect(getByText('テスト用悪いこと')).toBeTruthy();
  });
});
```

### デザインシステム

#### カラーパレット
```typescript
const colors = {
  // 基本色
  primary: '#4A90A4',      // メインブルー
  secondary: '#7FB069',    // アクセントグリーン
  
  // 季節色
  spring: '#FFB3BA',       // 薄ピンク
  summer: '#BAFFC9',       // 淡緑
  autumn: '#FFD93D',       // 紅葉色
  winter: '#BAE1FF',       // 淡青
  
  // システム色
  background: '#FFFFFF',
  surface: '#F5F5F5',
  text: '#333333',
  textSecondary: '#666666',
  border: '#E0E0E0',
  
  // 状態色
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
};
```

#### タイポグラフィ
```typescript
const typography = {
  h1: { fontSize: 24, fontWeight: 'bold' },
  h2: { fontSize: 20, fontWeight: 'bold' },
  h3: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: 'normal' },
  caption: { fontSize: 14, fontWeight: 'normal' },
  small: { fontSize: 12, fontWeight: 'normal' },
};
```

#### アイコンシステム
- **気分アイコン**: 😊😌😐😔😠
- **天気アイコン**: ☀️☁️🌧️❄️
- **ナビゲーション**: Material Icons（Android）、SF Symbols（iOS）