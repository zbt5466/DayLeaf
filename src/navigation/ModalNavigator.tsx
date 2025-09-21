import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { CreateEntryScreen } from '../screens';

const Stack = createStackNavigator();

export default function ModalNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        presentation: 'modal',
      }}
    >
      <Stack.Screen
        name="CreateEntry"
        component={CreateEntryScreen}
      />
    </Stack.Navigator>
  );
}