import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { colors, radii, spacing } from '@/lib/theme';
import { SpotifyTrack } from '@/lib/types';
import { msToMinutes } from '@/lib/format';

interface SpotifyTrackCardProps {
  track: SpotifyTrack;
}

export function SpotifyTrackCard({ track }: SpotifyTrackCardProps) {
  const openSpotify = () => {
    if (track.uri.startsWith('spotify:track:')) {
      Linking.openURL(track.uri).catch(() => undefined);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.artwork}>
        {track.albumImage ? <Image source={{ uri: track.albumImage }} style={styles.image} /> : <Feather name="music" size={20} color={colors.spotify} />}
      </View>
      <View style={styles.copy}>
        <Text style={styles.name} numberOfLines={1}>{track.name}</Text>
        <Text style={styles.artist} numberOfLines={1}>{track.artist}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.meta}>{track.bpm ? `${track.bpm} BPM` : 'BPM manual'}</Text>
          <Text style={styles.meta}>{track.energy ? `${Math.round(track.energy * 100)}% energía` : 'Energía n/d'}</Text>
          <Text style={styles.meta}>{msToMinutes(track.durationMs)} min</Text>
        </View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${track.name} en Spotify`} onPress={openSpotify} style={styles.openButton}>
        <Feather name="external-link" size={18} color={colors.black} />
      </Pressable>
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
  artwork: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  name: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
  },
  artist: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  meta: {
    color: colors.subtle,
    fontSize: 11,
    fontWeight: '800',
  },
  openButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.spotify,
  },
});
