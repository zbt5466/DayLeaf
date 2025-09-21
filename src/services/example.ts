/**
 * Example usage of the database services
 * This file demonstrates how to use the DatabaseService, EntryRepository, and SettingsRepository
 */

import { DatabaseService } from './index';
import { MoodType, WeatherType, ThemeType } from '../types';
import { getTodayString } from '../utils';

export const exampleUsage = async () => {
  // Initialize the database service
  const dbService = DatabaseService.getInstance();
  await dbService.initialize();

  // Example: Create a new entry
  const newEntry = await dbService.entryRepository.create({
    date: getTodayString(),
    mood: MoodType.HAPPY,
    weather: WeatherType.SUNNY,
    goodThing: '友達と楽しい時間を過ごした',
    badThing: '少し疲れた',
    memo: '今日は良い一日だった！',
    photo: '/path/to/photo.jpg'
  });

  console.log('Created entry:', newEntry);

  // Example: Find entry by date
  const todayEntry = await dbService.entryRepository.findByDate(getTodayString());
  console.log('Today\'s entry:', todayEntry);

  // Example: Get all entries with pagination
  const allEntries = await dbService.entryRepository.findAll(10, 0);
  console.log('All entries (first 10):', allEntries);

  // Example: Update settings
  const updatedSettings = await dbService.settingsRepository.update({
    theme: ThemeType.DARK,
    notificationTime: '19:00',
    notificationEnabled: true
  });

  console.log('Updated settings:', updatedSettings);

  // Example: Get current settings
  const currentSettings = await dbService.settingsRepository.get();
  console.log('Current settings:', currentSettings);

  // Example: Update an entry
  if (newEntry) {
    const updatedEntry = await dbService.entryRepository.update({
      id: newEntry.id,
      memo: '更新されたメモ',
      goodThing: '更新された良いこと'
    });
    console.log('Updated entry:', updatedEntry);
  }

  // Example: Count total entries
  const totalEntries = await dbService.entryRepository.count();
  console.log('Total entries:', totalEntries);

  // Clean up
  await dbService.close();
};

// Note: This is just an example. In a real app, you would call these methods
// from your React components or other parts of your application.