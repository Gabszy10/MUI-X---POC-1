import defaultExerciseLibrary from "../data/exerciseLibrary.json";
import type { WorkoutType } from "./settings";

export type LibraryExercise = {
  id: number;
  name: string;
  type: WorkoutType;
};

const EXERCISE_LIBRARY_KEY = "exercise-library";

function normalizeLibrary(list: LibraryExercise[]) {
  return list.filter((entry) => entry.name && entry.type);
}

export function getExerciseLibrary(): LibraryExercise[] {
  const stored = window.localStorage.getItem(EXERCISE_LIBRARY_KEY);
  if (!stored) {
    const defaults = Object.entries(defaultExerciseLibrary).flatMap(([type, items]) =>
      (items as { id: number; name: string }[]).map((exercise) => ({
        ...exercise,
        type: type as WorkoutType,
      })),
    );
    return normalizeLibrary(defaults);
  }

  try {
    const parsed = JSON.parse(stored) as { exercises?: LibraryExercise[] } | LibraryExercise[];
    const list = Array.isArray(parsed) ? parsed : parsed.exercises ?? [];
    return normalizeLibrary(list);
  } catch {
    return [];
  }
}

export function saveExerciseLibrary(exercises: LibraryExercise[]) {
  window.localStorage.setItem(EXERCISE_LIBRARY_KEY, JSON.stringify({ exercises }));
}

export function getExercisesByType(type: WorkoutType) {
  return getExerciseLibrary().filter((exercise) => exercise.type === type);
}
