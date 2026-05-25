import { Exercise, WorkoutLevel, WorkoutStep } from './types';

export const EXERCISES_BY_LEVEL: Record<WorkoutLevel, Exercise[]> = {
  Beginner: [
    { id: 'beginner-squat', name: 'Sentadillas', instruction: 'Pies firmes, bajá controlado y subí exhalando.', level: 'Beginner' },
    { id: 'beginner-knee-pushup', name: 'Flexiones con rodillas', instruction: 'Manos bajo hombros, cuerpo alineado, bajá corto y sólido.', level: 'Beginner' },
    { id: 'beginner-short-plank', name: 'Plancha corta', instruction: 'Codos debajo de hombros, abdomen activo, respiración pareja.', level: 'Beginner' },
    { id: 'beginner-glute-bridge', name: 'Puente de glúteos', instruction: 'Talones cerca, empujá cadera arriba y apretá glúteos.', level: 'Beginner' },
    { id: 'beginner-dead-bug', name: 'Dead bug', instruction: 'Espalda baja estable, alterná brazo y pierna sin apurarte.', level: 'Beginner' },
    { id: 'beginner-superman', name: 'Superman', instruction: 'Elevá pecho y piernas suave, mirada al piso.', level: 'Beginner' },
  ],
  Intermediate: [
    { id: 'intermediate-pushup', name: 'Flexiones', instruction: 'Cuerpo en línea, bajá con control y empujá fuerte.', level: 'Intermediate' },
    { id: 'intermediate-fast-squat', name: 'Sentadillas rápidas', instruction: 'Ritmo ágil, rodillas alineadas y pecho alto.', level: 'Intermediate' },
    { id: 'intermediate-lunge', name: 'Zancadas alternadas', instruction: 'Paso largo, rodilla estable, alterná con cadencia.', level: 'Intermediate' },
    { id: 'intermediate-plank', name: 'Plancha', instruction: 'Glúteos y abdomen firmes, no dejes caer la cadera.', level: 'Intermediate' },
    { id: 'intermediate-mountain', name: 'Mountain climbers', instruction: 'Rodillas al pecho, hombros firmes y ritmo constante.', level: 'Intermediate' },
    { id: 'intermediate-soft-burpee', name: 'Burpees suaves', instruction: 'Bajá, extendé piernas, volvé y saltá bajo.', level: 'Intermediate' },
  ],
  Advanced: [
    { id: 'advanced-burpee', name: 'Burpees', instruction: 'Movete fluido, salto vertical y aterrizaje suave.', level: 'Advanced' },
    { id: 'advanced-pushup', name: 'Push-ups', instruction: 'Pecho cerca del piso, empuje explosivo sin romper la línea.', level: 'Advanced' },
    { id: 'advanced-jump-squat', name: 'Jump squats', instruction: 'Sentadilla profunda, salto potente y caída silenciosa.', level: 'Advanced' },
    { id: 'advanced-shoulder-taps', name: 'Plank shoulder taps', instruction: 'Tocá hombros alternando, cadera quieta y abdomen duro.', level: 'Advanced' },
    { id: 'advanced-fast-mountain', name: 'Mountain climbers rápidos', instruction: 'Ritmo sprint, espalda firme y respiración corta.', level: 'Advanced' },
    { id: 'advanced-hollow', name: 'Hollow hold', instruction: 'Zona media encendida, hombros arriba y piernas extendidas.', level: 'Advanced' },
  ],
};

export function generateStrengthFinisher(
  level: WorkoutLevel,
  durationMinutes: 8 | 10 | 12 | 15,
  exercises = EXERCISES_BY_LEVEL[level],
): WorkoutStep[] {
  const workSeconds = 40;
  const restSeconds = 20;
  const segments = durationMinutes;
  const steps: WorkoutStep[] = [];

  for (let index = 0; index < segments; index += 1) {
    const exercise = exercises[index % exercises.length];
    const setNumber = Math.floor(index / exercises.length) + 1;

    steps.push({
      id: `strength-${index + 1}-work`,
      type: 'strength',
      duration: workSeconds,
      label: exercise.name,
      voiceCue: `Próximo ejercicio: ${exercise.name}. Trabajamos ${workSeconds} segundos.`,
      beepEnabled: true,
      exerciseName: exercise.name,
      exerciseInstruction: `${exercise.instruction} Vuelta ${setNumber}.`,
    });

    steps.push({
      id: `strength-${index + 1}-rest`,
      type: 'strength_rest',
      duration: restSeconds,
      label: `Descansamos ${restSeconds} segundos`,
      voiceCue: `Descansamos ${restSeconds} segundos.`,
      beepEnabled: true,
      exerciseName: exercise.name,
      exerciseInstruction: 'Respirá, sacudí brazos y prepará el próximo movimiento.',
    });
  }

  return steps;
}

export function replaceExerciseAtIndex(exercises: Exercise[], index: number, level: WorkoutLevel) {
  const pool = EXERCISES_BY_LEVEL[level];
  const current = exercises[index];
  const currentPoolIndex = pool.findIndex((exercise) => exercise.id === current?.id);
  const next = pool[(currentPoolIndex + 1 + pool.length) % pool.length];
  return exercises.map((exercise, exerciseIndex) => (exerciseIndex === index ? next : exercise));
}
