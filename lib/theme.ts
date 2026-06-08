import { WorkoutStepType } from './types';

export const colors = {
  background: '#05070a',
  backgroundSoft: '#0a0f14',
  surface: '#101820',
  surfaceRaised: '#17212b',
  surfaceLifted: '#1d2a35',
  border: '#243343',
  borderStrong: '#344657',
  text: '#f5f7fb',
  muted: '#a4afbf',
  subtle: '#687689',
  lime: '#b7ff2f',
  limeSoft: '#25380d',
  cyan: '#41d9ff',
  cyanSoft: '#083241',
  coral: '#ff6f61',
  coralSoft: '#451b19',
  amber: '#ffcf5a',
  amberSoft: '#342810',
  danger: '#ff4f6d',
  spotify: '#1ed760',
  white: '#ffffff',
  black: '#000000',
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 44,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
};

export function getPhaseColor(type: WorkoutStepType) {
  switch (type) {
    case 'jump':
      return colors.lime;
    case 'warmup':
      return colors.amber;
    case 'short_rest':
    case 'long_rest':
    case 'cooldown':
      return colors.cyan;
    case 'strength':
    case 'strength_rest':
      return colors.coral;
    case 'countdown':
      return colors.amber;
    default:
      return colors.lime;
  }
}

export function getPhaseSurface(type: WorkoutStepType) {
  switch (type) {
    case 'jump':
      return colors.limeSoft;
    case 'warmup':
      return '#3b2f11';
    case 'short_rest':
    case 'long_rest':
    case 'cooldown':
      return colors.cyanSoft;
    case 'strength':
    case 'strength_rest':
      return colors.coralSoft;
    default:
      return colors.surfaceRaised;
  }
}
