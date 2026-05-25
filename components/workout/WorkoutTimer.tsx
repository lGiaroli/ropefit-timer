import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { TimerCircle } from './TimerCircle';
import { AudioCueManager } from '@/lib/audio/AudioCueManager';
import { SpeechManager } from '@/lib/audio/SpeechManager';
import { formatClock, formatDuration } from '@/lib/format';
import { colors, getPhaseColor, getPhaseSurface, radii, spacing } from '@/lib/theme';
import { AppSettings, WorkoutConfig, WorkoutRunSummary, WorkoutStep, WorkoutStepType } from '@/lib/types';
import { generateJumpRopeWorkout } from '@/lib/workout';

interface WorkoutTimerProps {
  config: WorkoutConfig;
  settings: AppSettings;
  onJumpComplete: (summary: WorkoutRunSummary) => void;
  onEndWorkout: (summary: WorkoutRunSummary) => void;
}

function getStateLabel(type: WorkoutStepType) {
  switch (type) {
    case 'jump':
      return 'Saltando';
    case 'warmup':
      return 'Calentamiento';
    case 'short_rest':
      return 'Descanso corto';
    case 'long_rest':
      return 'Descanso entre bloques';
    case 'cooldown':
      return 'Cooldown';
    case 'countdown':
      return 'Cuenta regresiva';
    default:
      return 'Entrenamiento';
  }
}

export function WorkoutTimer({ config, settings, onJumpComplete, onEndWorkout }: WorkoutTimerProps) {
  const steps = useMemo(() => generateJumpRopeWorkout(config), [config]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState((steps[0]?.duration ?? 0) * 1000);
  const [isPaused, setIsPaused] = useState(false);
  const [completedRounds, setCompletedRounds] = useState(0);
  const { width } = useWindowDimensions();

  const deadlineRef = useRef(Date.now() + (steps[0]?.duration ?? 0) * 1000);
  const sessionStartedAtRef = useRef(Date.now());
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef(0);
  const completedRoundsRef = useRef(0);
  const completedJumpSecondsRef = useRef(0);
  const remainingMsRef = useRef(steps[0]?.duration ? steps[0].duration * 1000 : 0);
  const lastCountdownSecondRef = useRef<number | null>(null);
  const isAdvancingRef = useRef(false);

  const currentStep = steps[currentIndex] ?? steps[steps.length - 1];
  const phaseColor = getPhaseColor(currentStep.type);
  const circleSize = Math.min(286, Math.max(232, width - 88));
  const remainingSeconds = Math.ceil(remainingMs / 1000);
  const progress = currentStep.duration > 0 ? 1 - remainingMs / (currentStep.duration * 1000) : 1;
  const displayBlock = currentStep.blockNumber ?? Math.min(config.blocks, Math.floor(completedRounds / config.roundsPerBlock) + 1);
  const displayRound = currentStep.roundNumber ?? Math.min(config.roundsPerBlock, (completedRounds % config.roundsPerBlock) + 1);

  const buildSummary = useCallback(
    (includeCurrentPartial: boolean): WorkoutRunSummary => {
      let activeJumpSeconds = completedJumpSecondsRef.current;
      let countedRounds = completedRoundsRef.current;

      if (includeCurrentPartial && currentStep?.type === 'jump') {
        const elapsed = Math.max(0, Math.min(currentStep.duration, Math.floor((currentStep.duration * 1000 - remainingMsRef.current) / 1000)));
        activeJumpSeconds += elapsed;
        if (elapsed >= currentStep.duration) {
          countedRounds += 1;
        }
      }

      return {
        startedAt: sessionStartedAtRef.current,
        completedBlocks: Math.min(config.blocks, Math.floor(countedRounds / config.roundsPerBlock)),
        completedRounds: countedRounds,
        activeJumpSeconds,
        totalSeconds: Math.max(0, Math.round((Date.now() - sessionStartedAtRef.current - totalPausedMsRef.current) / 1000)),
      };
    },
    [config.blocks, config.roundsPerBlock, currentStep],
  );

  const advanceStep = useCallback(
    (creditCurrentStep: boolean) => {
      if (isAdvancingRef.current) {
        return;
      }
      isAdvancingRef.current = true;

      const step = steps[currentIndex];
      if (creditCurrentStep && step?.type === 'jump') {
        completedJumpSecondsRef.current += step.duration;
        completedRoundsRef.current += 1;
        setCompletedRounds(completedRoundsRef.current);
      }

      if (currentIndex >= steps.length - 1) {
        onJumpComplete(buildSummary(false));
      } else {
        setCurrentIndex((index) => Math.min(index + 1, steps.length - 1));
      }

    },
    [buildSummary, currentIndex, onJumpComplete, steps],
  );

  useEffect(() => {
    const step = steps[currentIndex];
    if (!step) {
      return;
    }

    const now = Date.now();
    deadlineRef.current = now + step.duration * 1000;
    remainingMsRef.current = step.duration * 1000;
    setRemainingMs(step.duration * 1000);
    lastCountdownSecondRef.current = null;
    isAdvancingRef.current = false;

    SpeechManager.speak(settings.coachTipsEnabled ? step.voiceCue : getBasicVoiceCue(step), settings.voiceEnabled, settings.voiceId, settings.voiceType);
    AudioCueManager.playTransitionCue(settings.pipsEnabled, settings.pipVolume);
    AudioCueManager.vibrate(settings.hapticsEnabled);
  }, [currentIndex, settings.coachTipsEnabled, settings.finalCountdownEnabled, settings.hapticsEnabled, settings.pipVolume, settings.pipsEnabled, settings.voiceEnabled, settings.voiceId, settings.voiceType, steps]);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const tick = () => {
      const step = steps[currentIndex];
      // Use a wall-clock deadline so late JS ticks do not shorten or lengthen the workout.
      const nextRemaining = Math.max(0, deadlineRef.current - Date.now());
      remainingMsRef.current = nextRemaining;
      setRemainingMs(nextRemaining);

      const nextRemainingSeconds = Math.ceil(nextRemaining / 1000);
      if (
        step?.beepEnabled &&
        settings.finalCountdownEnabled &&
        nextRemainingSeconds > 0 &&
        nextRemainingSeconds <= 3 &&
        lastCountdownSecondRef.current !== nextRemainingSeconds
      ) {
        lastCountdownSecondRef.current = nextRemainingSeconds;
        AudioCueManager.playCountdownBeep(settings.pipsEnabled, settings.pipVolume);
      }

      if (nextRemaining <= 0) {
        advanceStep(true);
      }
    };

    const interval = setInterval(tick, 200);
    tick();
    return () => clearInterval(interval);
  }, [advanceStep, currentIndex, isPaused, settings.finalCountdownEnabled, settings.pipVolume, settings.pipsEnabled, steps]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && !isPaused) {
        const nextRemaining = Math.max(0, deadlineRef.current - Date.now());
        remainingMsRef.current = nextRemaining;
        setRemainingMs(nextRemaining);
      }
    });
    return () => subscription.remove();
  }, [isPaused]);

  const pause = () => {
    pausedAtRef.current = Date.now();
    setIsPaused(true);
    SpeechManager.stop();
  };

  const resume = () => {
    const pausedAt = pausedAtRef.current;
    if (pausedAt) {
      const pausedDuration = Date.now() - pausedAt;
      deadlineRef.current += pausedDuration;
      totalPausedMsRef.current += pausedDuration;
      pausedAtRef.current = null;
    }
    setIsPaused(false);
  };

  const skip = () => advanceStep(false);
  const endWorkout = () => onEndWorkout(buildSummary(true));

  return (
    <View style={styles.root}>
      <View style={[styles.statusPill, { backgroundColor: getPhaseSurface(currentStep.type), borderColor: phaseColor }]}>
        <Text style={[styles.statusText, { color: phaseColor }]}>{getStateLabel(currentStep.type)}</Text>
      </View>

      <TimerCircle
        size={circleSize}
        progress={progress}
        color={phaseColor}
        timeLabel={formatClock(remainingSeconds)}
        stateLabel={currentStep.label}
      />

      <View style={styles.progressPanel}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Bloque</Text>
          <Text style={styles.progressValue}>
            {displayBlock} de {config.blocks}
          </Text>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Ronda</Text>
          <Text style={styles.progressValue}>
            {displayRound} de {config.roundsPerBlock}
          </Text>
        </View>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>Saltado</Text>
          <Text style={styles.progressValue}>{formatDuration(completedJumpSecondsRef.current)}</Text>
        </View>
      </View>

      <View style={styles.controls}>
        <TimerButton label={isPaused ? 'Resume' : 'Pause'} icon={isPaused ? 'play' : 'pause'} onPress={isPaused ? resume : pause} accent={colors.lime} />
        <TimerButton label="Skip" icon="skip-forward" onPress={skip} accent={colors.cyan} />
        <TimerButton label="End" icon="x" onPress={endWorkout} accent={colors.coral} />
      </View>
    </View>
  );
}

function getBasicVoiceCue(step: WorkoutStep) {
  switch (step.type) {
    case 'warmup':
      return 'Calentamiento';
    case 'jump':
      return `Saltamos ${step.duration} segundos`;
    case 'short_rest':
      return `Descansamos ${step.duration} segundos`;
    case 'long_rest':
      return 'Descanso de bloque';
    case 'cooldown':
      return 'Enfriamiento';
    default:
      return step.voiceCue;
  }
}

function TimerButton({ label, icon, onPress, accent }: { label: string; icon: keyof typeof Feather.glyphMap; onPress: () => void; accent: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.timerButton, pressed ? styles.pressed : null]}>
      <Feather name={icon} size={22} color={accent} />
      <Text style={styles.timerButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  statusPill: {
    minHeight: 42,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  progressPanel: {
    width: '100%',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  progressValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  controls: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  timerButton: {
    flex: 1,
    minHeight: 64,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  timerButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
