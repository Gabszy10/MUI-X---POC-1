export interface Lift {
  id: string
  name: string
  defaultSets?: number
  defaultReps?: number
}

const lifts: Lift[] = [
  { id: 'squat', name: 'Back Squat', defaultSets: 3, defaultReps: 5 },
  { id: 'deadlift', name: 'Deadlift', defaultSets: 3, defaultReps: 5 },
  { id: 'bench', name: 'Bench Press', defaultSets: 3, defaultReps: 5 },
  { id: 'overhead', name: 'Overhead Press', defaultSets: 3, defaultReps: 6 },
  { id: 'pendlay', name: 'Pendlay Row', defaultSets: 3, defaultReps: 8 },
  { id: 'pullup', name: 'Pull-up', defaultSets: 3, defaultReps: 8 },
  { id: 'dip', name: 'Dip', defaultSets: 3, defaultReps: 8 },
  { id: 'lunge', name: 'Walking Lunge', defaultSets: 3, defaultReps: 10 },
  { id: 'legcurl', name: 'Leg Curl', defaultSets: 3, defaultReps: 12 },
  { id: 'bicep', name: 'Barbell Curl', defaultSets: 3, defaultReps: 10 },
  { id: 'tricep', name: 'Tricep Pushdown', defaultSets: 3, defaultReps: 12 },
]

export default lifts
