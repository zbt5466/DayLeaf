# Navigation Structure

This directory contains the navigation structure for the DayLeaf app, implementing a hierarchical navigation system with multiple navigators.

## Navigator Hierarchy

```
RootNavigator (Stack)
├── SplashScreen
├── AuthScreen  
└── MainNavigator (Stack)
    ├── TabNavigator (Bottom Tabs)
    │   ├── Timeline Tab → TimelineStackNavigator
    │   │   ├── TimelineScreen
    │   │   └── EntryDetail
    │   ├── Calendar Tab → CalendarStackNavigator
    │   │   ├── CalendarScreen
    │   │   └── EntryDetail
    │   └── Settings Tab → SettingsStackNavigator
    │       └── SettingsScreen
    └── CreateEntryModal (Modal)
        └── CreateEntryScreen
```

## Navigation Flow

1. **App Launch**: Starts with `SplashScreen` for initialization
2. **Authentication**: If app lock is enabled, shows `AuthScreen`
3. **Main App**: Shows `TabNavigator` with three tabs
4. **Modal Navigation**: Create entry opens as a modal overlay

## Key Features

- **Splash Navigation**: Handles app initialization and routing to main app
- **Tab Navigation**: Bottom tabs for main app sections
- **Stack Navigation**: Hierarchical navigation within each tab
- **Modal Navigation**: Overlay screens for create/edit operations
- **Type Safety**: Full TypeScript support with parameter lists

## Screen Transitions

- Timeline → Entry Detail (push)
- Calendar → Entry Detail (push)  
- Any screen → Create Entry (modal)
- Splash → Main App (replace)
- Auth → Main App (replace)

## Requirements Satisfied

- **Requirement 2.3**: Detailed screen navigation with swipe support (structure ready)
- **Requirement 2.4**: Screen transitions between timeline, calendar, and detail views