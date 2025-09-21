import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CalendarStackParamList } from './types';
import { CalendarScreen, EntryDetailScreen } from '../screens';

const Stack = createStackNavigator<CalendarStackParamList>();

export default function CalendarStackNavigator() {
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
        name="CalendarScreen"
        component={CalendarScreen}
        options={{
          title: 'カレンダー',
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