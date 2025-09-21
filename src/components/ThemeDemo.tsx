import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../contexts';
import { useThemeStyles, useCommonStyles } from '../hooks';
import { Button, Card, Input } from './';
import { ThemeType } from '../types';

/**
 * テーマシステムのデモンストレーション用コンポーネント
 * 開発・テスト用途
 */
export const ThemeDemo: React.FC = () => {
  const { theme, themeType, currentSeason, setThemeType, isSeasonalThemeEnabled, setSeasonalThemeEnabled } = useTheme();
  const commonStyles = useCommonStyles();
  
  const styles = useThemeStyles((theme) => ({
    header: {
      ...theme.typography.h1,
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: theme.spacing.lg,
    },
    sectionTitle: {
      ...theme.typography.h2,
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    infoText: {
      ...theme.typography.body,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.sm,
    },
    colorBox: {
      width: 50,
      height: 50,
      borderRadius: theme.borderRadius.sm,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    colorRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: theme.spacing.md,
    },
  }));

  const handleThemeChange = () => {
    const themes = [ThemeType.LIGHT, ThemeType.DARK, ThemeType.SEASONAL];
    const currentIndex = themes.indexOf(themeType);
    const nextIndex = (currentIndex + 1) % themes.length;
    setThemeType(themes[nextIndex]);
  };

  return (
    <ScrollView style={commonStyles.container}>
      <View style={commonStyles.paddingMd}>
        <Text style={styles.header}>DayLeaf テーマシステム</Text>
        
        {/* 現在のテーマ情報 */}
        <Card variant="outlined" style={{ marginBottom: theme.spacing.lg }}>
          <Text style={styles.sectionTitle}>現在のテーマ</Text>
          <Text style={styles.infoText}>テーマタイプ: {themeType}</Text>
          <Text style={styles.infoText}>現在の季節: {currentSeason}</Text>
          <Text style={styles.infoText}>季節テーマ有効: {isSeasonalThemeEnabled ? 'はい' : 'いいえ'}</Text>
        </Card>

        {/* テーマ切り替えボタン */}
        <Card variant="elevated" style={{ marginBottom: theme.spacing.lg }}>
          <Text style={styles.sectionTitle}>テーマ切り替え</Text>
          <View style={commonStyles.row}>
            <Button
              title="テーマ変更"
              onPress={handleThemeChange}
              style={{ marginRight: theme.spacing.sm }}
            />
            <Button
              title="季節テーマ切替"
              onPress={() => setSeasonalThemeEnabled(!isSeasonalThemeEnabled)}
              variant="outline"
            />
          </View>
        </Card>

        {/* カラーパレット */}
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <Text style={styles.sectionTitle}>カラーパレット</Text>
          <View style={styles.colorRow}>
            <View style={[styles.colorBox, { backgroundColor: theme.colors.primary }]} />
            <View style={[styles.colorBox, { backgroundColor: theme.colors.secondary }]} />
            <View style={[styles.colorBox, { backgroundColor: theme.colors.spring }]} />
            <View style={[styles.colorBox, { backgroundColor: theme.colors.summer }]} />
            <View style={[styles.colorBox, { backgroundColor: theme.colors.autumn }]} />
            <View style={[styles.colorBox, { backgroundColor: theme.colors.winter }]} />
          </View>
        </Card>

        {/* ボタンバリエーション */}
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <Text style={styles.sectionTitle}>ボタンバリエーション</Text>
          <View style={{ gap: theme.spacing.sm }}>
            <Button title="Primary Button" onPress={() => {}} />
            <Button title="Secondary Button" onPress={() => {}} variant="secondary" />
            <Button title="Outline Button" onPress={() => {}} variant="outline" />
            <Button title="Text Button" onPress={() => {}} variant="text" />
            <Button title="Disabled Button" onPress={() => {}} disabled />
            <Button title="Loading Button" onPress={() => {}} loading />
          </View>
        </Card>

        {/* 入力フィールド */}
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <Text style={styles.sectionTitle}>入力フィールド</Text>
          <Input
            label="ラベル付き入力"
            placeholder="プレースホルダーテキスト"
            helperText="ヘルパーテキスト"
          />
          <Input
            label="エラー状態"
            placeholder="エラーのある入力"
            error="エラーメッセージ"
            value="無効な値"
          />
          <Input
            placeholder="Filled variant"
            variant="filled"
          />
        </Card>

        {/* タイポグラフィ */}
        <Card>
          <Text style={styles.sectionTitle}>タイポグラフィ</Text>
          <Text style={[theme.typography.h1, { color: theme.colors.text, marginBottom: theme.spacing.xs }]}>
            見出し1 (H1)
          </Text>
          <Text style={[theme.typography.h2, { color: theme.colors.text, marginBottom: theme.spacing.xs }]}>
            見出し2 (H2)
          </Text>
          <Text style={[theme.typography.h3, { color: theme.colors.text, marginBottom: theme.spacing.xs }]}>
            見出し3 (H3)
          </Text>
          <Text style={[theme.typography.body, { color: theme.colors.text, marginBottom: theme.spacing.xs }]}>
            本文テキスト (Body)
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: theme.spacing.xs }]}>
            キャプション (Caption)
          </Text>
          <Text style={[theme.typography.small, { color: theme.colors.textSecondary }]}>
            小さなテキスト (Small)
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
};