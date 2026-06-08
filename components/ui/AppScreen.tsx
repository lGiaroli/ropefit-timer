import { PropsWithChildren } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '@/lib/theme';

interface AppScreenProps extends PropsWithChildren {
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}

export function AppScreen({ children, scroll = true, style, contentStyle }: AppScreenProps) {
  if (!scroll) {
    return (
      <SafeAreaView style={[styles.root, style]}>
        <View style={styles.fixedViewport}>
          <View style={[styles.content, contentStyle]}>{children}</View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, style]}>
      <ScrollView contentContainerStyle={styles.scrollViewport} showsVerticalScrollIndicator={false}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollViewport: {
    alignItems: 'center',
    paddingBottom: spacing.xl,
  },
  fixedViewport: {
    flex: 1,
    alignItems: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 620,
    paddingHorizontal: spacing.lg,
    boxSizing: 'border-box',
  },
});
