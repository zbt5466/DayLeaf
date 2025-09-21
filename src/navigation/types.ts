// Navigation type definitions
export type RootStackParamList = {
  Splash: undefined;
  Main: undefined;
  Auth: undefined;
};

export type MainTabParamList = {
  Timeline: undefined;
  Calendar: undefined;
  Settings: undefined;
};

export type TimelineStackParamList = {
  TimelineScreen: undefined;
  EntryDetail: { entryId: string };
  CreateEntry: undefined;
  EditEntry: { entryId: string };
};

export type CalendarStackParamList = {
  CalendarScreen: undefined;
  EntryDetail: { entryId: string };
};

export type SettingsStackParamList = {
  SettingsScreen: undefined;
};

export type AuthStackParamList = {
  AuthScreen: undefined;
};