export type WorkoutType = "push" | "pull" | "legs" | "cardio" | "rest";
export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type DaySchedule = {
  type: WorkoutType;
  exercises: number[];
};

const SHOW_TIMER_KEY = "showTimer";
const WEEKLY_SCHEDULE_KEY = "weeklySchedule";

const defaultSchedule: Record<Weekday, DaySchedule> = {
  monday: { type: "push", exercises: [] },
  tuesday: { type: "pull", exercises: [] },
  wednesday: { type: "legs", exercises: [] },
  thursday: { type: "rest", exercises: [] },
  friday: { type: "push", exercises: [] },
  saturday: { type: "cardio", exercises: [] },
  sunday: { type: "rest", exercises: [] },
};

export function getShowTimer(): boolean {
  const stored = window.localStorage.getItem(SHOW_TIMER_KEY);
  if (stored === null) {
    return true;
  }
  return stored === "true";
}

export function setShowTimer(nextValue: boolean) {
  window.localStorage.setItem(SHOW_TIMER_KEY, String(nextValue));
}

export function getSchedule(): Record<Weekday, DaySchedule> {
  const stored = window.localStorage.getItem(WEEKLY_SCHEDULE_KEY);
  if (!stored) {
    return { ...defaultSchedule };
  }

  try {
    const parsed = JSON.parse(stored) as Partial<
      Record<Weekday, WorkoutType | DaySchedule>
    >;
    const normalized = { ...defaultSchedule };
    (Object.keys(defaultSchedule) as Weekday[]).forEach((day) => {
      const entry = parsed[day];
      if (typeof entry === "string") {
        normalized[day] = { type: entry, exercises: [] };
        return;
      }
      if (entry && typeof entry === "object") {
        normalized[day] = {
          type: entry.type ?? defaultSchedule[day].type,
          exercises: Array.isArray(entry.exercises) ? entry.exercises : [],
        };
      }
    });
    return normalized;
  } catch {
    return { ...defaultSchedule };
  }
}

export function saveSchedule(schedule: Record<Weekday, DaySchedule>) {
  window.localStorage.setItem(WEEKLY_SCHEDULE_KEY, JSON.stringify(schedule));
}

export function getTodayWorkout(): WorkoutType | null {
  const schedule = getSchedule();
  const weekdayIndex = new Date().getDay();
  const weekdayMap: Weekday[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const key = weekdayMap[weekdayIndex];
  return key ? schedule[key].type : null;
}

export function getTodaySchedule(): DaySchedule | null {
  const schedule = getSchedule();
  const weekdayIndex = new Date().getDay();
  const weekdayMap: Weekday[] = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const key = weekdayMap[weekdayIndex];
  return key ? schedule[key] : null;
}

export const weekdayOrder: { key: Weekday; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export const workoutOptions: { value: WorkoutType; label: string }[] = [
  { value: "push", label: "Push" },
  { value: "pull", label: "Pull" },
  { value: "legs", label: "Legs" },
  { value: "cardio", label: "Cardio" },
  { value: "rest", label: "Rest" },
];

const defaultExerciseSelection: Record<WorkoutType, number[]> = {
  push: [1, 3],
  pull: [4, 6],
  legs: [7, 8],
  cardio: [10],
  rest: [],
};

export function getDefaultExercisesForType(type: WorkoutType) {
  return defaultExerciseSelection[type] ?? [];
}

type LibraryEntry = { id: number; type: WorkoutType };

export function pruneScheduleWithLibrary(library: LibraryEntry[]) {
  const byType = library.reduce<Record<WorkoutType, Set<number>>>(
    (acc, exercise) => {
      acc[exercise.type].add(exercise.id);
      return acc;
    },
    { push: new Set(), pull: new Set(), legs: new Set(), cardio: new Set(), rest: new Set() },
  );

  const current = getSchedule();
  const updated = { ...current };
  (Object.keys(updated) as Weekday[]).forEach((day) => {
    const type = updated[day].type;
    const allowed = byType[type] ?? new Set();
    updated[day] = {
      ...updated[day],
      exercises: updated[day].exercises.filter((id) => allowed.has(id)),
    };
  });
  saveSchedule(updated);
  return updated;
}
