import { SpotifyTrack } from '@/lib/types';

export const MOCK_SPOTIFY_TRACKS: SpotifyTrack[] = [
  { id: 'mock-1', name: 'Fast Feet', artist: 'RopeFit Radio', bpm: 122, energy: 0.66, durationMs: 184000, uri: 'spotify:track:mock-1', source: 'mock' },
  { id: 'mock-2', name: 'Bounce Line', artist: 'Jump Club', bpm: 132, energy: 0.74, durationMs: 201000, uri: 'spotify:track:mock-2', source: 'mock' },
  { id: 'mock-3', name: 'Round Six', artist: 'Cadence Lab', bpm: 140, energy: 0.78, durationMs: 195000, uri: 'spotify:track:mock-3', source: 'mock' },
  { id: 'mock-4', name: 'High Knee Pulse', artist: 'Athletic State', bpm: 148, energy: 0.83, durationMs: 214000, uri: 'spotify:track:mock-4', source: 'mock' },
  { id: 'mock-5', name: 'Neon Skip', artist: 'Sweat Circuit', bpm: 156, energy: 0.87, durationMs: 189000, uri: 'spotify:track:mock-5', source: 'mock' },
  { id: 'mock-6', name: 'Sprint Bell', artist: 'HIIT Signal', bpm: 174, energy: 0.92, durationMs: 176000, uri: 'spotify:track:mock-6', source: 'mock' },
  { id: 'mock-7', name: 'Final Push', artist: 'Block Twenty', bpm: 184, energy: 0.95, durationMs: 168000, uri: 'spotify:track:mock-7', source: 'mock' },
  { id: 'mock-8', name: 'Strong Finish', artist: 'Bodyweight Beats', bpm: 128, energy: 0.81, durationMs: 205000, uri: 'spotify:track:mock-8', source: 'mock' },
  { id: 'mock-9', name: 'Warm Rope', artist: 'Tempo Crew', bpm: 116, energy: 0.58, durationMs: 198000, uri: 'spotify:track:mock-9', source: 'mock' },
  { id: 'mock-10', name: 'Clean Footwork', artist: 'Skipping Room', bpm: 145, energy: 0.8, durationMs: 221000, uri: 'spotify:track:mock-10', source: 'mock' },
];

export const BPM_RANGES = {
  warmup: { label: 'Warm-up', min: 110, max: 125 },
  normal: { label: 'Normal Jump', min: 125, max: 145 },
  intense: { label: 'Intense Jump', min: 145, max: 170 },
  sprint: { label: 'Sprint/HIIT', min: 170, max: 190 },
} as const;
