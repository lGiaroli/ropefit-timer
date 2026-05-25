import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { AppScreen } from '@/components/ui/AppScreen';
import { Button } from '@/components/ui/Button';
import { ProgressDashboard } from '@/components/workout/ProgressDashboard';
import { colors, spacing } from '@/lib/theme';
import { WorkoutConfig } from '@/lib/types';
import { useAppStore } from '@/store/AppStoreProvider';

export default function DashboardScreen() {
  const { config, history, updateConfig } = useAppStore();

  const applyRecommendation = async (nextConfig: WorkoutConfig) => {
    await updateConfig(nextConfig);
    router.push('/workout');
  };

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.header}>
        <Button title="" variant="ghost" onPress={() => router.back()} icon={<Feather name="chevron-left" size={22} color={colors.text} />} style={styles.backButton} />
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Progress Dashboard</Text>
          <Text style={styles.subtitle}>Progresión, racha, volumen semanal y consistencia.</Text>
        </View>
      </View>

      <ProgressDashboard history={history} config={config} onApplyRecommendation={applyRecommendation} />
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
