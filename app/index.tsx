import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { AppScreen } from '@/components/ui/AppScreen';
import { Button } from '@/components/ui/Button';
import { MetricCard } from '@/components/ui/MetricCard';
import { colors, radii, spacing } from '@/lib/theme';
import { calculateActiveJumpTime, calculateRestTime, calculateWorkoutDuration } from '@/lib/workout';
import { formatDuration } from '@/lib/format';
import { useAppStore } from '@/store/AppStoreProvider';
import { getProgressionRecommendation } from '@/lib/progression';

export default function HomeScreen() {
  const { config, history, updateConfig } = useAppStore();
  const activeJumpTime = calculateActiveJumpTime(config);
  const restTime = calculateRestTime(config);
  const totalTime = calculateWorkoutDuration(config);
  const recommendation = getProgressionRecommendation(history, config);

  const startWorkout = async () => {
    if (config.progressionEnabled) {
      await updateConfig(recommendation.nextConfig);
    }
    router.push('/workout');
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.brandMark}>
          <Feather name="activity" size={22} color={colors.black} />
        </View>
        <View>
          <Text style={styles.brand}>RopeFit Timer</Text>
          <Text style={styles.brandSub}>HIIT jump rope + fuerza final</Text>
        </View>
      </View>

      <View style={styles.presetPanel}>
        <Text style={styles.presetTitle}>40 min Jump Rope</Text>
        <Text style={styles.presetDescription}>20 bloques · 6 rondas por bloque · 20s salto / 10s descanso</Text>
        <View style={styles.metricsRow}>
          <MetricCard label="Tiempo total" value={formatDuration(totalTime)} accent={colors.amber} />
          <MetricCard label="Real saltando" value={formatDuration(activeJumpTime)} accent={colors.lime} />
        </View>
        <View style={styles.metricsRow}>
          <MetricCard label="Descanso" value={formatDuration(restTime)} accent={colors.cyan} />
          <MetricCard label="Historial" value={`${history.length} sesiones`} accent={colors.coral} />
        </View>
      </View>

      <View style={styles.coachPanel}>
        <View style={styles.coachHeader}>
          <Text style={styles.coachTitle}>{recommendation.title}</Text>
          <Text style={styles.coachMeta}>{config.progressionEnabled ? 'Progresión auto' : 'Manual'}</Text>
        </View>
        <Text style={styles.coachText}>{recommendation.reason}</Text>
        <View style={styles.coachStats}>
          <Text style={styles.coachStat}>Próximo: {recommendation.nextConfig.blocks} bloques</Text>
          <Text style={styles.coachStat}>{formatDuration(recommendation.weeklyJumpSeconds)} esta semana</Text>
        </View>
      </View>

      <View style={styles.actionStack}>
        <Button title="Start Workout" onPress={startWorkout} icon={<Feather name="play" size={20} color={colors.black} />} />
        <Button title="Customize" variant="secondary" onPress={() => router.push('/customize')} icon={<Feather name="sliders" size={19} color={colors.lime} />} />
        <Button title="Spotify Music" variant="secondary" onPress={() => router.push('/spotify')} icon={<Feather name="music" size={19} color={colors.spotify} />} />
        <Button title="Dashboard" variant="secondary" onPress={() => router.push('/dashboard')} icon={<Feather name="trending-up" size={19} color={colors.amber} />} />
        <Button title="History" variant="secondary" onPress={() => router.push('/history')} icon={<Feather name="bar-chart-2" size={19} color={colors.cyan} />} />
        <Button title="Settings" variant="secondary" onPress={() => router.push('/settings')} icon={<Feather name="settings" size={19} color={colors.muted} />} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '900',
  },
  brandSub: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  presetPanel: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
  },
  presetTitle: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '900',
    lineHeight: 38,
  },
  presetDescription: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionStack: {
    gap: spacing.sm,
  },
  coachPanel: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  coachTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
    flex: 1,
  },
  coachMeta: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: '900',
  },
  coachText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  coachStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  coachStat: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
  },
});
