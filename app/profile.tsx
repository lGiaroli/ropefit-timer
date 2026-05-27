import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { AppScreen } from '@/components/ui/AppScreen';
import { Button } from '@/components/ui/Button';
import { RpgProfile } from '@/components/profile/RpgProfile';
import { colors, spacing } from '@/lib/theme';
import { useAppStore } from '@/store/AppStoreProvider';

export default function ProfileScreen() {
  const { config, history } = useAppStore();

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.header}>
        <Button title="" variant="ghost" onPress={() => router.back()} icon={<Feather name="chevron-left" size={22} color={colors.text} />} style={styles.backButton} />
        <View style={styles.headerCopy}>
          <Text style={styles.title}>RPG Profile</Text>
          <Text style={styles.subtitle}>XP, misiones, títulos y build atlética.</Text>
        </View>
      </View>

      <RpgProfile history={history} config={config} />

      <Button title="Ver dashboard técnico" variant="secondary" onPress={() => router.push('/dashboard')} icon={<Feather name="bar-chart-2" size={19} color={colors.cyan} />} />
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
