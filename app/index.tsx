import { ReactNode, useMemo } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { AppScreen } from '@/components/ui/AppScreen';
import { Button } from '@/components/ui/Button';
import { colors, radii, spacing } from '@/lib/theme';
import { calculateActiveJumpTime, calculateRestTime, calculateWorkoutDuration } from '@/lib/workout';
import { formatDuration } from '@/lib/format';
import { useAppStore } from '@/store/AppStoreProvider';
import { getProgressionRecommendation } from '@/lib/progression';
import { buildRpgProfile } from '@/lib/gamification';

export default function HomeScreen() {
  const { config, history, isReady } = useAppStore();
  const activeJumpTime = calculateActiveJumpTime(config);
  const restTime = calculateRestTime(config);
  const totalTime = calculateWorkoutDuration(config);
  const recommendation = getProgressionRecommendation(history, config);
  const rpgProfile = useMemo(() => buildRpgProfile(history, config), [config, history]);
  const presetTitle = `${Math.round(activeJumpTime / 60)} min Jump Rope`;
  const presetDescription = `${config.blocks} bloques · ${config.roundsPerBlock} rondas por bloque · ${config.jumpSeconds}s salto / ${config.shortRestSeconds}s descanso`;
  const xpPercent = asPercent(rpgProfile.levelProgress * 100);

  const startWorkout = () => {
    if (!isReady) {
      return;
    }
    router.push('/workout');
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.brandCluster}>
          <View style={styles.brandMark}>
            <Feather name="activity" size={22} color={colors.black} />
          </View>
          <View>
            <Text style={styles.brand}>RopeFit Timer</Text>
            <Text style={styles.brandSub}>HIIT jump rope + fuerza final</Text>
          </View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil RPG" onPress={() => router.push('/profile')} style={styles.levelBadge}>
          <Text style={styles.levelBadgeMeta}>LV</Text>
          <Text style={styles.levelBadgeValue}>{rpgProfile.level}</Text>
        </Pressable>
      </View>

      <View style={styles.sessionPanel}>
        <View style={styles.sessionHeader}>
          <View style={styles.sessionCopy}>
            <Text style={styles.sessionLabel}>Siguiente sesión</Text>
            <Text style={styles.presetTitle}>{presetTitle}</Text>
          </View>
          <View style={styles.sessionIcon}>
            <Feather name="zap" size={24} color={colors.black} />
          </View>
        </View>

        <Text style={styles.presetDescription}>{presetDescription}</Text>

        <View style={styles.statRail}>
          <StatCell label="Total" value={formatDuration(totalTime)} accent={colors.amber} />
          <StatCell label="Saltando" value={formatDuration(activeJumpTime)} accent={colors.lime} />
          <StatCell label="Descanso" value={formatDuration(restTime)} accent={colors.cyan} />
        </View>

        <View style={styles.xpPanel}>
          <View style={styles.xpTop}>
            <Text style={styles.xpTitle}>{rpgProfile.rank}</Text>
            <Text style={styles.xpValue}>{rpgProfile.currentLevelXp}/{rpgProfile.nextLevelXp} XP</Text>
          </View>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: xpPercent }]} />
          </View>
        </View>
      </View>

      <Button title={isReady ? 'Start Workout' : 'Cargando'} onPress={startWorkout} disabled={!isReady} icon={<Feather name="play" size={20} color={colors.black} />} />

      <View style={styles.coachPanel}>
        <View style={styles.coachHeader}>
          <Text style={styles.coachTitle}>{recommendation.title}</Text>
          <Text style={styles.coachMeta}>{config.progressionEnabled ? 'Progresión sugerida' : 'Manual'}</Text>
        </View>
        <Text style={styles.coachText}>{recommendation.reason}</Text>
        <View style={styles.coachStats}>
          <Text style={styles.coachStat}>Próximo: {recommendation.nextConfig.blocks} bloques</Text>
          <Text style={styles.coachStat}>{formatDuration(recommendation.weeklyJumpSeconds)} esta semana</Text>
        </View>
      </View>

      <View style={styles.actionGrid}>
        <ActionTile title="Customize" detail="Bloques y descansos" accent={colors.lime} icon={<Feather name="sliders" size={20} color={colors.lime} />} onPress={() => router.push('/customize')} />
        <ActionTile title="Perfil RPG" detail={`${rpgProfile.totalXp} XP total`} accent={colors.amber} icon={<Feather name="shield" size={20} color={colors.amber} />} onPress={() => router.push('/profile')} />
        <ActionTile title="Spotify Music" detail="BPM para saltar" accent={colors.spotify} icon={<Feather name="music" size={20} color={colors.spotify} />} onPress={() => router.push('/spotify')} />
        <ActionTile title="Dashboard" detail="Carga y racha" accent={colors.cyan} icon={<Feather name="trending-up" size={20} color={colors.cyan} />} onPress={() => router.push('/dashboard')} />
        <ActionTile title="History" detail={`${history.length} sesiones`} accent={colors.coral} icon={<Feather name="bar-chart-2" size={20} color={colors.coral} />} onPress={() => router.push('/history')} />
        <ActionTile title="Settings" detail="Audio y perfil" accent={colors.muted} icon={<Feather name="settings" size={20} color={colors.muted} />} onPress={() => router.push('/settings')} />
      </View>
    </AppScreen>
  );
}

function StatCell({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={styles.statCell}>
      <View style={[styles.statDot, { backgroundColor: accent }]} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActionTile({ title, detail, accent, icon, onPress }: { title: string; detail: string; accent: string; icon: ReactNode; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} onPress={onPress} style={({ pressed }) => [styles.actionTile, pressed ? styles.pressed : null]}>
      <View style={[styles.actionIcon, { borderColor: accent }]}>{icon}</View>
      <View style={styles.actionCopy}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionDetail}>{detail}</Text>
      </View>
      <Feather name="chevron-right" size={18} color={colors.subtle} />
    </Pressable>
  );
}

function asPercent(value: number): `${number}%` {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.md,
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  brandCluster: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
    minWidth: 0,
  },
  brandMark: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    color: colors.text,
    fontSize: 23,
    fontWeight: '900',
  },
  brandSub: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  levelBadge: {
    minWidth: 58,
    minHeight: 52,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.lime,
    backgroundColor: colors.limeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadgeMeta: {
    color: colors.lime,
    fontSize: 10,
    fontWeight: '900',
  },
  levelBadgeValue: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '900',
  },
  sessionPanel: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  sessionCopy: {
    flex: 1,
    minWidth: 0,
  },
  sessionLabel: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  sessionIcon: {
    width: 46,
    height: 46,
    borderRadius: radii.sm,
    backgroundColor: colors.amber,
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetTitle: {
    color: colors.text,
    fontSize: 38,
    fontWeight: '900',
    lineHeight: 42,
  },
  presetDescription: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
  },
  statRail: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  statCell: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  statDot: {
    width: 24,
    height: 3,
    borderRadius: radii.pill,
    marginBottom: spacing.xs,
  },
  statValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  statLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '800',
  },
  xpPanel: {
    gap: spacing.sm,
  },
  xpTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  xpTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
    flex: 1,
  },
  xpValue: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '900',
  },
  xpTrack: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.lime,
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  actionTile: {
    flexGrow: 1,
    width: '48%',
    minWidth: 155,
    minHeight: 82,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundSoft,
  },
  actionCopy: {
    flex: 1,
    minWidth: 0,
  },
  actionTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  actionDetail: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
