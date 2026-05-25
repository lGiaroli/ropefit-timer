import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, WorkoutConfig, WorkoutHistory } from './types';
import { DEFAULT_WORKOUT_CONFIG } from './workout';

const CONFIG_KEY = 'ropefit.config';
const SETTINGS_KEY = 'ropefit.settings';
const HISTORY_KEY = 'ropefit.history';

export const DEFAULT_SETTINGS: AppSettings = {
  weight: 75,
  weightUnit: 'kg',
  voiceEnabled: true,
  voiceType: 'coach',
  coachTipsEnabled: true,
  pipsEnabled: true,
  pipVolume: 0.85,
  hapticsEnabled: true,
  finalCountdownEnabled: true,
  theme: 'dark',
  spotifyConnected: false,
};

async function readJson<T>(key: string, fallback: T): Promise<T> {
  const value = await AsyncStorage.getItem(key);
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function writeJson<T>(key: string, value: T) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export function loadWorkoutConfig() {
  return readJson<Partial<WorkoutConfig>>(CONFIG_KEY, DEFAULT_WORKOUT_CONFIG).then((storedConfig) => ({
    ...DEFAULT_WORKOUT_CONFIG,
    ...storedConfig,
  }));
}

export function saveWorkoutConfig(config: WorkoutConfig) {
  return writeJson(CONFIG_KEY, config);
}

export function loadSettings() {
  return readJson<Partial<AppSettings>>(SETTINGS_KEY, DEFAULT_SETTINGS).then((storedSettings) => ({
    ...DEFAULT_SETTINGS,
    ...storedSettings,
  }));
}

export function saveSettings(settings: AppSettings) {
  return writeJson(SETTINGS_KEY, settings);
}

export function loadHistory() {
  return readJson<WorkoutHistory[]>(HISTORY_KEY, []);
}

export function saveHistory(history: WorkoutHistory[]) {
  return writeJson(HISTORY_KEY, history);
}
