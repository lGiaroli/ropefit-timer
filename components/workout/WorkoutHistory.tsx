import { StyleSheet, Text, View } from 'react-native';
import { MetricCard } from '@/components/ui/MetricCard';
import { colors, radii, spacing } from '@/lib/theme';
import { WorkoutHistory as WorkoutHistoryEntry } from '@/lib/types';
import { formatDuration, formatLongDate } from '@/lib/format';

interface WorkoutHistoryProps {
  entries: WorkoutHistoryEntry[];
}

export function WorkoutHistory({ entries }: WorkoutHistoryProps) {
  if (entries.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Todavía no hay entrenamientos</Text>
        <Text style={styles.emptyText}>Cuando completes o cortes una sesión, se guarda acá con tus bloques, minutos y calorías estimadas.</Text>
      </View>
    );
  }

  const weeklyJumpSeconds = entries
    .filter((entry) => Date.now() - new Date(entry.date).getTime() <= 7 * 24 * 60 * 60 * 1000)
    .reduce((sum, entry) => sum + entry.activeJumpSeconds, 0);

  return (
    <View style={styles.root}>
      <View style={styles.summaryRow}>
        <MetricCard label="Racha semanal" value={`${Math.min(entries.length, 7)} sesiones`} accent={colors.lime} />
        <MetricCard label="Min. saltando/semana" value={formatDuration(weeklyJumpSeconds)} accent={colors.cyan} />
      </View>
      {entries.map((entry) => (
        <View key={entry.id} style={styles.entry}>
          <View style={styles.entryHeader}>
            <Text style={styles.date}>{formatLongDate(entry.date)}</Text>
            <Text style={styles.calories}>{entry.caloriesEstimate.label}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detail}>Bloques {entry.completedBlocks}</Text>
            <Text style={styles.detail}>Saltando {formatDuration(entry.activeJumpSeconds)}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detail}>Total {formatDuration(entry.totalSeconds)}</Text>
            <Text style={styles.detail}>{entry.strengthCompleted ? 'Fuerza hecha' : 'Sin fuerza'}</Text>
          </View>
          {entry.spotifyPlaylistId ? <Text style={styles.spotify}>Playlist: {entry.spotifyPlaylistId}</Text> : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  empty: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  emptyText: {
    color: colors.muted,
    lineHeight: 20,
  },
  entry: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  date: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '900',
  },
  calories: {
    color: colors.coral,
    fontSize: 14,
    fontWeight: '900',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  detail: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  spotify: {
    color: colors.spotify,
    fontSize: 12,
    fontWeight: '800',
  },
});
