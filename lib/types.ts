export type WorkoutLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type WorkoutStepType =
  | 'countdown'
  | 'warmup'
  | 'jump'
  | 'short_rest'
  | 'long_rest'
  | 'cooldown'
  | 'strength'
  | 'strength_rest'
  | 'complete';

export type WorkoutIntensity = 'warmup' | 'normal' | 'intense' | 'sprint';

export type WeightUnit = 'kg' | 'lb';
export type VoiceType = 'coach' | 'neutral' | 'calm';

export interface WorkoutConfig {
  id: string;
  name: string;
  blocks: number;
  roundsPerBlock: number;
  jumpSeconds: number;
  shortRestSeconds: number;
  longRestSeconds: number;
  warmupEnabled: boolean;
  warmupSeconds: number;
  cooldownEnabled: boolean;
  cooldownSeconds: number;
  progressionEnabled: boolean;
  strengthFinisherEnabled: boolean;
  strengthDuration: 8 | 10 | 12 | 15;
  level: WorkoutLevel;
}

export interface WorkoutStep {
  id: string;
  type: WorkoutStepType;
  duration: number;
  label: string;
  blockNumber?: number;
  roundNumber?: number;
  voiceCue?: string;
  beepEnabled: boolean;
  exerciseName?: string;
  exerciseInstruction?: string;
}

export interface CaloriesEstimate {
  low: number;
  high: number;
  label: string;
}

export interface WorkoutHistory {
  id: string;
  date: string;
  config: WorkoutConfig;
  completedBlocks: number;
  completedRounds: number;
  activeJumpSeconds: number;
  totalSeconds: number;
  caloriesEstimate: CaloriesEstimate;
  strengthCompleted: boolean;
  spotifyPlaylistId?: string;
}

export interface ProgressionRecommendation {
  title: string;
  reason: string;
  nextConfig: WorkoutConfig;
  weeklyJumpSeconds: number;
  completionRate: number;
  streakDays: number;
}

export interface WorkoutRunSummary {
  startedAt: number;
  completedBlocks: number;
  completedRounds: number;
  activeJumpSeconds: number;
  totalSeconds: number;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  bpm?: number;
  energy?: number;
  durationMs: number;
  uri: string;
  albumImage?: string;
  source?: 'mock' | 'spotify' | 'manual';
}

export interface AppSettings {
  weight: number;
  weightUnit: WeightUnit;
  voiceEnabled: boolean;
  voiceId?: string;
  voiceType: VoiceType;
  pipsEnabled: boolean;
  pipVolume: number;
  hapticsEnabled: boolean;
  finalCountdownEnabled: boolean;
  coachTipsEnabled: boolean;
  theme: 'dark' | 'light';
  spotifyConnected: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  instruction: string;
  level: WorkoutLevel;
}
