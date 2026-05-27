import { WorkoutConfig, WorkoutHistory } from './types';
import { calculateCompletionRate, calculateStreakDays, calculateWeeklyJumpSeconds } from './progression';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

export interface XpBreakdown {
  jumpXp: number;
  blockXp: number;
  completionXp: number;
  strengthXp: number;
  total: number;
}

export interface PlayerAttribute {
  id: string;
  label: string;
  value: number;
  detail: string;
}

export interface Mission {
  id: string;
  title: string;
  detail: string;
  current: number;
  target: number;
  unit: string;
  xpReward: number;
  accent: string;
}

export interface Badge {
  id: string;
  title: string;
  detail: string;
  unlocked: boolean;
}

export interface RpgProfileProgress {
  level: number;
  rank: string;
  className: string;
  totalXp: number;
  currentLevelXp: number;
  nextLevelXp: number;
  levelProgress: number;
  weeklyXp: number;
  streakDays: number;
  totalSessions: number;
  totalJumpSeconds: number;
  weeklyJumpSeconds: number;
  attributes: PlayerAttribute[];
  missions: Mission[];
  badges: Badge[];
  lastWorkoutXp?: XpBreakdown;
}

export function calculateWorkoutXp(entry: WorkoutHistory): XpBreakdown {
  const plannedRounds = entry.config.blocks * entry.config.roundsPerBlock;
  const completionRatio = plannedRounds > 0 ? Math.min(1, entry.completedRounds / plannedRounds) : 0;
  const jumpXp = Math.round((entry.activeJumpSeconds / 60) * 12);
  const blockXp = entry.completedBlocks * 24;
  const completionXp = completionRatio >= 0.95 ? 120 : Math.round(completionRatio * 70);
  const strengthXp = entry.strengthCompleted ? 140 : 0;

  return {
    jumpXp,
    blockXp,
    completionXp,
    strengthXp,
    total: jumpXp + blockXp + completionXp + strengthXp,
  };
}

export function buildRpgProfile(history: WorkoutHistory[], config: WorkoutConfig): RpgProfileProgress {
  const totalXp = history.reduce((sum, entry) => sum + calculateWorkoutXp(entry).total, 0);
  const weeklyEntries = getEntriesInLastWeek(history);
  const weeklyXp = weeklyEntries.reduce((sum, entry) => sum + calculateWorkoutXp(entry).total, 0);
  const totalJumpSeconds = history.reduce((sum, entry) => sum + entry.activeJumpSeconds, 0);
  const weeklyJumpSeconds = calculateWeeklyJumpSeconds(history);
  const streakDays = calculateStreakDays(history);
  const completionRate = calculateCompletionRate(history);
  const strengthSessions = history.filter((entry) => entry.strengthCompleted).length;
  const levelState = calculateLevelState(totalXp);
  const fullCurrentConfigSessions = weeklyEntries.filter((entry) => entry.completedBlocks >= config.blocks).length;

  return {
    ...levelState,
    rank: getRank(levelState.level),
    className: getClassName(streakDays, weeklyJumpSeconds, strengthSessions, history.length),
    totalXp,
    weeklyXp,
    streakDays,
    totalSessions: history.length,
    totalJumpSeconds,
    weeklyJumpSeconds,
    attributes: buildAttributes(totalJumpSeconds, weeklyJumpSeconds, streakDays, completionRate, strengthSessions),
    missions: buildMissions(history, config, weeklyJumpSeconds, streakDays, weeklyEntries, fullCurrentConfigSessions),
    badges: buildBadges(history, totalJumpSeconds, streakDays, strengthSessions),
    lastWorkoutXp: history[0] ? calculateWorkoutXp(history[0]) : undefined,
  };
}

function calculateLevelState(totalXp: number) {
  let level = 1;
  let remainingXp = totalXp;
  let nextLevelXp = getLevelRequirement(level);

  while (remainingXp >= nextLevelXp) {
    remainingXp -= nextLevelXp;
    level += 1;
    nextLevelXp = getLevelRequirement(level);
  }

  return {
    level,
    currentLevelXp: remainingXp,
    nextLevelXp,
    levelProgress: nextLevelXp > 0 ? remainingXp / nextLevelXp : 1,
  };
}

function getLevelRequirement(level: number) {
  return 450 + level * 150;
}

function getRank(level: number) {
  if (level >= 22) {
    return 'Leyenda RopeFit';
  }
  if (level >= 15) {
    return 'Maestro de Ritmo';
  }
  if (level >= 10) {
    return 'Atleta de Acero';
  }
  if (level >= 6) {
    return 'Duelista HIIT';
  }
  if (level >= 3) {
    return 'Saltador de Barrio';
  }
  return 'Aprendiz de Cuerda';
}

function getClassName(streakDays: number, weeklyJumpSeconds: number, strengthSessions: number, totalSessions: number) {
  if (strengthSessions >= 8) {
    return 'Paladín de Fuerza';
  }
  if (weeklyJumpSeconds >= 45 * 60) {
    return 'Ranger de Resistencia';
  }
  if (streakDays >= 4) {
    return 'Monje de Consistencia';
  }
  if (totalSessions >= 6) {
    return 'Explorador HIIT';
  }
  return 'Aspirante RopeFit';
}

function buildAttributes(
  totalJumpSeconds: number,
  weeklyJumpSeconds: number,
  streakDays: number,
  completionRate: number,
  strengthSessions: number,
): PlayerAttribute[] {
  return [
    {
      id: 'stamina',
      label: 'Resistencia',
      value: clamp(Math.round((totalJumpSeconds / 3600) * 18)),
      detail: `${Math.round(totalJumpSeconds / 60)} min totales`,
    },
    {
      id: 'power',
      label: 'Fuerza',
      value: clamp(strengthSessions * 10),
      detail: `${strengthSessions} finalizadores`,
    },
    {
      id: 'focus',
      label: 'Técnica',
      value: clamp(Math.round(completionRate * 100)),
      detail: `${Math.round(completionRate * 100)}% cumplimiento`,
    },
    {
      id: 'tempo',
      label: 'Ritmo',
      value: clamp(Math.round((weeklyJumpSeconds / (90 * 60)) * 100 + streakDays * 6)),
      detail: `${streakDays} días de racha`,
    },
  ];
}

function buildMissions(
  history: WorkoutHistory[],
  config: WorkoutConfig,
  weeklyJumpSeconds: number,
  streakDays: number,
  weeklyEntries: WorkoutHistory[],
  fullCurrentConfigSessions: number,
): Mission[] {
  const todaySessions = history.filter((entry) => new Date(entry.date).toDateString() === new Date().toDateString()).length;
  const strengthThisWeek = weeklyEntries.filter((entry) => entry.strengthCompleted).length;

  return [
    {
      id: 'daily-start',
      title: 'Misión diaria',
      detail: 'Completar una sesión hoy',
      current: todaySessions,
      target: 1,
      unit: 'sesión',
      xpReward: 120,
      accent: '#b8ff38',
    },
    {
      id: 'weekly-volume',
      title: 'Contrato semanal',
      detail: 'Acumular 90 min saltando',
      current: Math.floor(weeklyJumpSeconds / 60),
      target: 90,
      unit: 'min',
      xpReward: 260,
      accent: '#41d9ff',
    },
    {
      id: 'strength-guild',
      title: 'Gremio de fuerza',
      detail: 'Hacer 3 finalizadores esta semana',
      current: strengthThisWeek,
      target: 3,
      unit: 'finalizadores',
      xpReward: 220,
      accent: '#ff6f61',
    },
    {
      id: 'boss-block',
      title: 'Boss de bloque',
      detail: `Completar ${config.blocks} bloques en una sesión`,
      current: fullCurrentConfigSessions,
      target: 1,
      unit: 'victoria',
      xpReward: 300,
      accent: '#ffcf5a',
    },
    {
      id: 'streak-chain',
      title: 'Cadena de racha',
      detail: 'Llegar a 3 días seguidos',
      current: streakDays,
      target: 3,
      unit: 'días',
      xpReward: 180,
      accent: '#9c7cff',
    },
  ];
}

function buildBadges(history: WorkoutHistory[], totalJumpSeconds: number, streakDays: number, strengthSessions: number): Badge[] {
  const maxBlocks = history.reduce((best, entry) => Math.max(best, entry.completedBlocks), 0);
  return [
    {
      id: 'first-session',
      title: 'Primer Portal',
      detail: 'Primera sesión guardada',
      unlocked: history.length >= 1,
    },
    {
      id: 'ten-sessions',
      title: 'Camino del Saltador',
      detail: '10 sesiones completadas',
      unlocked: history.length >= 10,
    },
    {
      id: 'hundred-minutes',
      title: 'Motor Aeróbico',
      detail: '100 min reales saltando',
      unlocked: totalJumpSeconds >= 100 * 60,
    },
    {
      id: 'streak-three',
      title: 'Ritual de 3 Días',
      detail: '3 días de racha',
      unlocked: streakDays >= 3,
    },
    {
      id: 'strength-ten',
      title: 'Armadura Corporal',
      detail: '10 finalizadores hechos',
      unlocked: strengthSessions >= 10,
    },
    {
      id: 'twenty-blocks',
      title: 'Muralla de 20',
      detail: 'Una sesión de 20 bloques',
      unlocked: maxBlocks >= 20,
    },
  ];
}

function getEntriesInLastWeek(history: WorkoutHistory[]) {
  const now = Date.now();
  return history.filter((entry) => now - new Date(entry.date).getTime() <= WEEK_MS);
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}
