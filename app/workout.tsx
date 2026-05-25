import { useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { Button } from '@/components/ui/Button';
import { StrengthFinisher } from '@/components/workout/StrengthFinisher';
import { WorkoutTimer } from '@/components/workout/WorkoutTimer';
import { calculateCalories } from '@/lib/calories';
import { colors, spacing } from '@/lib/theme';
import { WorkoutHistory, WorkoutRunSummary } from '@/lib/types';
import { useAppStore } from '@/store/AppStoreProvider';

type WorkoutPhase = 'rope' | 'strength' | 'saving';

export default function WorkoutScreen() {
  const { config, settings, addHistory } = useAppStore();
  const [phase, setPhase] = useState<WorkoutPhase>('rope');
  const [ropeSummary, setRopeSummary] = useState<WorkoutRunSummary | null>(null);

  const saveWorkout = async (summary: WorkoutRunSummary, strengthCompleted: boolean) => {
    setPhase('saving');
    const strengthSeconds = strengthCompleted ? config.strengthDuration * 60 : 0;
    const entry: WorkoutHistory = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      config,
      completedBlocks: summary.completedBlocks,
      completedRounds: summary.completedRounds,
      activeJumpSeconds: summary.activeJumpSeconds,
      totalSeconds: summary.totalSeconds + strengthSeconds,
      caloriesEstimate: calculateCalories(settings.weight, summary.activeJumpSeconds, config.level, settings.weightUnit, strengthSeconds),
      strengthCompleted,
    };
    await addHistory(entry);
    router.replace('/history');
  };

  const handleJumpComplete = (summary: WorkoutRunSummary) => {
    setRopeSummary(summary);
    if (config.strengthFinisherEnabled) {
      setPhase('strength');
    } else {
      saveWorkout(summary, false);
    }
  };

  if (phase === 'saving') {
    return (
      <AppScreen scroll={false} contentStyle={styles.centered}>
        <Text style={styles.savingTitle}>Guardando sesión</Text>
        <Text style={styles.savingText}>Buen trabajo. Dejando el historial listo.</Text>
      </AppScreen>
    );
  }

  if (phase === 'strength' && ropeSummary) {
    return (
      <AppScreen scroll contentStyle={styles.content}>
        <StrengthFinisher
          config={config}
          settings={settings}
          onComplete={() => saveWorkout(ropeSummary, true)}
          onSkip={() => saveWorkout(ropeSummary, false)}
        />
      </AppScreen>
    );
  }

  return (
    <AppScreen scroll={false} contentStyle={styles.timerContent}>
      <WorkoutTimer config={config} settings={settings} onJumpComplete={handleJumpComplete} onEndWorkout={(summary) => saveWorkout(summary, false)} />
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  timerContent: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  savingTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  savingText: {
    color: colors.muted,
    fontSize: 15,
  },
});
