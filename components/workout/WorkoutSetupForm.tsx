import { StyleSheet, Text, View } from 'react-native';
import { Stepper } from '@/components/ui/Stepper';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { MetricCard } from '@/components/ui/MetricCard';
import { calculateCalories } from '@/lib/calories';
import { colors, spacing } from '@/lib/theme';
import { AppSettings, WorkoutConfig, WorkoutLevel } from '@/lib/types';
import { calculateActiveJumpTime, calculateRestTime, calculateWorkoutDuration } from '@/lib/workout';
import { formatDuration } from '@/lib/format';

interface WorkoutSetupFormProps {
  config: WorkoutConfig;
  settings: AppSettings;
  onChange: (config: WorkoutConfig) => void;
}

const levelOptions: WorkoutLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

export function WorkoutSetupForm({ config, settings, onChange }: WorkoutSetupFormProps) {
  const jumpSeconds = calculateActiveJumpTime(config);
  const restSeconds = calculateRestTime(config);
  const prepSeconds = (config.warmupEnabled ? config.warmupSeconds : 0) + (config.cooldownEnabled ? config.cooldownSeconds : 0);
  const totalSeconds = calculateWorkoutDuration(config);
  const calories = calculateCalories(settings.weight, jumpSeconds, config.level, settings.weightUnit, config.strengthFinisherEnabled ? config.strengthDuration * 60 : 0);

  const patchConfig = (patch: Partial<WorkoutConfig>) => onChange({ ...config, ...patch });

  return (
    <View style={styles.root}>
      <View style={styles.grid}>
        <Stepper label="Bloques" value={config.blocks} min={1} max={20} onChange={(blocks) => patchConfig({ blocks })} />
        <Stepper label="Rondas por bloque" value={config.roundsPerBlock} min={1} max={12} onChange={(roundsPerBlock) => patchConfig({ roundsPerBlock })} />
        <Stepper label="Salto" value={config.jumpSeconds} min={10} max={90} step={5} suffix="s" onChange={(jumpSeconds) => patchConfig({ jumpSeconds })} />
        <Stepper label="Descanso corto" value={config.shortRestSeconds} min={5} max={60} step={5} suffix="s" onChange={(shortRestSeconds) => patchConfig({ shortRestSeconds })} />
        <Stepper label="Descanso entre bloques" value={config.longRestSeconds} min={15} max={180} step={15} suffix="s" onChange={(longRestSeconds) => patchConfig({ longRestSeconds })} />
      </View>

      <ToggleRow
        label="Progresión automática"
        detail="Ajusta la próxima sesión según historial, consistencia y bloques completados."
        value={config.progressionEnabled}
        onChange={(progressionEnabled) => patchConfig({ progressionEnabled })}
      />

      <ToggleRow
        label="Calentamiento"
        detail="Movilidad y saltos suaves antes del primer bloque."
        value={config.warmupEnabled}
        onChange={(warmupEnabled) => patchConfig({ warmupEnabled })}
      />
      {config.warmupEnabled ? (
        <Stepper label="Duración calentamiento" value={config.warmupSeconds} min={60} max={600} step={30} suffix="s" onChange={(warmupSeconds) => patchConfig({ warmupSeconds })} />
      ) : null}

      <ToggleRow
        label="Cooldown"
        detail="Baja pulsaciones y suelta gemelos después de la soga."
        value={config.cooldownEnabled}
        onChange={(cooldownEnabled) => patchConfig({ cooldownEnabled })}
      />
      {config.cooldownEnabled ? (
        <Stepper label="Duración cooldown" value={config.cooldownSeconds} min={60} max={600} step={30} suffix="s" onChange={(cooldownSeconds) => patchConfig({ cooldownSeconds })} />
      ) : null}

      <View style={styles.stack}>
        <Text style={styles.label}>Nivel</Text>
        <SegmentedControl
          value={config.level}
          onChange={(level) => patchConfig({ level })}
          options={levelOptions.map((level) => ({ label: level, value: level }))}
        />
      </View>

      <ToggleRow
        label="Finalizador de fuerza"
        detail="Cuerpo completo, sin equipamiento, después de la soga."
        value={config.strengthFinisherEnabled}
        onChange={(strengthFinisherEnabled) => patchConfig({ strengthFinisherEnabled })}
      />

      <View style={styles.stack}>
        <Text style={styles.label}>Duración del finalizador</Text>
        <SegmentedControl
          value={config.strengthDuration}
          onChange={(strengthDuration) => patchConfig({ strengthDuration })}
          options={[8, 10, 12, 15].map((minutes) => ({ label: `${minutes} min`, value: minutes as WorkoutConfig['strengthDuration'] }))}
        />
      </View>

      <View style={styles.previewGrid}>
        <MetricCard label="Tiempo saltando" value={formatDuration(jumpSeconds)} accent={colors.lime} />
        <MetricCard label="Descanso" value={formatDuration(restSeconds)} accent={colors.cyan} />
      </View>
      <View style={styles.previewGrid}>
        <MetricCard label="Warmup + cooldown" value={formatDuration(prepSeconds)} accent={colors.amber} />
        <MetricCard label="Sesión aprox." value={formatDuration(totalSeconds)} accent={colors.amber} />
      </View>
      <View style={styles.previewGrid}>
        <MetricCard label="Calorías estimadas" value={calories.label} accent={colors.coral} />
      </View>

      <Text style={styles.disclaimer}>Las calorías son aproximadas y dependen de peso, intensidad, técnica y pausas reales.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  grid: {
    gap: spacing.sm,
  },
  stack: {
    gap: spacing.sm,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  previewGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  disclaimer: {
    color: colors.subtle,
    fontSize: 12,
    lineHeight: 18,
  },
});
