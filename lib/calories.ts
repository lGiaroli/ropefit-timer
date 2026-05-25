import { CaloriesEstimate, WeightUnit, WorkoutLevel } from './types';

const jumpRopeMetsByLevel: Record<WorkoutLevel, number> = {
  Beginner: 8.8,
  Intermediate: 11.8,
  Advanced: 12.5,
};

const strengthMetsByLevel: Record<WorkoutLevel, number> = {
  Beginner: 3.8,
  Intermediate: 5.0,
  Advanced: 6.5,
};

export function toKilograms(weight: number, unit: WeightUnit) {
  return unit === 'lb' ? weight * 0.45359237 : weight;
}

function estimateFromMet(met: number, weightKg: number, seconds: number) {
  const minutes = seconds / 60;
  return (met * 3.5 * weightKg * minutes) / 200;
}

export function calculateCalories(
  weight: number,
  activeJumpSeconds: number,
  level: WorkoutLevel,
  unit: WeightUnit = 'kg',
  strengthSeconds = 0,
): CaloriesEstimate {
  const weightKg = toKilograms(weight, unit);
  const jumpBase = estimateFromMet(jumpRopeMetsByLevel[level], weightKg, activeJumpSeconds);
  const strengthBase = estimateFromMet(strengthMetsByLevel[level], weightKg, strengthSeconds);
  const base = jumpBase + strengthBase;
  const low = Math.max(0, Math.round(base * 0.85));
  const high = Math.max(low, Math.round(base * 1.2));

  return {
    low,
    high,
    label: `${low}-${high} kcal`,
  };
}
