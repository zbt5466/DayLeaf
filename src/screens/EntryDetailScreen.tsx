import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { TimelineStackParamList } from '../navigation/types';

type EntryDetailRouteProp = RouteProp<TimelineStackParamList, 'EntryDetail'>;

export default function EntryDetailScreen() {
  const route = useRoute<EntryDetailRouteProp>();
  const { entryId } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>投稿詳細</Text>
      <Text style={styles.subtitle}>Entry ID: {entryId}</Text>
      <Text style={styles.subtitle}>詳細表示機能は後で実装されます</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 4,
  },
});