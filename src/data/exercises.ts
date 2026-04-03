export type Exercise = {
  id: string;
  name: string;
  day: "Push" | "Pull" | "Legs";
  targetWeight: number;
  targetReps: number;
  defaultWeight: number;
  defaultReps: number;
};

export const exercises: Exercise[] = [
  {
    id: "deadlift",
    name: "Deadlift",
    day: "Pull",
    targetWeight: 45,
    targetReps: 5,
    defaultWeight: 45,
    defaultReps: 5,
  },
  {
    id: "incline-bench",
    name: "Incline Bench Press",
    day: "Push",
    targetWeight: 40,
    targetReps: 6,
    defaultWeight: 40,
    defaultReps: 6,
  },
  {
    id: "back-squat",
    name: "Back Squat",
    day: "Legs",
    targetWeight: 52.5,
    targetReps: 5,
    defaultWeight: 52.5,
    defaultReps: 5,
  },
];

export function getExerciseById(id: string) {
  return exercises.find((exercise) => exercise.id === id);
}
