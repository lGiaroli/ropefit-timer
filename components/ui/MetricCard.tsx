import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing } from '@/lib/theme';

interface MetricCardProps {
  label: string;
  value: string;
  accent?: string;
}

export function MetricCard({ label, value, accent = colors.lime }: MetricCardProps) {
  return (
    <View style={styles.card}>
      <View style={[styles.accent, { backgroundColor: accent }]} />
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 0,
    backgroundColor: colors.surface,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  accent: {
    width: 28,
    height: 3,
    borderRadius: radii.pill,
    marginBottom: spacing.xs,
  },
  value: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 16,
  },
});
