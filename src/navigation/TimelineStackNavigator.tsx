import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TimelineStackParamList } from './types';
import { TimelineScreen, EntryDetailScreen } from '../screens';

const Stack = createStackNavigator<TimelineStackParamList>();

export default function TimelineStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#4A90A4',
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="TimelineScreen"
        component={TimelineScreen}
        options={{
          title: 'DayLeaf',
        }}
      />
      <Stack.Screen
        name="EntryDetail"
        component={EntryDetailScreen}
        options={{
          title: '投稿詳細',
        }}
      />
    </Stack.Navigator>
  );
}