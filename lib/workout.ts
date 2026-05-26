import { WorkoutConfig, WorkoutStep } from './types';
import { formatDuration } from './format';

export const DEFAULT_WORKOUT_CONFIG: WorkoutConfig = {
  id: 'ropefit-40',
  name: '40 min Jump Rope',
  blocks: 20,
  roundsPerBlock: 6,
  jumpSeconds: 20,
  shortRestSeconds: 10,
  longRestSeconds: 60,
  warmupEnabled: true,
  warmupSeconds: 180,
  cooldownEnabled: true,
  cooldownSeconds: 120,
  progressionEnabled: true,
  strengthFinisherEnabled: true,
  strengthDuration: 12,
  level: 'Intermediate',
};

export function calculateActiveJumpTime(config: WorkoutConfig) {
  return config.blocks * config.roundsPerBlock * config.jumpSeconds;
}

export function calculateShortRestTime(config: WorkoutConfig) {
  return config.blocks * Math.max(0, config.roundsPerBlock - 1) * config.shortRestSeconds;
}

export function calculateLongRestTime(config: WorkoutConfig) {
  return Math.max(0, config.blocks - 1) * config.longRestSeconds;
}

export function calculateRestTime(config: WorkoutConfig) {
  return calculateShortRestTime(config) + calculateLongRestTime(config);
}

export function calculateWorkoutDuration(config: WorkoutConfig, includeStrength = true) {
  const ropeSeconds = calculateActiveJumpTime(config) + calculateRestTime(config);
  const warmupSeconds = config.warmupEnabled ? config.warmupSeconds : 0;
  const cooldownSeconds = config.cooldownEnabled ? config.cooldownSeconds : 0;
  const strengthSeconds = includeStrength && config.strengthFinisherEnabled ? config.strengthDuration * 60 : 0;
  return warmupSeconds + ropeSeconds + cooldownSeconds + strengthSeconds;
}

export function generateJumpRopeWorkout(config: WorkoutConfig): WorkoutStep[] {
  const steps: WorkoutStep[] = [
    {
      id: 'countdown-ready',
      type: 'countdown',
      duration: 1,
      label: 'Preparado',
      voiceCue: 'Preparado',
      beepEnabled: true,
    },
    {
      id: 'countdown-3',
      type: 'countdown',
      duration: 1,
      label: '3',
      voiceCue: '3',
      beepEnabled: true,
    },
    {
      id: 'countdown-2',
      type: 'countdown',
      duration: 1,
      label: '2',
      voiceCue: '2',
      beepEnabled: true,
    },
    {
      id: 'countdown-1',
      type: 'countdown',
      duration: 1,
      label: '1',
      voiceCue: '1',
      beepEnabled: true,
    },
  ];

  if (config.warmupEnabled) {
    const warmupDuration = formatSpeechDuration(config.warmupSeconds);
    steps.push({
      id: 'warmup',
      type: 'warmup',
      duration: config.warmupSeconds,
      label: `Calentamiento ${formatDuration(config.warmupSeconds)}`,
      voiceCue: `Calentamiento de ${warmupDuration}. Mové tobillos, hombros y empezá con saltos suaves.`,
      beepEnabled: true,
    });
  }

  for (let block = 1; block <= config.blocks; block += 1) {
    for (let round = 1; round <= config.roundsPerBlock; round += 1) {
      steps.push({
        id: `b${block}-r${round}-jump`,
        type: 'jump',
        duration: config.jumpSeconds,
        label: `Saltamos ${config.jumpSeconds} segundos`,
        blockNumber: block,
        roundNumber: round,
        voiceCue: buildJumpVoiceCue(config, block, round),
        beepEnabled: true,
      });

      if (round < config.roundsPerBlock) {
        steps.push({
          id: `b${block}-r${round}-short-rest`,
          type: 'short_rest',
        duration: config.shortRestSeconds,
        label: `Descansamos ${config.shortRestSeconds} segundos`,
        blockNumber: block,
        roundNumber: round,
        voiceCue: `Descansamos ${config.shortRestSeconds} segundos. Respiración nasal si podés.`,
        beepEnabled: true,
      });
      }
    }

    if (block < config.blocks) {
      const longRestDuration = formatSpeechDuration(config.longRestSeconds);
      steps.push({
        id: `b${block}-long-rest`,
        type: 'long_rest',
        duration: config.longRestSeconds,
        label: `Descanso de bloque: ${formatDuration(config.longRestSeconds)}`,
        blockNumber: block,
        roundNumber: config.roundsPerBlock,
        voiceCue: `Descanso de ${longRestDuration}. Próximo bloque en breve.`,
        beepEnabled: true,
      });
    }
  }

  if (config.cooldownEnabled) {
    const cooldownDuration = formatSpeechDuration(config.cooldownSeconds);
    steps.push({
      id: 'cooldown',
      type: 'cooldown',
      duration: config.cooldownSeconds,
      label: `Cooldown ${formatDuration(config.cooldownSeconds)}`,
      voiceCue: `Enfriamiento de ${cooldownDuration}. Bajá pulsaciones, caminá suave y soltá gemelos.`,
      beepEnabled: true,
    });
  }

  return steps;
}

function formatSpeechDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes === 0) {
    return `${seconds} segundos`;
  }

  if (seconds === 0) {
    return minutes === 1 ? '1 minuto' : `${minutes} minutos`;
  }

  const minuteLabel = minutes === 1 ? '1 minuto' : `${minutes} minutos`;
  return `${minuteLabel} y ${seconds} segundos`;
}

function buildJumpVoiceCue(config: WorkoutConfig, block: number, round: number) {
  const base = `Saltamos ${config.jumpSeconds} segundos.`;
  if (block === 1 && round === 1) {
    return `${base} Postura alta, muñecas relajadas, caída suave.`;
  }
  if (round === 1) {
    return `${base} Bloque ${block} de ${config.blocks}. Encontrá ritmo y mantené hombros abajo.`;
  }
  if (block === Math.ceil(config.blocks / 2) && round === 1) {
    return `${base} Mitad del trabajo. Técnica limpia antes que velocidad.`;
  }
  if (block === config.blocks && round === config.roundsPerBlock) {
    return `${base} Última ronda de soga. Cerrá fuerte.`;
  }
  return base;
}
