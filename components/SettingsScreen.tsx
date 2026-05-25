import { StyleSheet, Text, View } from 'react-native';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Stepper } from '@/components/ui/Stepper';
import { ToggleRow } from '@/components/ui/ToggleRow';
import { colors, spacing } from '@/lib/theme';
import { AppSettings } from '@/lib/types';

interface SettingsScreenProps {
  settings: AppSettings;
  onChange: (settings: AppSettings) => void;
}

export function SettingsScreen({ settings, onChange }: SettingsScreenProps) {
  const patch = (patchValue: Partial<AppSettings>) => onChange({ ...settings, ...patchValue });

  return (
    <View style={styles.root}>
      <View style={styles.stack}>
        <Text style={styles.label}>Peso</Text>
        <Stepper label="Peso del usuario" value={settings.weight} min={35} max={180} suffix={settings.weightUnit} onChange={(weight) => patch({ weight })} />
      </View>

      <View style={styles.stack}>
        <Text style={styles.label}>Unidad</Text>
        <SegmentedControl
          value={settings.weightUnit}
          onChange={(weightUnit) => patch({ weightUnit })}
          options={[
            { label: 'kg', value: 'kg' },
            { label: 'lb', value: 'lb' },
          ]}
        />
      </View>

      <ToggleRow label="Voz" detail="Mensajes hablados en español durante cada etapa." value={settings.voiceEnabled} onChange={(voiceEnabled) => patch({ voiceEnabled })} />
      <ToggleRow
        label="Coach de voz"
        detail="Agrega tips de técnica, respiración y progresión durante la sesión."
        value={settings.coachTipsEnabled}
        onChange={(coachTipsEnabled) => patch({ coachTipsEnabled })}
      />
      <View style={styles.stack}>
        <Text style={styles.label}>Tipo de voz</Text>
        <SegmentedControl
          value={settings.voiceType}
          onChange={(voiceType) => patch({ voiceType })}
          options={[
            { label: 'Coach', value: 'coach' },
            { label: 'Neutral', value: 'neutral' },
            { label: 'Calma', value: 'calm' },
          ]}
        />
      </View>
      <ToggleRow label="Pips" detail="Cuenta final y cambio de etapa con sonido claro." value={settings.pipsEnabled} onChange={(pipsEnabled) => patch({ pipsEnabled })} />
      <ToggleRow label="Vibración" detail="Feedback suave al cambiar de intervalo." value={settings.hapticsEnabled} onChange={(hapticsEnabled) => patch({ hapticsEnabled })} />
      <ToggleRow label="Cuenta regresiva final" detail="Pip en los últimos 3 segundos." value={settings.finalCountdownEnabled} onChange={(finalCountdownEnabled) => patch({ finalCountdownEnabled })} />

      <View style={styles.stack}>
        <Text style={styles.label}>Volumen de pips</Text>
        <SegmentedControl
          value={settings.pipVolume}
          onChange={(pipVolume) => patch({ pipVolume })}
          options={[
            { label: 'Bajo', value: 0.45 },
            { label: 'Medio', value: 0.7 },
            { label: 'Alto', value: 0.95 },
          ]}
        />
      </View>

      <View style={styles.stack}>
        <Text style={styles.label}>Tema</Text>
        <SegmentedControl
          value={settings.theme}
          onChange={(theme) => patch({ theme })}
          options={[
            { label: 'Oscuro', value: 'dark' },
            { label: 'Claro', value: 'light' },
          ]}
        />
      </View>

      <View style={styles.spotifyStatus}>
        <Text style={styles.spotifyTitle}>Spotify</Text>
        <Text style={styles.spotifyText}>{settings.spotifyConnected ? 'Conectado' : 'Desconectado o en modo mock'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
  },
  stack: {
    gap: spacing.sm,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  spotifyStatus: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 8,
  },
  spotifyTitle: {
    color: colors.spotify,
    fontWeight: '900',
    fontSize: 16,
  },
  spotifyText: {
    color: colors.muted,
    marginTop: 4,
  },
});
