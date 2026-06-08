import { useEffect, useMemo, useState } from 'react';
import { router } from 'expo-router';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import Feather from '@expo/vector-icons/Feather';
import { SpotifyTrackCard } from '@/components/spotify/SpotifyTrackCard';
import { AppScreen } from '@/components/ui/AppScreen';
import { Button } from '@/components/ui/Button';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { BPM_RANGES } from '@/lib/spotify/mockTracks';
import { SPOTIFY_SCOPES, SpotifyAuthService, spotifyDiscovery, SpotifyTokenSet } from '@/lib/spotify/SpotifyAuthService';
import { SpotifyRecommendationService } from '@/lib/spotify/SpotifyRecommendationService';
import { colors, radii, spacing } from '@/lib/theme';
import { SpotifyTrack, WorkoutIntensity } from '@/lib/types';
import { useAppStore } from '@/store/AppStoreProvider';

WebBrowser.maybeCompleteAuthSession();

const intensityOptions: Array<{ label: string; value: WorkoutIntensity }> = [
  { label: 'Warm-up', value: 'warmup' },
  { label: 'Normal', value: 'normal' },
  { label: 'Intense', value: 'intense' },
  { label: 'Sprint', value: 'sprint' },
];

export default function SpotifyScreen() {
  const { settings, updateSettings } = useAppStore();
  const [intensity, setIntensity] = useState<WorkoutIntensity>('normal');
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [tokenSet, setTokenSet] = useState<SpotifyTokenSet | null>(null);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [playlistMessage, setPlaylistMessage] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [clientId, setClientId] = useState(SpotifyAuthService.getClientId());
  const [clientIdDraft, setClientIdDraft] = useState(SpotifyAuthService.getClientId());

  const redirectUri = SpotifyAuthService.getRedirectUri();
  const productionRedirectUri = SpotifyAuthService.getProductionRedirectUri();
  const service = useMemo(() => new SpotifyRecommendationService(tokenSet?.accessToken), [tokenSet?.accessToken]);

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId || 'missing-client-id',
      scopes: SPOTIFY_SCOPES,
      usePKCE: true,
      responseType: AuthSession.ResponseType.Code,
      redirectUri,
    },
    spotifyDiscovery,
  );

  useEffect(() => {
    SpotifyAuthService.loadClientId().then((storedClientId) => {
      setClientId(storedClientId);
      setClientIdDraft(storedClientId);
    });

    SpotifyAuthService.loadTokenSet().then(async (storedToken) => {
      if (!storedToken) {
        return;
      }
      try {
        const storedClientId = await SpotifyAuthService.loadClientId();
        const freshToken =
          storedToken.expiresAt - Date.now() < 60_000
            ? await SpotifyAuthService.refreshAsync(storedToken, storedClientId)
            : storedToken;
        setTokenSet(freshToken);
        updateSettings({ ...settings, spotifyConnected: true });
      } catch {
        await SpotifyAuthService.logout();
      }
    });
  }, []);

  useEffect(() => {
    if (response?.type !== 'success') {
      return;
    }

    const code = response.params.code;
    const codeVerifier = request?.codeVerifier;
    if (!code || !codeVerifier) {
      setAuthError('No se pudo completar PKCE. Probá iniciar sesión de nuevo.');
      return;
    }

    SpotifyAuthService.exchangeCodeAsync(code, codeVerifier, redirectUri, clientId)
      .then(async (nextTokenSet) => {
        setTokenSet(nextTokenSet);
        setAuthError(null);
        await updateSettings({ ...settings, spotifyConnected: true });
      })
      .catch((error) => {
        setAuthError(error instanceof Error ? error.message : 'Spotify rechazo el login. Revisa el Client ID y Redirect URI.');
      });
  }, [clientId, redirectUri, request?.codeVerifier, response]);

  useEffect(() => {
    if (response?.type !== 'error') {
      return;
    }

    setAuthError(getAuthResponseError(response));
  }, [response]);

  useEffect(() => {
    setLoadingTracks(true);
    service
      .getSpotifyTracksByBpmRange(intensity)
      .then(setTracks)
      .finally(() => setLoadingTracks(false));
  }, [intensity, service]);

  const connect = async () => {
    const cleanClientId = clientId.trim();
    if (!cleanClientId) {
      setAuthError('Pega tu Spotify Client ID y guardalo para activar OAuth real. Mientras tanto, usas musica mockeada.');
      return;
    }
    setAuthError(null);
    await promptAsync();
  };

  const saveClientId = async () => {
    const savedClientId = await SpotifyAuthService.saveClientId(clientIdDraft);
    setClientId(savedClientId);
    setClientIdDraft(savedClientId);
    setAuthError(
      savedClientId
        ? 'Client ID guardado. Ahora agrega el Redirect URI exacto en Spotify y toca Login.'
        : 'Client ID borrado. La pantalla vuelve a modo mock.',
    );
  };

  const disconnect = async () => {
    await SpotifyAuthService.logout();
    setTokenSet(null);
    await updateSettings({ ...settings, spotifyConnected: false });
  };

  const createPlaylist = async () => {
    setPlaylistMessage(null);
    const sourceTracks = service.isRealMode ? tracks : service.createProgressiveMockSession();
    const playlist = await service.createSpotifyWorkoutPlaylist(sourceTracks);
    setPlaylistMessage(
      playlist.isMock
        ? 'Playlist mock “RopeFit Jump Session” preparada. Con Spotify real se crea en tu cuenta.'
        : `Playlist creada: ${playlist.name}`,
    );
  };

  const range = BPM_RANGES[intensity];

  return (
    <AppScreen contentStyle={styles.content}>
      <View style={styles.header}>
        <Button title="" variant="ghost" onPress={() => router.back()} icon={<Feather name="chevron-left" size={22} color={colors.text} />} style={styles.backButton} />
        <View style={styles.headerCopy}>
          <Text style={styles.title}>Spotify Music</Text>
          <Text style={styles.subtitle}>Recomendaciones por BPM para saltar la soga.</Text>
        </View>
      </View>

      <View style={styles.authPanel}>
        <View style={styles.authText}>
          <Text style={styles.authTitle}>{tokenSet ? 'Spotify conectado' : 'Modo mock activo'}</Text>
          <Text style={styles.authDescription}>
            {tokenSet
              ? 'Leyendo top tracks, favoritos y playlists. Si Spotify no entrega BPM, podés usar BPM manual o la base local.'
              : 'El MVP ya recomienda canciones mockeadas. OAuth PKCE queda listo al configurar el Client ID.'}
          </Text>
        </View>
        <Button title={tokenSet ? 'Disconnect' : 'Login'} variant={tokenSet ? 'ghost' : 'spotify'} onPress={tokenSet ? disconnect : connect} disabled={!request && Boolean(clientId)} />
      </View>

      {authError ? <Text style={styles.error}>{authError}</Text> : null}

      <View style={styles.setupPanel}>
        <View style={styles.setupHeader}>
          <View style={styles.setupCopy}>
            <Text style={styles.setupTitle}>Spotify OAuth setup</Text>
            <Text style={styles.setupText}>El login real necesita un Client ID y este Redirect URI exacto en Spotify Dashboard.</Text>
          </View>
          <View style={[styles.statusPill, clientId ? styles.statusReady : styles.statusMissing]}>
            <Text style={styles.statusText}>{clientId ? 'Listo' : 'Falta ID'}</Text>
          </View>
        </View>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          inputMode="text"
          onChangeText={setClientIdDraft}
          placeholder="Spotify Client ID"
          placeholderTextColor={colors.subtle}
          style={styles.clientInput}
          value={clientIdDraft}
        />

        <Button title="Guardar Client ID" variant="secondary" onPress={saveClientId} icon={<Feather name="save" size={17} color={colors.spotify} />} />

        <View style={styles.uriBlock}>
          <Text style={styles.uriLabel}>Redirect URI actual</Text>
          <Text selectable style={styles.uriText}>
            {redirectUri}
          </Text>
        </View>

        {redirectUri !== productionRedirectUri ? (
          <View style={styles.uriBlock}>
            <Text style={styles.uriLabel}>Redirect URI para GitHub Pages</Text>
            <Text selectable style={styles.uriText}>
              {productionRedirectUri}
            </Text>
          </View>
        ) : null}

        <Text style={styles.setupHint}>
          En Spotify Development Mode, tu usuario debe estar agregado en Users Management. Para pruebas locales nuevas, abri la app con 127.0.0.1, no localhost.
        </Text>
      </View>

      <View style={styles.stack}>
        <Text style={styles.label}>Intensidad · {range.min}-{range.max} BPM</Text>
        <SegmentedControl value={intensity} onChange={setIntensity} options={intensityOptions} />
      </View>

      <View style={styles.playlistPanel}>
        <View style={styles.playlistCopy}>
          <Text style={styles.playlistTitle}>RopeFit Jump Session</Text>
          <Text style={styles.playlistText}>Orden progresivo: entrada moderada, medio intenso, últimos bloques sprint y fuerza final energética.</Text>
        </View>
        <Button title="Crear playlist" variant="secondary" onPress={createPlaylist} icon={<Feather name="plus-circle" size={18} color={colors.spotify} />} />
        {playlistMessage ? <Text style={styles.playlistMessage}>{playlistMessage}</Text> : null}
      </View>

      <View style={styles.noticePanel}>
        <Feather name="info" size={18} color={colors.cyan} />
        <Text style={styles.noticeText}>No se descarga ni almacena música. Si Spotify no permite obtener BPM para una canción, podés agregarlo manualmente.</Text>
      </View>

      <View style={styles.trackList}>
        {loadingTracks ? (
          <ActivityIndicator color={colors.lime} />
        ) : (
          tracks.map((track) => <SpotifyTrackCard key={track.id} track={track} />)
        )}
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
  authPanel: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  authText: {
    gap: spacing.xs,
  },
  authTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  authDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  stack: {
    gap: spacing.sm,
  },
  label: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '800',
  },
  playlistPanel: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.md,
  },
  playlistCopy: {
    gap: spacing.xs,
  },
  playlistTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '900',
  },
  playlistText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  playlistMessage: {
    color: colors.spotify,
    fontSize: 13,
    fontWeight: '800',
  },
  noticePanel: {
    borderRadius: radii.sm,
    backgroundColor: colors.cyanSoft,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  noticeText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  trackList: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  error: {
    color: colors.coral,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  setupPanel: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceRaised,
    padding: spacing.md,
    gap: spacing.md,
  },
  setupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  setupCopy: {
    flex: 1,
  },
  setupTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '900',
  },
  setupText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  statusReady: {
    backgroundColor: colors.limeSoft,
  },
  statusMissing: {
    backgroundColor: colors.coralSoft,
  },
  statusText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900',
  },
  clientInput: {
    minHeight: 52,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSoft,
    color: colors.text,
    paddingHorizontal: spacing.md,
    fontSize: 14,
    fontWeight: '700',
  },
  uriBlock: {
    borderRadius: radii.sm,
    backgroundColor: colors.backgroundSoft,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  uriLabel: {
    color: colors.spotify,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  uriText: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  setupHint: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
  },
});

function getAuthResponseError(response: AuthSession.AuthSessionResult) {
  if (response.type !== 'error') {
    return 'Spotify rechazo el login.';
  }

  const params = response.params ?? {};
  const detail = [response.error?.code, response.error?.description, params.error, params.error_description].filter(Boolean).join(': ');
  return detail || 'Spotify rechazo el login. Revisa el Client ID, Redirect URI y permisos del usuario.';
}
