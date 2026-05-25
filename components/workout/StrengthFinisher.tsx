import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { Button } from '@/components/ui/Button';
import { ExerciseCard } from './ExerciseCard';
import { TimerCircle } from './TimerCircle';
import { AudioCueManager } from '@/lib/audio/AudioCueManager';
import { SpeechManager } from '@/lib/audio/SpeechManager';
import { formatClock } from '@/lib/format';
import { colors, getPhaseColor, getPhaseSurface, radii, spacing } from '@/lib/theme';
import { AppSettings, Exercise, WorkoutConfig, WorkoutStep } from '@/lib/types';
import { EXERCISES_BY_LEVEL, generateStrengthFinisher, replaceExerciseAtIndex } from '@/lib/strength';

interface StrengthFinisherProps {
  config: WorkoutConfig;
  settings: AppSettings;
  onComplete: () => void;
  onSkip: () => void;
}

export function StrengthFinisher({ config, settings, onComplete, onSkip }: StrengthFinisherProps) {
  const [exercises, setExercises] = useState<Exercise[]>(EXERCISES_BY_LEVEL[config.level]);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    setExercises(EXERCISES_BY_LEVEL[config.level]);
  }, [config.level]);

  if (!started) {
    return (
      <View style={styles.setup}>
        <View style={styles.header}>
          <Text style={styles.title}>Finalizador de fuerza</Text>
          <Text style={styles.subtitle}>{config.strengthDuration} min · 40s trabajo / 20s descanso · {config.level}</Text>
        </View>

        <View style={styles.exerciseList}>
          {exercises.map((exercise, index) => (
            <ExerciseCard
              key={`${exercise.id}-${index}`}
              exercise={exercise}
              index={index}
              onReplace={() => setExercises((current) => replaceExerciseAtIndex(current, index, config.level))}
            />
          ))}
        </View>

        <View style={styles.setupButtons}>
          <Button title="Start Finisher" onPress={() => setStarted(true)} variant="primary" />
          <Button title="Saltar finalizador" onPress={onSkip} variant="ghost" />
        </View>
      </View>
    );
  }

  return <StrengthTimer config={config} settings={settings} exercises={exercises} onComplete={onComplete} onSkip={onSkip} />;
}

function StrengthTimer({
  config,
  settings,
  exercises,
  onComplete,
  onSkip,
}: {
  config: WorkoutConfig;
  settings: AppSettings;
  exercises: Exercise[];
  onComplete: () => void;
  onSkip: () => void;
}) {
  const steps = useMemo(() => generateStrengthFinisher(config.level, config.strengthDuration, exercises), [config.level, config.strengthDuration, exercises]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingMs, setRemainingMs] = useState((steps[0]?.duration ?? 0) * 1000);
  const [isPaused, setIsPaused] = useState(false);
  const { width } = useWindowDimensions();
  const deadlineRef = useRef(Date.now() + (steps[0]?.duration ?? 0) * 1000);
  const pausedAtRef = useRef<number | null>(null);
  const lastCountdownSecondRef = useRef<number | null>(null);
  const isAdvancingRef = useRef(false);

  const currentStep: WorkoutStep = steps[currentIndex] ?? steps[steps.length - 1];
  const phaseColor = getPhaseColor(currentStep.type);
  const progress = currentStep.duration > 0 ? 1 - remainingMs / (currentStep.duration * 1000) : 1;
  const circleSize = Math.min(280, Math.max(228, width - 96));

  const advance = useCallback(() => {
    if (isAdvancingRef.current) {
      return;
    }
    isAdvancingRef.current = true;

    if (currentIndex >= steps.length - 1) {
      onComplete();
    } else {
      setCurrentIndex((index) => Math.min(index + 1, steps.length - 1));
    }

  }, [currentIndex, onComplete, steps.length]);

  useEffect(() => {
    const step = steps[currentIndex];
    if (!step) {
      return;
    }

    deadlineRef.current = Date.now() + step.duration * 1000;
    setRemainingMs(step.duration * 1000);
    lastCountdownSecondRef.current = null;
    isAdvancingRef.current = false;
    SpeechManager.speak(settings.coachTipsEnabled ? step.voiceCue : getBasicStrengthCue(step), settings.voiceEnabled, settings.voiceId, settings.voiceType);
    AudioCueManager.playTransitionCue(settings.pipsEnabled, settings.pipVolume);
    AudioCueManager.vibrate(settings.hapticsEnabled);
  }, [currentIndex, settings.coachTipsEnabled, settings.hapticsEnabled, settings.pipVolume, settings.pipsEnabled, settings.voiceEnabled, settings.voiceId, settings.voiceType, steps]);

  useEffect(() => {
    if (isPaused) {
      return undefined;
    }

    const tick = () => {
      const nextRemaining = Math.max(0, deadlineRef.current - Date.now());
      const nextRemainingSeconds = Math.ceil(nextRemaining / 1000);
      setRemainingMs(nextRemaining);

      if (
        currentStep.beepEnabled &&
        settings.finalCountdownEnabled &&
        nextRemainingSeconds > 0 &&
        nextRemainingSeconds <= 3 &&
        lastCountdownSecondRef.current !== nextRemainingSeconds
      ) {
        lastCountdownSecondRef.current = nextRemainingSeconds;
        AudioCueManager.playCountdownBeep(settings.pipsEnabled, settings.pipVolume);
      }

      if (nextRemaining <= 0) {
        advance();
      }
    };

    const interval = setInterval(tick, 200);
    tick();
    return () => clearInterval(interval);
  }, [advance, currentStep.beepEnabled, isPaused, settings.finalCountdownEnabled, settings.pipVolume, settings.pipsEnabled]);

  const pause = () => {
    pausedAtRef.current = Date.now();
    setIsPaused(true);
    SpeechManager.stop();
  };

  const resume = () => {
    if (pausedAtRef.current) {
      deadlineRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    setIsPaused(false);
  };

  return (
    <View style={styles.timerRoot}>
      <View style={[styles.phasePill, { backgroundColor: getPhaseSurface(currentStep.type), borderColor: phaseColor }]}>
        <Text style={[styles.phaseText, { color: phaseColor }]}>{currentStep.type === 'strength' ? 'Finalizador de fuerza' : 'Descanso de fuerza'}</Text>
      </View>

      <TimerCircle
        size={circleSize}
        progress={progress}
        color={phaseColor}
        timeLabel={formatClock(Math.ceil(remainingMs / 1000))}
        stateLabel={currentStep.label}
      />

      <View style={styles.exercisePanel}>
        <Text style={styles.exerciseTitle}>{currentStep.exerciseName ?? currentStep.label}</Text>
        <Text style={styles.exerciseInstruction}>{currentStep.exerciseInstruction}</Text>
      </View>

      <View style={styles.controls}>
        <RoundControl label={isPaused ? 'Resume' : 'Pause'} icon={isPaused ? 'play' : 'pause'} onPress={isPaused ? resume : pause} accent={colors.lime} />
        <RoundControl label="Skip" icon="skip-forward" onPress={advance} accent={colors.cyan} />
        <RoundControl label="End" icon="x" onPress={onSkip} accent={colors.coral} />
      </View>
    </View>
  );
}

function getBasicStrengthCue(step: WorkoutStep) {
  if (step.type === 'strength') {
    return `Próximo ejercicio: ${step.exerciseName}.`;
  }
  return `Descansamos ${step.duration} segundos.`;
}

function RoundControl({ label, icon, onPress, accent }: { label: string; icon: keyof typeof Feather.glyphMap; onPress: () => void; accent: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={({ pressed }) => [styles.roundButton, pressed ? styles.pressed : null]}>
      <Feather name={icon} size={22} color={accent} />
      <Text style={styles.roundButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  setup: {
    flex: 1,
    gap: spacing.lg,
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
  exerciseList: {
    gap: spacing.sm,
  },
  setupButtons: {
    gap: spacing.sm,
    paddingBottom: spacing.lg,
  },
  timerRoot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
  },
  phasePill: {
    minHeight: 42,
    borderRadius: radii.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  exercisePanel: {
    width: '100%',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  exerciseTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  exerciseInstruction: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  controls: {
    width: '100%',
    flexDirection: 'row',
    gap: spacing.sm,
  },
  roundButton: {
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
  roundButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900',
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
