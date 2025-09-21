# Database Services

This directory contains the database implementation for the DayLeaf app, including data models, database setup, and CRUD operations.

## Files Overview

### Core Database Files
- `database.ts` - Main database connection and initialization
- `entryRepository.ts` - CRUD operations for diary entries
- `settingsRepository.ts` - CRUD operations for app settings
- `index.ts` - Main database service that combines all repositories

### Supporting Files
- `example.ts` - Example usage of the database services
- `README.md` - This documentation file

## Usage

### Initialize Database
```typescript
import { DatabaseService } from './services';

const dbService = DatabaseService.getInstance();
await dbService.initialize();
```

### Entry Operations
```typescript
// Create a new entry
const entry = await dbService.entryRepository.create({
  date: '2024-01-01',
  mood: MoodType.HAPPY,
  weather: WeatherType.SUNNY,
  memo: 'Great day!',
  goodThing: 'Had fun with friends',
  badThing: 'A bit tired'
});

// Find entry by date
const todayEntry = await dbService.entryRepository.findByDate('2024-01-01');

// Get all entries with pagination
const entries = await dbService.entryRepository.findAll(10, 0);

// Update entry
const updated = await dbService.entryRepository.update({
  id: entry.id,
  memo: 'Updated memo'
});

// Delete entry
await dbService.entryRepository.delete(entry.id);
```

### Settings Operations
```typescript
// Get current settings
const settings = await dbService.settingsRepository.get();

// Update settings
const updated = await dbService.settingsRepository.update({
  theme: 'dark',
  notificationTime: '19:00'
});

// Get specific setting
const theme = await dbService.settingsRepository.getSetting('theme');

// Set specific setting
await dbService.settingsRepository.setSetting('theme', 'light');
```

## Database Schema

### Entries Table
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
```

### Settings Table
```sql
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

## Error Handling

The database services use custom error handling with user-friendly messages:

- `DatabaseError` - Custom error class with error codes
- `handleDatabaseError` - Centralized error handling function
- Automatic error translation to Japanese user messages

## Data Types

### Entry Types
- `Entry` - Complete entry object
- `CreateEntryInput` - Input for creating new entries
- `UpdateEntryInput` - Input for updating existing entries
- `MoodType` - Enum for mood values (happy, good, normal, sad, angry)
- `WeatherType` - Enum for weather values (sunny, cloudy, rainy, snowy)

### Settings Types
- `Settings` - Complete settings object
- `SettingsUpdate` - Partial settings for updates
- `ThemeType` - Enum for theme values (light, dark, seasonal)

## Requirements Fulfilled

This implementation fulfills the following requirements:

- **Requirement 1.3**: Entry data model with all required fields
- **Requirement 7.1**: Local data storage with SQLite
- **Requirement 8.4**: Offline functionality with local database

## Next Steps

After implementing this database foundation, you can:

1. Create React hooks to use these services in components
2. Add data validation and business logic
3. Implement data migration strategies
4. Add backup and restore functionality
5. Integrate with the UI components