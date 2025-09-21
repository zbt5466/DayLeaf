# DayLeaf (デイリーフ)

1日1回「しおり」を残すコンセプトのモバイル日記アプリ

## 概要

DayLeafは、写真と短文で気軽に思い出を記録し、アルバムのように積み重ねて振り返ることができる日記アプリです。「Leaf」は葉っぱと紙（ページ）のダブルミーニングで、ほのぼのとした雰囲気で継続しやすい日記体験を提供します。

## 技術スタック

- **React Native** with **Expo**
- **TypeScript**
- **SQLite** (ローカルデータベース)
- **React Navigation** (ナビゲーション)

## プロジェクト構造

```
src/
├── components/          # 再利用可能なUIコンポーネント
├── screens/            # 画面コンポーネント
├── navigation/         # ナビゲーション設定
├── services/           # データ管理・API呼び出し
├── utils/              # ユーティリティ関数
├── hooks/              # カスタムReactフック
├── contexts/           # React Context（テーマ、設定など）
└── types/              # TypeScript型定義
```

## 開発環境のセットアップ

1. 依存関係のインストール:
   ```bash
   npm install
   ```

2. 開発サーバーの起動:
   ```bash
   npm start
   ```

3. プラットフォーム別の実行:
   ```bash
   npm run android  # Android
   npm run ios      # iOS (macOS required)
   npm run web      # Web
   ```

## 開発ツール

- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマット
- **TypeScript**: 型安全性

## スクリプト

- `npm run lint`: ESLintでコードをチェック
- `npm run lint:fix`: ESLintで自動修正
- `npm run type-check`: TypeScriptの型チェック

## 主要機能

- 1日1回の日記投稿（写真、気分、天気、テキスト）
- タイムライン・カレンダー表示
- 過去の投稿への「しおり」機能
- テーマ切り替え（季節テーマ含む）
- プッシュ通知
- アプリロック機能
- データエクスポート

## ライセンス

Private Project