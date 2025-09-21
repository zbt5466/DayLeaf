import { Database } from './database';
import { Entry, CreateEntryInput, UpdateEntryInput, MoodType, WeatherType } from '../types';
import { handleDatabaseError } from '../utils/databaseErrors';

export class EntryRepository {
  private database: Database;

  constructor() {
    this.database = Database.getInstance();
  }

  public async create(input: CreateEntryInput): Promise<Entry> {
    const db = this.database.getDatabase();
    const id = this.generateId();
    const now = new Date();

    try {
      await db.runAsync(
        `INSERT INTO entries (id, date, photo, mood, weather, good_thing, bad_thing, memo, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          input.date,
          input.photo || null,
          input.mood,
          input.weather,
          input.goodThing || null,
          input.badThing || null,
          input.memo,
          now.toISOString(),
          now.toISOString()
        ]
      );

      const entry = await this.findById(id);
      if (!entry) {
        throw new Error('Failed to create entry');
      }
      return entry;
    } catch (error) {
      return handleDatabaseError(error, '日記の作成');
    }
  }

  public async findById(id: string): Promise<Entry | null> {
    const db = this.database.getDatabase();

    try {
      const result = await db.getFirstAsync<any>(
        'SELECT * FROM entries WHERE id = ?',
        [id]
      );

      return result ? this.mapRowToEntry(result) : null;
    } catch (error) {
      console.error('Error finding entry by id:', error);
      throw new Error('日記の取得に失敗しました');
    }
  }

  public async findByDate(date: string): Promise<Entry | null> {
    const db = this.database.getDatabase();

    try {
      const result = await db.getFirstAsync<any>(
        'SELECT * FROM entries WHERE date = ?',
        [date]
      );

      return result ? this.mapRowToEntry(result) : null;
    } catch (error) {
      console.error('Error finding entry by date:', error);
      throw new Error('日記の取得に失敗しました');
    }
  }

  public async findAll(limit?: number, offset?: number): Promise<Entry[]> {
    const db = this.database.getDatabase();

    try {
      let query = 'SELECT * FROM entries ORDER BY date DESC';
      const params: any[] = [];

      if (limit) {
        query += ' LIMIT ?';
        params.push(limit);
        
        if (offset) {
          query += ' OFFSET ?';
          params.push(offset);
        }
      }

      const results = await db.getAllAsync<any>(query, params);
      return results.map(row => this.mapRowToEntry(row));
    } catch (error) {
      console.error('Error finding all entries:', error);
      throw new Error('日記一覧の取得に失敗しました');
    }
  }

  public async findByDateRange(startDate: string, endDate: string): Promise<Entry[]> {
    const db = this.database.getDatabase();

    try {
      const results = await db.getAllAsync<any>(
        'SELECT * FROM entries WHERE date BETWEEN ? AND ? ORDER BY date DESC',
        [startDate, endDate]
      );

      return results.map(row => this.mapRowToEntry(row));
    } catch (error) {
      console.error('Error finding entries by date range:', error);
      throw new Error('日記の取得に失敗しました');
    }
  }

  public async update(input: UpdateEntryInput): Promise<Entry> {
    const db = this.database.getDatabase();
    const now = new Date();

    try {
      const updateFields: string[] = [];
      const params: any[] = [];

      if (input.photo !== undefined) {
        updateFields.push('photo = ?');
        params.push(input.photo);
      }
      if (input.mood !== undefined) {
        updateFields.push('mood = ?');
        params.push(input.mood);
      }
      if (input.weather !== undefined) {
        updateFields.push('weather = ?');
        params.push(input.weather);
      }
      if (input.goodThing !== undefined) {
        updateFields.push('good_thing = ?');
        params.push(input.goodThing);
      }
      if (input.badThing !== undefined) {
        updateFields.push('bad_thing = ?');
        params.push(input.badThing);
      }
      if (input.memo !== undefined) {
        updateFields.push('memo = ?');
        params.push(input.memo);
      }

      updateFields.push('updated_at = ?');
      params.push(now.toISOString());
      params.push(input.id);

      await db.runAsync(
        `UPDATE entries SET ${updateFields.join(', ')} WHERE id = ?`,
        params
      );

      const entry = await this.findById(input.id);
      if (!entry) {
        throw new Error('Entry not found after update');
      }
      return entry;
    } catch (error) {
      console.error('Error updating entry:', error);
      throw new Error('日記の更新に失敗しました');
    }
  }

  public async delete(id: string): Promise<void> {
    const db = this.database.getDatabase();

    try {
      const result = await db.runAsync('DELETE FROM entries WHERE id = ?', [id]);
      
      if (result.changes === 0) {
        throw new Error('Entry not found');
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw new Error('日記の削除に失敗しました');
    }
  }

  public async count(): Promise<number> {
    const db = this.database.getDatabase();

    try {
      const result = await db.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) as count FROM entries'
      );
      return result?.count || 0;
    } catch (error) {
      console.error('Error counting entries:', error);
      throw new Error('日記数の取得に失敗しました');
    }
  }

  private mapRowToEntry(row: any): Entry {
    return {
      id: row.id,
      date: row.date,
      photo: row.photo,
      mood: row.mood as MoodType,
      weather: row.weather as WeatherType,
      goodThing: row.good_thing,
      badThing: row.bad_thing,
      memo: row.memo,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private generateId(): string {
    return `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}