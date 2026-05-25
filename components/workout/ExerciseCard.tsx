import { Pressable, StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors, radii, spacing } from '@/lib/theme';
import { Exercise } from '@/lib/types';

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  onReplace?: () => void;
}

export function ExerciseCard({ exercise, index, onReplace }: ExerciseCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.indexPill}>
        <Text style={styles.index}>{index + 1}</Text>
      </View>
      <View style={styles.copy}>
        <Text style={styles.name}>{exercise.name}</Text>
        <Text style={styles.instruction}>{exercise.instruction}</Text>
      </View>
      {onReplace ? (
        <Pressable accessibilityRole="button" accessibilityLabel={`Cambiar ${exercise.name}`} onPress={onReplace} style={styles.replaceButton}>
          <Feather name="repeat" size={17} color={colors.lime} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
  },
  indexPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.coralSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  index: {
    color: colors.coral,
    fontWeight: '900',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  instruction: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  replaceButton: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceRaised,
  },
});
