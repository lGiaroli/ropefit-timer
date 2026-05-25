import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'ropefit.spotify.token';

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
  static getClientId() {
    return process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID ?? '';
  }

  static getRedirectUri() {
    return AuthSession.makeRedirectUri({
      scheme: 'ropefit',
      path: 'spotify-auth',
    });
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
      throw new Error(`Spotify token exchange failed with ${response.status}`);
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
      throw new Error(`Spotify refresh failed with ${response.status}`);
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
