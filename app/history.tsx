import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { AppScreen } from '@/components/ui/AppScreen';
import { Button } from '@/components/ui/Button';
import { WorkoutHistory } from '@/components/workout/WorkoutHistory';
import { colors, spacing } from '@/lib/theme';
import { useAppStore } from '@/store/AppStoreProvider';

export default function HistoryScreen() {
  const { history, clearHistory } = useAppStore();

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.header}>
        <Button title="" variant="ghost" onPress={() => router.back()} icon={<Feather name="chevron-left" size={22} color={colors.text} />} style={styles.backButton} />
        <View style={styles.headerCopy}>
          <Text style={styles.title}>History</Text>
          <Text style={styles.subtitle}>Sesiones, racha semanal y minutos reales saltando.</Text>
        </View>
      </View>

      <WorkoutHistory entries={history} />

      <Button title="Abrir perfil RPG" variant="secondary" onPress={() => router.push('/profile')} icon={<Feather name="shield" size={19} color={colors.amber} />} />
      <Button title="Abrir dashboard" variant="secondary" onPress={() => router.push('/dashboard')} />
      {history.length > 0 ? <Button title="Borrar historial" variant="danger" onPress={clearHistory} /> : null}
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
});
