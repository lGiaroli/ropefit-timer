import { BPM_RANGES, MOCK_SPOTIFY_TRACKS } from './mockTracks';
import { SpotifyTrack, WorkoutIntensity } from '@/lib/types';

interface SpotifyApiTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  artists: Array<{ name: string }>;
  album?: {
    images?: Array<{ url: string }>;
  };
}

interface AudioFeature {
  id: string;
  tempo?: number;
  energy?: number;
}

interface SpotifyPlaylistItem {
  id: string;
  name: string;
}

export class SpotifyRecommendationService {
  constructor(private accessToken?: string) {}

  get isRealMode() {
    return Boolean(this.accessToken);
  }

  async getSpotifyTracksByBpmRange(intensity: WorkoutIntensity): Promise<SpotifyTrack[]> {
    const range = BPM_RANGES[intensity];

    if (!this.accessToken) {
      return this.getMockTracksByBpmRange(intensity);
    }

    try {
      const tracks = await this.fetchTopSavedAndPlaylistTracks();
      const enriched = await this.attachAudioFeatures(tracks);
      const filtered = enriched.filter((track) => track.bpm && track.bpm >= range.min && track.bpm <= range.max);

      if (filtered.length > 0) {
        return filtered.sort((a, b) => (a.bpm ?? 0) - (b.bpm ?? 0));
      }

      return this.getMockTracksByBpmRange(intensity);
    } catch {
      return this.getMockTracksByBpmRange(intensity);
    }
  }

  getMockTracksByBpmRange(intensity: WorkoutIntensity) {
    const range = BPM_RANGES[intensity];
    return MOCK_SPOTIFY_TRACKS.filter((track) => {
      const bpm = track.bpm ?? 0;
      return bpm >= range.min && bpm <= range.max;
    }).sort((a, b) => (a.bpm ?? 0) - (b.bpm ?? 0));
  }

  createProgressiveMockSession() {
    return [...MOCK_SPOTIFY_TRACKS]
      .sort((a, b) => (a.bpm ?? 0) - (b.bpm ?? 0))
      .filter((track) => (track.bpm ?? 0) >= 116 && (track.bpm ?? 0) <= 184);
  }

  async createSpotifyWorkoutPlaylist(tracks: SpotifyTrack[], name = 'RopeFit Jump Session') {
    if (!this.accessToken) {
      return {
        id: 'mock-ropefit-playlist',
        name,
        externalUrl: undefined,
        isMock: true,
      };
    }

    const playlist = await this.request<{ id: string; external_urls?: { spotify?: string } }>('/me/playlists', {
      method: 'POST',
      body: JSON.stringify({
        name,
        description: 'Sesión HIIT progresiva creada por RopeFit Timer.',
        public: false,
      }),
    });

    const uris = tracks.filter((track) => track.uri.startsWith('spotify:track:')).map((track) => track.uri);
    if (uris.length > 0) {
      await this.request(`/playlists/${playlist.id}/items`, {
        method: 'POST',
        body: JSON.stringify({ uris }),
      });
    }

    return {
      id: playlist.id,
      name,
      externalUrl: playlist.external_urls?.spotify,
      isMock: false,
    };
  }

  async startPlayback(trackOrPlaylistUri: string) {
    if (!this.accessToken) {
      return false;
    }

    await this.request('/me/player/play', {
      method: 'PUT',
      body: JSON.stringify(trackOrPlaylistUri.startsWith('spotify:playlist:') ? { context_uri: trackOrPlaylistUri } : { uris: [trackOrPlaylistUri] }),
    });
    return true;
  }

  private async fetchTopSavedAndPlaylistTracks() {
    const [topResponse, savedResponse, playlistTracks] = await Promise.all([
      this.request<{ items: SpotifyApiTrack[] }>('/me/top/tracks?limit=30&time_range=medium_term'),
      this.request<{ items: Array<{ track: SpotifyApiTrack }> }>('/me/tracks?limit=30'),
      this.fetchUserPlaylistTracks(),
    ]);

    const savedTracks = savedResponse.items.map((item) => item.track);
    const unique = new Map<string, SpotifyApiTrack>();
    [...topResponse.items, ...savedTracks, ...playlistTracks].forEach((track) => unique.set(track.id, track));
    return Array.from(unique.values()).map(this.mapTrack);
  }

  private async fetchUserPlaylistTracks() {
    try {
      const playlists = await this.request<{ items: SpotifyPlaylistItem[] }>('/me/playlists?limit=10');
      const playlistResponses = await Promise.all(
        playlists.items.slice(0, 5).map((playlist) =>
          this.request<{ items: Array<{ track?: SpotifyApiTrack | null }> }>(`/playlists/${playlist.id}/items?limit=20`),
        ),
      );

      return playlistResponses
        .flatMap((response) => response.items)
        .map((item) => item.track)
        .filter((track): track is SpotifyApiTrack => Boolean(track?.id && track.uri?.startsWith('spotify:track:')));
    } catch {
      return [];
    }
  }

  private async attachAudioFeatures(tracks: SpotifyTrack[]) {
    const ids = tracks.map((track) => track.id).filter(Boolean);
    if (ids.length === 0) {
      return tracks;
    }

    try {
      // Spotify may block Audio Features for newer apps; callers fall back to manual/mock BPM.
      const response = await this.request<{ audio_features: Array<AudioFeature | null> }>(`/audio-features?ids=${ids.slice(0, 100).join(',')}`);
      const features = new Map<string, AudioFeature>();
      response.audio_features.filter(Boolean).forEach((feature) => {
        if (feature?.id) {
          features.set(feature.id, feature);
        }
      });

      return tracks.map((track) => {
        const feature = features.get(track.id);
        return {
          ...track,
          bpm: feature?.tempo ? Math.round(feature.tempo) : track.bpm,
          energy: feature?.energy ?? track.energy,
        };
      });
    } catch {
      return tracks.map((track) => ({ ...track, bpm: undefined }));
    }
  }

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`https://api.spotify.com/v1${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Spotify API ${path} failed with ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }

  private mapTrack(track: SpotifyApiTrack): SpotifyTrack {
    return {
      id: track.id,
      name: track.name,
      artist: track.artists.map((artist) => artist.name).join(', '),
      durationMs: track.duration_ms,
      uri: track.uri,
      albumImage: track.album?.images?.[0]?.url,
      source: 'spotify',
    };
  }
}
