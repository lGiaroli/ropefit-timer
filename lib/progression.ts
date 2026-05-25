import { ProgressionRecommendation, WorkoutConfig, WorkoutHistory } from './types';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function entriesInLastWeek(history: WorkoutHistory[]) {
  const now = Date.now();
  return history.filter((entry) => now - new Date(entry.date).getTime() <= WEEK_MS);
}

export function calculateWeeklyJumpSeconds(history: WorkoutHistory[]) {
  return entriesInLastWeek(history).reduce((sum, entry) => sum + entry.activeJumpSeconds, 0);
}

export function calculateCompletionRate(history: WorkoutHistory[]) {
  const recent = history.slice(0, 5);
  if (recent.length === 0) {
    return 0;
  }

  const rates = recent.map((entry) => {
    const planned = entry.config.blocks * entry.config.roundsPerBlock;
    return planned > 0 ? Math.min(1, entry.completedRounds / planned) : 0;
  });
  return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
}

export function calculateStreakDays(history: WorkoutHistory[]) {
  const days = new Set(history.map((entry) => new Date(entry.date).toDateString()));
  let streak = 0;
  const cursor = new Date();

  while (days.has(cursor.toDateString())) {
    streak += 1;
    cursor.setTime(cursor.getTime() - DAY_MS);
  }

  return streak;
}

export function getProgressionRecommendation(history: WorkoutHistory[], config: WorkoutConfig): ProgressionRecommendation {
  const weeklyJumpSeconds = calculateWeeklyJumpSeconds(history);
  const completionRate = calculateCompletionRate(history);
  const streakDays = calculateStreakDays(history);
  const nextConfig = { ...config };

  let title = 'Base sólida';
  let reason = 'Completá 2 o 3 sesiones para que RopeFit ajuste la próxima carga.';

  if (!config.progressionEnabled) {
    return {
      title: 'Progresión pausada',
      reason: 'Activá progresión automática para adaptar bloques, descansos y dificultad.',
      nextConfig,
      weeklyJumpSeconds,
      completionRate,
      streakDays,
    };
  }

  if (history.length === 0) {
    nextConfig.blocks = Math.min(20, Math.max(8, config.blocks));
    title = 'Semana 1: técnica limpia';
    reason = 'Arrancá con el preset actual, calentamiento y cooldown para construir tolerancia.';
  } else if (completionRate >= 0.92 && weeklyJumpSeconds >= 25 * 60) {
    if (config.blocks < 20) {
      nextConfig.blocks = Math.min(20, config.blocks + 1);
      title = '+1 bloque recomendado';
      reason = 'Tu consistencia permite subir volumen sin tocar los intervalos.';
    } else if (config.shortRestSeconds > 5) {
      nextConfig.shortRestSeconds = Math.max(5, config.shortRestSeconds - 5);
      title = 'Recortar descanso corto';
      reason = 'Ya estás en 20 bloques. El siguiente estímulo es más densidad.';
    } else {
      nextConfig.level = config.level === 'Beginner' ? 'Intermediate' : 'Advanced';
      title = 'Subir nivel del finalizador';
      reason = 'La soga está estable; progresá desde fuerza y control corporal.';
    }
  } else if (completionRate < 0.65 && history.length >= 2) {
    nextConfig.blocks = Math.max(1, config.blocks - 1);
    nextConfig.shortRestSeconds = Math.min(60, config.shortRestSeconds + 5);
    title = 'Deload inteligente';
    reason = 'Bajamos un poco la carga para completar mejor y volver a construir.';
  } else {
    title = 'Repetir y consolidar';
    reason = 'Mantené esta carga una sesión más; buscá respiración estable y menos cortes.';
  }

  return {
    title,
    reason,
    nextConfig,
    weeklyJumpSeconds,
    completionRate,
    streakDays,
  };
}
