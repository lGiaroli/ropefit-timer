import { StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { MetricCard } from '@/components/ui/MetricCard';
import { colors, radii, spacing } from '@/lib/theme';
import { ProgressionRecommendation, WorkoutConfig, WorkoutHistory } from '@/lib/types';
import { formatDuration } from '@/lib/format';
import { calculateCompletionRate, calculateStreakDays, calculateWeeklyJumpSeconds, getProgressionRecommendation } from '@/lib/progression';

interface ProgressDashboardProps {
  history: WorkoutHistory[];
  config: WorkoutConfig;
  onApplyRecommendation?: (config: WorkoutConfig) => void;
}

export function ProgressDashboard({ history, config, onApplyRecommendation }: ProgressDashboardProps) {
  const weeklyJumpSeconds = calculateWeeklyJumpSeconds(history);
  const totalJumpSeconds = history.reduce((sum, entry) => sum + entry.activeJumpSeconds, 0);
  const completionRate = calculateCompletionRate(history);
  const streakDays = calculateStreakDays(history);
  const strengthRate = history.length === 0 ? 0 : history.filter((entry) => entry.strengthCompleted).length / history.length;
  const recommendation = getProgressionRecommendation(history, config);
  const lastSeven = history.slice(0, 7).reverse();

  return (
    <View style={styles.root}>
      <View style={styles.grid}>
        <MetricCard label="Racha actual" value={`${streakDays} días`} accent={colors.lime} />
        <MetricCard label="Saltando esta semana" value={formatDuration(weeklyJumpSeconds)} accent={colors.cyan} />
      </View>
      <View style={styles.grid}>
        <MetricCard label="Total saltado" value={formatDuration(totalJumpSeconds)} accent={colors.amber} />
        <MetricCard label="Finalizadores" value={`${Math.round(strengthRate * 100)}%`} accent={colors.coral} />
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Próxima progresión</Text>
          <Text style={styles.panelMeta}>{Math.round(completionRate * 100)}% completado</Text>
        </View>
        <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
        <Text style={styles.recommendationReason}>{recommendation.reason}</Text>
        <ProgressionDelta recommendation={recommendation} />
        {onApplyRecommendation ? <Button title="Aplicar próxima carga" onPress={() => onApplyRecommendation(recommendation.nextConfig)} variant="secondary" /> : null}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Últimas sesiones</Text>
        {lastSeven.length === 0 ? (
          <Text style={styles.empty}>Cuando entrenes, este gráfico muestra minutos reales saltando por sesión.</Text>
        ) : (
          <View style={styles.barRow}>
            {lastSeven.map((entry) => {
              const minutes = Math.max(1, Math.round(entry.activeJumpSeconds / 60));
              const planned = entry.config.blocks * entry.config.roundsPerBlock * entry.config.jumpSeconds;
              const ratio = planned > 0 ? Math.min(1, entry.activeJumpSeconds / planned) : 0;
              return (
                <View key={entry.id} style={styles.barItem}>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { height: `${Math.max(12, ratio * 100)}%` }]} />
                  </View>
                  <Text style={styles.barLabel}>{minutes}m</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

function ProgressionDelta({ recommendation }: { recommendation: ProgressionRecommendation }) {
  const { nextConfig } = recommendation;
  return (
    <View style={styles.deltaRow}>
      <Text style={styles.delta}>Bloques {nextConfig.blocks}</Text>
      <Text style={styles.delta}>{nextConfig.jumpSeconds}s salto</Text>
      <Text style={styles.delta}>{nextConfig.shortRestSeconds}s descanso</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  panel: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  panelTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  panelMeta: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: '900',
  },
  recommendationTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  recommendationReason: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  deltaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  delta: {
    color: colors.text,
    backgroundColor: colors.surfaceRaised,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '900',
  },
  empty: {
    color: colors.muted,
    lineHeight: 20,
  },
  barRow: {
    height: 140,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  barTrack: {
    width: '100%',
    height: 110,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceRaised,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.lime,
  },
  barLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
});
