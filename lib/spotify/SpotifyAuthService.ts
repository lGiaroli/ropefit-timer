import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'ropefit.spotify.token';
const CLIENT_ID_KEY = 'ropefit.spotify.clientId';
const GITHUB_PAGES_BASE_PATH = '/ropefit-timer';

export interface SpotifyTokenSet {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export const SPOTIFY_SCOPES = [
  'user-read-private',
  'user-read-email',
  'user-top-read',
  'user-library-read',
  'playlist-read-private',
  'playlist-modify-public',
  'playlist-modify-private',
  'user-read-playback-state',
  'user-modify-playback-state',
];

export const spotifyDiscovery = {
  authorizationEndpoint: 'https://accounts.spotify.com/authorize',
  tokenEndpoint: 'https://accounts.spotify.com/api/token',
};

async function setTokenValue(value: string | null) {
  if (Platform.OS === 'web') {
    if (value === null) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    } else {
      await AsyncStorage.setItem(TOKEN_KEY, value);
    }
    return;
  }

  if (value === null) {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, value);
  }
}

async function getTokenValue() {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

export class SpotifyAuthService {
  static getEnvClientId() {
    return process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '';
  }

  static getClientId() {
    return SpotifyAuthService.getEnvClientId();
  }

  static async loadClientId() {
    const storedClientId = await AsyncStorage.getItem(CLIENT_ID_KEY);
    return storedClientId?.trim() || SpotifyAuthService.getEnvClientId();
  }

  static async saveClientId(clientId: string) {
    const value = clientId.trim();
    if (!value) {
      await AsyncStorage.removeItem(CLIENT_ID_KEY);
      return SpotifyAuthService.getEnvClientId();
    }
    await AsyncStorage.setItem(CLIENT_ID_KEY, value);
    return value;
  }

  static getRedirectUri() {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const basePath = window.location.pathname.startsWith(GITHUB_PAGES_BASE_PATH) ? GITHUB_PAGES_BASE_PATH : '';
      const origin =
        window.location.hostname === 'localhost'
          ? window.location.origin.replace('localhost', '127.0.0.1')
          : window.location.origin;
      return `${origin}${basePath}/spotify-auth`;
    }

    return AuthSession.makeRedirectUri({
      scheme: 'ropefit',
      path: 'spotify-auth',
    });
  }

  static getProductionRedirectUri() {
    return 'https://lgiaroli.github.io/ropefit-timer/spotify-auth';
  }

  static async saveTokenSet(tokenSet: SpotifyTokenSet) {
    await setTokenValue(JSON.stringify(tokenSet));
  }

  static async loadTokenSet(): Promise<SpotifyTokenSet | null> {
    const value = await getTokenValue();
    if (!value) {
      return null;
    }
    try {
      return JSON.parse(value) as SpotifyTokenSet;
    } catch {
      return null;
    }
  }

  static async logout() {
    await setTokenValue(null);
  }

  static async exchangeCodeAsync(code: string, codeVerifier: string, redirectUri: string, clientId = SpotifyAuthService.getClientId()) {
    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    const response = await fetch(spotifyDiscovery.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(await getSpotifyErrorMessage(response, 'Spotify token exchange failed'));
    }

    const token = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    const tokenSet: SpotifyTokenSet = {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt: Date.now() + token.expires_in * 1000,
    };
    await SpotifyAuthService.saveTokenSet(tokenSet);
    return tokenSet;
  }

  static async refreshAsync(tokenSet: SpotifyTokenSet, clientId = SpotifyAuthService.getClientId()) {
    if (!tokenSet.refreshToken) {
      return tokenSet;
    }

    const body = new URLSearchParams({
      client_id: clientId,
      grant_type: 'refresh_token',
      refresh_token: tokenSet.refreshToken,
    });

    const response = await fetch(spotifyDiscovery.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    if (!response.ok) {
      throw new Error(await getSpotifyErrorMessage(response, 'Spotify refresh failed'));
    }

    const token = (await response.json()) as {
      access_token: string;
      refresh_token?: string;
      expires_in: number;
    };

    const nextTokenSet: SpotifyTokenSet = {
      accessToken: token.access_token,
      refreshToken: token.refresh_token ?? tokenSet.refreshToken,
      expiresAt: Date.now() + token.expires_in * 1000,
    };
    await SpotifyAuthService.saveTokenSet(nextTokenSet);
    return nextTokenSet;
  }
}

async function getSpotifyErrorMessage(response: Response, fallback: string) {
  try {
    const payload = (await response.json()) as { error?: string; error_description?: string };
    const detail = [payload.error, payload.error_description].filter(Boolean).join(': ');
    return detail ? `${fallback} (${response.status}) ${detail}` : `${fallback} (${response.status})`;
  } catch {
    return `${fallback} (${response.status})`;
  }
}
