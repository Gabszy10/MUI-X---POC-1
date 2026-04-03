import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";

import SetLogger from "../components/SetLogger";
import { getExerciseById } from "../data/exercises";
import {
  getSetsForExerciseToday,
  getWorkoutHistory,
  getExerciseStatus,
  getPersonalRecord,
  saveWorkout,
  setExerciseStatus,
  setPersonalRecord,
  type LoggedSet,
} from "../utils/workouts";

function LogSet() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const routedExercise = location.state?.exercise as
    | { name?: string; id?: string; target?: string }
    | undefined;
  const focus = (location.state as { focus?: string } | undefined)?.focus;
  const exercise = getExerciseById(params.id ?? "") ?? {
    id: routedExercise?.id ?? "exercise",
    name: routedExercise?.name ?? "Exercise",
    defaultWeight: 40,
    defaultReps: 5,
  };

  const [weight, setWeight] = useState(exercise.defaultWeight);
  const [reps, setReps] = useState(exercise.defaultReps);
  const [rir, setRir] = useState(2);
  const [unit, setUnit] = useState<"kg" | "lb">("kg");
  const [previousSets, setPreviousSets] = useState<LoggedSet[]>(() =>
    getSetsForExerciseToday(exercise.name),
  );
  const [completeDialogOpen, setCompleteDialogOpen] = useState(false);
  const [pendingSetCount, setPendingSetCount] = useState(0);
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const historyRef = useRef<HTMLDivElement | null>(null);

  const workoutHistory = getWorkoutHistory(exercise.name);
  const prEntry = getPersonalRecord(exercise.name);

  useEffect(() => {
    if (focus === "history" && historyRef.current) {
      historyRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [focus]);

  const handleAdjustReps = (change: number) => {
    setReps((current) => Math.max(1, current + change));
  };

  const handleSave = () => {
    const nextSet = { weight, reps, rir, unit };
    saveWorkout(exercise.name, nextSet);
    setPreviousSets((current) => [...current, nextSet]);
    toast.success("Set saved");
    const nextCount = previousSets.length + 1;
    if (nextCount >= 3 && getExerciseStatus(exercise.name, todayKey) !== "done") {
      setPendingSetCount(nextCount);
      setCompleteDialogOpen(true);
    }
  };

  const handleMarkPr = (date: string, setIndex: number) => {
    setPersonalRecord(exercise.name, date, setIndex);
  };

  const handleMarkDone = () => {
    setExerciseStatus(exercise.name, todayKey, "done");
    setCompleteDialogOpen(false);
    navigate("/");
  };

  const formatShortDate = (dateString: string) => {
    const parsed = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return dateString;
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(parsed);
  };

  return (
    <Stack spacing={2}>
      <Button
        onClick={() => navigate("/")}
        startIcon={<ArrowBackRoundedIcon />}
        sx={{
          alignSelf: "flex-start",
          color: "#f8fafc",
          px: 0,
          minHeight: 40,
        }}
      >
        Back to Today
      </Button>

      <SetLogger
        exerciseName={exercise.name}
        setNumber={previousSets.length + 1}
        weight={weight}
        reps={reps}
        rir={rir}
        unit={unit}
        previousSets={previousSets}
        onSetWeight={setWeight}
        onAdjustReps={handleAdjustReps}
        onSelectRir={setRir}
        onSelectUnit={setUnit}
        onSave={handleSave}
      />

      <Box
        ref={historyRef}
        sx={{
          p: 2,
          borderRadius: "24px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontWeight: 700 }}>History</Typography>
          {prEntry ? (
            <Chip
              label={`PR ${formatShortDate(prEntry.date)}`}
              size="small"
              sx={{
                background: "rgba(139,211,168,0.12)",
                color: "#8bd3a8",
                fontWeight: 700,
              }}
            />
          ) : null}
        </Stack>

        <Stack spacing={1.2} sx={{ mt: 1.6 }}>
          {workoutHistory.length === 0 ? (
            <Typography sx={{ color: "rgba(255,255,255,0.56)" }}>
              No history yet for this exercise.
            </Typography>
          ) : (
            workoutHistory.map((workout) => (
              <Box
                key={`${workout.exercise}-${workout.date}`}
                sx={{
                  p: 1.4,
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <Typography sx={{ color: "rgba(255,255,255,0.62)", fontSize: "0.9rem" }}>
                  {formatShortDate(workout.date)}
                </Typography>
                <Stack spacing={0.8} sx={{ mt: 1 }}>
                  {workout.sets.map((set, index) => {
                    const isPr =
                      prEntry?.date === workout.date &&
                      prEntry.set.weight === set.weight &&
                      prEntry.set.reps === set.reps &&
                      prEntry.set.unit === set.unit;
                    return (
                      <Stack
                        key={`${workout.date}-${index}`}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                      >
                        <Typography>
                          {set.weight}{set.unit} x {set.reps}
                          {typeof set.rir === "number" ? ` • RIR ${set.rir}` : ""}
                        </Typography>
                        <Button
                          size="small"
                          variant={isPr ? "contained" : "outlined"}
                          onClick={() => handleMarkPr(workout.date, index)}
                          sx={{
                            minHeight: 32,
                            px: 1.2,
                            borderRadius: "12px",
                            textTransform: "none",
                            fontWeight: 700,
                            background: isPr ? "#8bd3a8" : "transparent",
                            color: isPr ? "#0b1013" : "#f8fafc",
                            borderColor: "rgba(255,255,255,0.2)",
                            "&:hover": {
                              background: isPr ? "#9be0b4" : "rgba(255,255,255,0.08)",
                            },
                          }}
                        >
                          {isPr ? "PR" : "Mark PR"}
                        </Button>
                      </Stack>
                    );
                  })}
                </Stack>
              </Box>
            ))
          )}
        </Stack>
      </Box>

      <Dialog
        open={completeDialogOpen}
        onClose={() => setCompleteDialogOpen(false)}
        PaperProps={{
          sx: {
            background: "linear-gradient(180deg, rgba(28,32,36,0.98) 0%, rgba(16,19,23,0.98) 100%)",
            borderRadius: "24px",
            color: "#f6f7fb",
            border: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Finish workout?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
            You&apos;ve logged {pendingSetCount} sets. Mark this exercise as done or continue to
            set {pendingSetCount + 1}?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setCompleteDialogOpen(false)}
            sx={{ color: "rgba(255,255,255,0.72)", textTransform: "none" }}
          >
            Continue
          </Button>
          <Button
            onClick={handleMarkDone}
            variant="contained"
            sx={{
              background: "#8bd3a8",
              color: "#0b1013",
              textTransform: "none",
              fontWeight: 800,
              borderRadius: "16px",
            }}
          >
            Mark done
          </Button>
        </DialogActions>
      </Dialog>

    </Stack>
  );
}

export default LogSet;
