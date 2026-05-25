import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { AppScreen } from '@/components/ui/AppScreen';
import { Button } from '@/components/ui/Button';
import { WorkoutSetupForm } from '@/components/workout/WorkoutSetupForm';
import { colors, spacing } from '@/lib/theme';
import { WorkoutConfig } from '@/lib/types';
import { useAppStore } from '@/store/AppStoreProvider';

export default function CustomizeScreen() {
  const { config, settings, updateConfig } = useAppStore();
  const [draft, setDraft] = useState<WorkoutConfig>(config);

  useEffect(() => {
    setDraft(config);
  }, [config]);

  const save = async () => {
    await updateConfig(draft);
    router.back();
  };

  const saveAndStart = async () => {
    await updateConfig(draft);
    router.replace('/workout');
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.header}>
        <Button title="" variant="ghost" onPress={() => router.back()} icon={<Feather name="chevron-left" size={22} color={colors.text} />} style={styles.backButton} />
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Customize Workout</Text>
          <Text style={styles.subtitle}>Ajustá bloques, descansos, fuerza y nivel.</Text>
        </View>
      </View>

      <WorkoutSetupForm config={draft} settings={settings} onChange={setDraft} />

      <View style={styles.actions}>
        <Button title="Guardar cambios" onPress={save} />
        <Button title="Guardar y empezar" variant="secondary" onPress={saveAndStart} />
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: spacing.lg,
    paddingTop: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  backButton: {
    width: 48,
    paddingHorizontal: 0,
  },
  headerCopy: {
    flex: 1,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 3,
  },
  actions: {
    gap: spacing.sm,
  },
});
