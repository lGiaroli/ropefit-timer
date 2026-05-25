import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { AppSettings, WorkoutConfig, WorkoutHistory } from '@/lib/types';
import { DEFAULT_SETTINGS, loadHistory, loadSettings, loadWorkoutConfig, saveHistory, saveSettings, saveWorkoutConfig } from '@/lib/storage';
import { DEFAULT_WORKOUT_CONFIG } from '@/lib/workout';

interface AppStoreValue {
  config: WorkoutConfig;
  settings: AppSettings;
  history: WorkoutHistory[];
  isReady: boolean;
  updateConfig: (config: WorkoutConfig) => Promise<void>;
  updateSettings: (settings: AppSettings) => Promise<void>;
  addHistory: (entry: WorkoutHistory) => Promise<void>;
  clearHistory: () => Promise<void>;
}

const AppStoreContext = createContext<AppStoreValue | null>(null);

export function AppStoreProvider({ children }: PropsWithChildren) {
  const [config, setConfig] = useState<WorkoutConfig>(DEFAULT_WORKOUT_CONFIG);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [history, setHistory] = useState<WorkoutHistory[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Promise.all([loadWorkoutConfig(), loadSettings(), loadHistory()])
      .then(([storedConfig, storedSettings, storedHistory]) => {
        if (!isMounted) {
          return;
        }
        setConfig(storedConfig);
        setSettings(storedSettings);
        setHistory(storedHistory);
      })
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const value = useMemo<AppStoreValue>(
    () => ({
      config,
      settings,
      history,
      isReady,
      updateConfig: async (nextConfig) => {
        setConfig(nextConfig);
        await saveWorkoutConfig(nextConfig);
      },
      updateSettings: async (nextSettings) => {
        setSettings(nextSettings);
        await saveSettings(nextSettings);
      },
      addHistory: async (entry) => {
        const nextHistory = [entry, ...history].slice(0, 100);
        setHistory(nextHistory);
        await saveHistory(nextHistory);
      },
      clearHistory: async () => {
        setHistory([]);
        await saveHistory([]);
      },
    }),
    [config, history, isReady, settings],
  );

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>;
}

export function useAppStore() {
  const value = useContext(AppStoreContext);
  if (!value) {
    throw new Error('useAppStore must be used inside AppStoreProvider');
  }
  return value;
}
