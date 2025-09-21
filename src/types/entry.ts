export enum MoodType {
  HAPPY = 'happy',
  GOOD = 'good',
  NORMAL = 'normal',
  SAD = 'sad',
  ANGRY = 'angry'
}

export enum WeatherType {
  SUNNY = 'sunny',
  CLOUDY = 'cloudy',
  RAINY = 'rainy',
  SNOWY = 'snowy'
}

export interface Entry {
  id: string;
  date: string; // YYYY-MM-DD形式
  photo?: string; // ローカルファイルパス
  mood: MoodType;
  weather: WeatherType;
  goodThing?: string; // null許容
  badThing?: string; // null許容
  memo: string; // 必須（空文字列可）
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEntryInput {
  date: string;
  photo?: string;
  mood: MoodType;
  weather: WeatherType;
  goodThing?: string;
  badThing?: string;
  memo: string;
}

export interface UpdateEntryInput extends Partial<CreateEntryInput> {
  id: string;
}