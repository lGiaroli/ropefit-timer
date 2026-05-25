import { WorkoutStepType } from './types';

export const colors = {
  background: '#07090c',
  backgroundSoft: '#0c1117',
  surface: '#121820',
  surfaceRaised: '#171f29',
  border: '#263140',
  text: '#f5f7fb',
  muted: '#97a3b4',
  subtle: '#657184',
  lime: '#b8ff38',
  limeSoft: '#31440f',
  cyan: '#41d9ff',
  cyanSoft: '#0a3543',
  coral: '#ff6f61',
  coralSoft: '#4a1d1a',
  amber: '#ffcf5a',
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
