import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { MetricCard } from '@/components/ui/MetricCard';
import { buildRpgProfile, Mission, PlayerAttribute } from '@/lib/gamification';
import { formatDuration } from '@/lib/format';
import { colors, radii, spacing } from '@/lib/theme';
import { WorkoutConfig, WorkoutHistory } from '@/lib/types';

interface RpgProfileProps {
  history: WorkoutHistory[];
  config: WorkoutConfig;
}

export function RpgProfile({ history, config }: RpgProfileProps) {
  const profile = useMemo(() => buildRpgProfile(history, config), [config, history]);
  const unlockedBadges = profile.badges.filter((badge) => badge.unlocked).length;
  const levelPercent = asPercent(profile.levelProgress * 100);

  return (
    <View style={styles.root}>
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.avatarFrame}>
            <Feather name="shield" size={34} color={colors.black} />
          </View>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Perfil RPG</Text>
            <Text style={styles.rank}>{profile.rank}</Text>
            <Text style={styles.className}>{profile.className}</Text>
          </View>
          <View style={styles.levelPlate}>
            <Text style={styles.levelLabel}>LV</Text>
            <Text style={styles.levelValue}>{profile.level}</Text>
          </View>
        </View>

        <View style={styles.xpBlock}>
          <View style={styles.xpHeader}>
            <Text style={styles.xpText}>
              {profile.currentLevelXp} / {profile.nextLevelXp} XP
            </Text>
            <Text style={styles.xpMeta}>Total {profile.totalXp} XP</Text>
          </View>
          <View style={styles.xpTrack}>
            <View style={[styles.xpFill, { width: levelPercent }]} />
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        <MetricCard label="XP esta semana" value={`+${profile.weeklyXp}`} accent={colors.lime} />
        <MetricCard label="Racha" value={`${profile.streakDays} días`} accent={colors.amber} />
      </View>
      <View style={styles.grid}>
        <MetricCard label="Saltado total" value={formatDuration(profile.totalJumpSeconds)} accent={colors.cyan} />
        <MetricCard label="Títulos" value={`${unlockedBadges}/${profile.badges.length}`} accent={colors.coral} />
      </View>

      {profile.lastWorkoutXp ? (
        <View style={styles.rewardPanel}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Última recompensa</Text>
            <Text style={styles.panelMeta}>+{profile.lastWorkoutXp.total} XP</Text>
          </View>
          <View style={styles.rewardRow}>
            <RewardPill label="Salto" value={profile.lastWorkoutXp.jumpXp} />
            <RewardPill label="Bloques" value={profile.lastWorkoutXp.blockXp} />
            <RewardPill label="Bonus" value={profile.lastWorkoutXp.completionXp} />
            <RewardPill label="Fuerza" value={profile.lastWorkoutXp.strengthXp} />
          </View>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Atributos</Text>
          <Text style={styles.panelMeta}>Build atlética</Text>
        </View>
        {profile.attributes.map((attribute) => (
          <AttributeBar key={attribute.id} attribute={attribute} />
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Misiones activas</Text>
          <Text style={styles.panelMeta}>{profile.missions.filter((mission) => mission.current >= mission.target).length}/{profile.missions.length}</Text>
        </View>
        {profile.missions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </View>

      <View style={styles.section}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Títulos desbloqueables</Text>
          <Text style={styles.panelMeta}>{unlockedBadges} activos</Text>
        </View>
        <View style={styles.badgeGrid}>
          {profile.badges.map((badge) => (
            <View key={badge.id} style={[styles.badge, badge.unlocked ? styles.badgeUnlocked : styles.badgeLocked]}>
              <Feather name={badge.unlocked ? 'award' : 'lock'} size={18} color={badge.unlocked ? colors.amber : colors.subtle} />
              <Text style={[styles.badgeTitle, !badge.unlocked ? styles.lockedText : null]}>{badge.title}</Text>
              <Text style={styles.badgeDetail}>{badge.detail}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function AttributeBar({ attribute }: { attribute: PlayerAttribute }) {
  return (
    <View style={styles.attribute}>
      <View style={styles.attributeHeader}>
        <Text style={styles.attributeLabel}>{attribute.label}</Text>
        <Text style={styles.attributeValue}>{attribute.value}/100</Text>
      </View>
      <View style={styles.attributeTrack}>
        <View style={[styles.attributeFill, { width: asPercent(attribute.value) }]} />
      </View>
      <Text style={styles.attributeDetail}>{attribute.detail}</Text>
    </View>
  );
}

function MissionCard({ mission }: { mission: Mission }) {
  const completed = mission.current >= mission.target;
  const progress = Math.min(1, mission.current / mission.target);

  return (
    <View style={[styles.mission, completed ? styles.missionDone : null]}>
      <View style={[styles.missionIcon, { backgroundColor: mission.accent }]}>
        <Feather name={completed ? 'check' : getMissionIcon(mission.id)} size={18} color={colors.black} />
      </View>
      <View style={styles.missionBody}>
        <View style={styles.missionHeader}>
          <Text style={styles.missionTitle}>{mission.title}</Text>
          <Text style={styles.missionXp}>+{mission.xpReward} XP</Text>
        </View>
        <Text style={styles.missionDetail}>{mission.detail}</Text>
        <View style={styles.missionTrack}>
          <View style={[styles.missionFill, { width: asPercent(progress * 100), backgroundColor: mission.accent }]} />
        </View>
        <Text style={styles.missionProgress}>
          {Math.min(mission.current, mission.target)} / {mission.target} {mission.unit}
        </Text>
      </View>
    </View>
  );
}

function RewardPill({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.rewardPill}>
      <Text style={styles.rewardValue}>+{value}</Text>
      <Text style={styles.rewardLabel}>{label}</Text>
    </View>
  );
}

function getMissionIcon(id: string): keyof typeof Feather.glyphMap {
  switch (id) {
    case 'weekly-volume':
      return 'trending-up';
    case 'strength-guild':
      return 'zap';
    case 'boss-block':
      return 'target';
    case 'streak-chain':
      return 'link';
    default:
      return 'flag';
  }
}

function asPercent(value: number): `${number}%` {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  hero: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarFrame: {
    width: 68,
    height: 68,
    borderRadius: radii.sm,
    backgroundColor: colors.lime,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    minWidth: 0,
  },
  eyebrow: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  rank: {
    color: colors.text,
    fontSize: 25,
    lineHeight: 30,
    fontWeight: '900',
  },
  className: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  levelPlate: {
    width: 58,
    minHeight: 68,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.lime,
    backgroundColor: colors.limeSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelLabel: {
    color: colors.lime,
    fontSize: 11,
    fontWeight: '900',
  },
  levelValue: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '900',
  },
  xpBlock: {
    gap: spacing.sm,
  },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  xpText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  xpMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  xpTrack: {
    height: 13,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.lime,
  },
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  rewardPanel: {
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
    flex: 1,
  },
  panelMeta: {
    color: colors.lime,
    fontSize: 12,
    fontWeight: '900',
  },
  rewardRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  rewardPill: {
    flexGrow: 1,
    minWidth: 96,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    padding: spacing.sm,
    gap: 2,
  },
  rewardValue: {
    color: colors.amber,
    fontSize: 18,
    fontWeight: '900',
  },
  rewardLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '800',
  },
  section: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  attribute: {
    gap: spacing.xs,
  },
  attributeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  attributeLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  attributeValue: {
    color: colors.cyan,
    fontSize: 12,
    fontWeight: '900',
  },
  attributeTrack: {
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceRaised,
    overflow: 'hidden',
  },
  attributeFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.cyan,
  },
  attributeDetail: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  mission: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    padding: spacing.md,
  },
  missionDone: {
    borderColor: colors.lime,
  },
  missionIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missionBody: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  missionTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    flex: 1,
  },
  missionXp: {
    color: colors.amber,
    fontSize: 12,
    fontWeight: '900',
  },
  missionDetail: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  missionTrack: {
    height: 7,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  missionFill: {
    height: '100%',
    borderRadius: radii.pill,
  },
  missionProgress: {
    color: colors.subtle,
    fontSize: 11,
    fontWeight: '800',
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  badge: {
    width: '48%',
    minWidth: 132,
    flexGrow: 1,
    borderRadius: radii.sm,
    borderWidth: 1,
    padding: spacing.sm,
    gap: spacing.xs,
  },
  badgeUnlocked: {
    borderColor: colors.amber,
    backgroundColor: '#28200d',
  },
  badgeLocked: {
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
  },
  badgeTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  badgeDetail: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
  },
  lockedText: {
    color: colors.subtle,
  },
});
