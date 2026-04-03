export type LoggedSet = {
  weight: number;
  reps: number;
  rir?: number;
  rpe?: number;
  unit: "kg" | "lb";
};

export type Workout = {
  date: string;
  exercise: string;
  sets: LoggedSet[];
};

const WORKOUTS_KEY = "workouts";
const PRS_KEY = "workout-prs";
const STATUS_KEY = "workout-status";
const SESSION_START_KEY = "workout-session-start";
const SESSION_LAST_ACTIVITY_KEY = "workout-session-last-activity";
const SESSION_DURATION_KEY = "workout-session-duration";

function isBrowser() {
  return typeof window !== "undefined";
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function getWorkouts(): Workout[] {
  if (!isBrowser()) {
    return [];
  }

  const stored = window.localStorage.getItem(WORKOUTS_KEY);
  if (!stored) {
    return [];
  }

  try {
    return JSON.parse(stored) as Workout[];
  } catch {
    return [];
  }
}

type StoredStatus = "done" | "in-progress";

function getStatusMap(): Record<string, StoredStatus> {
  if (!isBrowser()) {
    return {};
  }
  const stored = window.localStorage.getItem(STATUS_KEY);
  if (!stored) {
    return {};
  }
  try {
    return JSON.parse(stored) as Record<string, StoredStatus>;
  } catch {
    return {};
  }
}

function buildStatusKey(exerciseName: string, date: string) {
  return `${exerciseName}__${date}`;
}

export function getExerciseStatus(exerciseName: string, date: string): StoredStatus | null {
  const map = getStatusMap();
  return map[buildStatusKey(exerciseName, date)] ?? null;
}

export function setExerciseStatus(
  exerciseName: string,
  date: string,
  status: StoredStatus,
) {
  if (!isBrowser()) {
    return;
  }
  const next = { ...getStatusMap(), [buildStatusKey(exerciseName, date)]: status };
  window.localStorage.setItem(STATUS_KEY, JSON.stringify(next));
}

export function getWorkoutHistory(exerciseName: string) {
  return getWorkouts()
    .filter((workout) => workout.exercise === exerciseName)
    .sort((left, right) => right.date.localeCompare(left.date));
}

type StoredPr = {
  date: string;
  setIndex: number;
};

function getPrMap(): Record<string, StoredPr> {
  if (!isBrowser()) {
    return {};
  }
  const stored = window.localStorage.getItem(PRS_KEY);
  if (!stored) {
    return {};
  }
  try {
    return JSON.parse(stored) as Record<string, StoredPr>;
  } catch {
    return {};
  }
}

function getSessionStartMap(): Record<string, number> {
  if (!isBrowser()) {
    return {};
  }
  const stored = window.localStorage.getItem(SESSION_START_KEY);
  if (!stored) {
    return {};
  }
  try {
    return JSON.parse(stored) as Record<string, number>;
  } catch {
    return {};
  }
}

function getSessionLastActivityMap(): Record<string, number> {
  if (!isBrowser()) {
    return {};
  }
  const stored = window.localStorage.getItem(SESSION_LAST_ACTIVITY_KEY);
  if (!stored) {
    return {};
  }
  try {
    return JSON.parse(stored) as Record<string, number>;
  } catch {
    return {};
  }
}

function getSessionDurationMap(): Record<string, number> {
  if (!isBrowser()) {
    return {};
  }
  const stored = window.localStorage.getItem(SESSION_DURATION_KEY);
  if (!stored) {
    return {};
  }
  try {
    return JSON.parse(stored) as Record<string, number>;
  } catch {
    return {};
  }
}

export function getSessionStartTimestamp(date: string) {
  const map = getSessionStartMap();
  return map[date] ?? null;
}

export function setSessionStartTimestamp(date: string, timestamp: number) {
  if (!isBrowser()) {
    return;
  }
  const next = { ...getSessionStartMap(), [date]: timestamp };
  window.localStorage.setItem(SESSION_START_KEY, JSON.stringify(next));
}

export function getSessionLastActivityTimestamp(date: string) {
  const map = getSessionLastActivityMap();
  return map[date] ?? null;
}

export function setSessionLastActivityTimestamp(date: string, timestamp: number) {
  if (!isBrowser()) {
    return;
  }
  const next = { ...getSessionLastActivityMap(), [date]: timestamp };
  window.localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, JSON.stringify(next));
}

export function getSessionDurationMs(date: string) {
  const map = getSessionDurationMap();
  return map[date] ?? null;
}

export function endSession(date: string, endedAt: number = Date.now()) {
  if (!isBrowser()) {
    return;
  }
  const start = getSessionStartTimestamp(date);
  if (!start) {
    return;
  }
  const duration = Math.max(0, endedAt - start);
  const nextDuration = { ...getSessionDurationMap(), [date]: duration };
  window.localStorage.setItem(SESSION_DURATION_KEY, JSON.stringify(nextDuration));

  const remainingStarts = { ...getSessionStartMap() };
  delete remainingStarts[date];
  window.localStorage.setItem(SESSION_START_KEY, JSON.stringify(remainingStarts));

  const remainingActivity = { ...getSessionLastActivityMap() };
  delete remainingActivity[date];
  window.localStorage.setItem(SESSION_LAST_ACTIVITY_KEY, JSON.stringify(remainingActivity));
}

export function setPersonalRecord(exerciseName: string, date: string, setIndex: number) {
  if (!isBrowser()) {
    return;
  }
  const next = { ...getPrMap(), [exerciseName]: { date, setIndex } };
  window.localStorage.setItem(PRS_KEY, JSON.stringify(next));
}

export function getPersonalRecord(exerciseName: string) {
  const map = getPrMap();
  const stored = map[exerciseName];
  if (!stored) {
    return null;
  }
  const workout = getWorkouts().find(
    (entry) => entry.exercise === exerciseName && entry.date === stored.date,
  );
  const set = workout?.sets[stored.setIndex];
  if (!workout || !set) {
    return null;
  }
  return { date: workout.date, set };
}

export function saveWorkout(exercise: string, set: LoggedSet) {
  const workouts = getWorkouts();
  const date = todayKey();
  if (!getSessionStartTimestamp(date)) {
    setSessionStartTimestamp(date, Date.now());
  }
  setSessionLastActivityTimestamp(date, Date.now());
  const existingIndex = workouts.findIndex(
    (workout) => workout.date === date && workout.exercise === exercise,
  );

  if (existingIndex >= 0) {
    const updated = workouts.map((workout, index) =>
      index === existingIndex
        ? { ...workout, sets: [...workout.sets, set] }
        : workout,
    );
    window.localStorage.setItem(WORKOUTS_KEY, JSON.stringify(updated));
    return updated;
  }

  const next = [...workouts, { date, exercise, sets: [set] }];
  window.localStorage.setItem(WORKOUTS_KEY, JSON.stringify(next));
  return next;
}

export function getLastPerformance(exerciseName: string) {
  const workouts = getWorkouts()
    .filter((workout) => workout.exercise === exerciseName && workout.sets.length > 0)
    .sort((left, right) => right.date.localeCompare(left.date));

  if (workouts.length === 0) {
    return "No data";
  }

  const lastSet = workouts[0].sets[workouts[0].sets.length - 1];
  return `${lastSet.weight}${lastSet.unit} x ${lastSet.reps}`;
}

export function getSetsForExerciseToday(exerciseName: string) {
  const todayWorkout = getWorkouts().find(
    (workout) => workout.exercise === exerciseName && workout.date === todayKey(),
  );
  return todayWorkout?.sets ?? [];
}
