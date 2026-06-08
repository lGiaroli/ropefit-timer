import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { AppScreen } from '@/components/ui/AppScreen';
import { colors, spacing } from '@/lib/theme';

WebBrowser.maybeCompleteAuthSession();

export default function SpotifyAuthCallbackScreen() {
  return (
    <AppScreen scroll={false} contentStyle={styles.content}>
      <View style={styles.panel}>
        <ActivityIndicator color={colors.spotify} />
        <Text style={styles.title}>Completando login con Spotify</Text>
        <Text style={styles.text}>Podes cerrar esta ventana si no vuelve sola a RopeFit Timer.</Text>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingTop: spacing.xl,
  },
  panel: {
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
  },
  title: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  text: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
