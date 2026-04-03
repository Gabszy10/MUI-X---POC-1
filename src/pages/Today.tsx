import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ExerciseCard from "../components/ExerciseCard";
import {
  getExerciseStatus,
  getLastPerformance,
  getPersonalRecord,
  getSetsForExerciseToday,
} from "../utils/workouts";
import {
  getDefaultExercisesForType,
  getShowTimer,
  getTodaySchedule,
} from "../utils/settings";
import { getExerciseLibrary } from "../utils/exerciseLibrary";

function formatLockDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatLockTime(date: Date) {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  return `${displayHours}:${String(minutes).padStart(2, "0")}`;
}

function formatLockSeconds(date: Date) {
  return String(date.getSeconds()).padStart(2, "0");
}

function formatStopwatch(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

type ExerciseStatus = "done" | "in-progress" | "ready";

function Today() {
  const navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());
  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [switchDialogOpen, setSwitchDialogOpen] = useState(false);
  const [pendingExerciseId, setPendingExerciseId] = useState<string | null>(null);
  const [stopwatchRunning, setStopwatchRunning] = useState(false);
  const [stopwatchMs, setStopwatchMs] = useState(0);
  const [showCurrentSets, setShowCurrentSets] = useState(true);
  const [showTimer, setShowTimer] = useState(() => getShowTimer());
  const todayKey = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todaySchedule = getTodaySchedule();
  const items = useMemo(() => {
    if (!todaySchedule) {
      return [] as {
        id: string;
        name: string;
        pr: ReturnType<typeof getPersonalRecord>;
        last: ReturnType<typeof getLastPerformance>;
        status: ExerciseStatus;
        setsToday: ReturnType<typeof getSetsForExerciseToday>;
      }[];
    }

    const library = getExerciseLibrary();
    const available = library.filter((exercise) => exercise.type === todaySchedule.type);
    const fallbackIds = getDefaultExercisesForType(todaySchedule.type);
    const selectedIds =
      todaySchedule.exercises.length > 0 ? todaySchedule.exercises : fallbackIds;
    const selected = available.filter((exercise) => selectedIds.includes(exercise.id));
    const finalSelection =
      selected.length > 0 ? selected : available.slice(0, Math.min(2, available.length));

    return finalSelection.map((exercise) => {
      const savedStatus = getExerciseStatus(exercise.name, todayKey);
      const setsToday = getSetsForExerciseToday(exercise.name);
      const computedStatus: ExerciseStatus =
        savedStatus === "done"
          ? "done"
          : setsToday.length > 0
            ? "in-progress"
            : "ready";

      return {
        id: `lib-${exercise.id}`,
        name: exercise.name,
        pr: getPersonalRecord(exercise.name),
        last: getLastPerformance(exercise.name),
        status: computedStatus,
        setsToday,
      };
    });
  }, [todaySchedule, todayKey]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!stopwatchRunning) {
      return undefined;
    }
    const interval = window.setInterval(() => {
      setStopwatchMs((prev) => prev + 100);
    }, 100);
    return () => window.clearInterval(interval);
  }, [stopwatchRunning]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === "showTimer") {
        setShowTimer(getShowTimer());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const safeExerciseIndex = items.length > 0 ? exerciseIndex % items.length : 0;
  const activeExercise = useMemo(
    () => items[safeExerciseIndex] ?? items[0],
    [safeExerciseIndex, items],
  );

  const activeInProgress = items.find(
    (item) => item.status === "in-progress" && item.setsToday.length > 0,
  );

  const handlePrevious = () => {
    if (items.length === 0) {
      return;
    }
    setExerciseIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    if (items.length === 0) {
      return;
    }
    setExerciseIndex((prev) => (prev + 1) % items.length);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) {
      return;
    }
    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = touchStartX - touchEndX;
    const threshold = 40;
    if (Math.abs(deltaX) > threshold) {
      if (deltaX > 0) {
        handleNext();
      } else {
        handlePrevious();
      }
    }
    setTouchStartX(null);
  };

  const currentDay = todaySchedule
    ? `${todaySchedule.type.charAt(0).toUpperCase()}${todaySchedule.type.slice(1)} Day`
    : "No workout scheduled";

  const activeSets = useMemo(() => activeExercise?.setsToday ?? [], [activeExercise]);
  const nextSetNumber = activeSets.length + 1;
  const activeStatus: ExerciseStatus = activeExercise?.status ?? "ready";
  const completedCount = items.filter((item) => item.status === "done").length;
  const totalCount = items.length;
  const progressRatio = totalCount > 0 ? completedCount / totalCount : 0;
  const progressColor =
    completedCount === 0
      ? "#a1a1aa"
      : completedCount < totalCount
        ? "#facc15"
        : "#4ade80";

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

  const handleStartExercise = (exerciseId: string) => {
    if (activeInProgress && activeInProgress.id !== exerciseId) {
      setPendingExerciseId(exerciseId);
      setSwitchDialogOpen(true);
      return;
    }
    navigate(`/exercise/${exerciseId}`, {
      state: { exercise: items.find((item) => item.id === exerciseId) },
    });
  };

  const handleConfirmSwitch = () => {
    if (!pendingExerciseId) {
      return;
    }
    navigate(`/exercise/${pendingExerciseId}`, {
      state: { exercise: items.find((item) => item.id === pendingExerciseId) },
    });
    setPendingExerciseId(null);
    setSwitchDialogOpen(false);
  };

  return (
    <Stack spacing={2.2}>
      <Box
        sx={{
          p: 2.4,
          borderRadius: "28px",
          background:
            "linear-gradient(160deg, rgba(31,42,49,0.98) 0%, rgba(16,19,24,0.98) 60%, rgba(13,15,18,0.98) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "0 28px 60px rgba(0,0,0,0.28)",
        }}
      >
        <Stack direction="row" spacing={{ xs: 1.5, sm: 2.5 }} alignItems="stretch">
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ mb: 1.6 }}>
              <Typography
                sx={{
                  fontSize: { xs: "0.9rem", sm: "1.05rem" },
                  letterSpacing: "0.12em",
                  color: "rgba(255,255,255,0.6)",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                {formatLockDate(now)}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "2.3rem", sm: "3.2rem" },
                  fontWeight: 800,
                  letterSpacing: "-0.04em",
                  lineHeight: 1,
                }}
              >
                {formatLockTime(now)}
                <Box
                  component="span"
                  sx={{
                    ml: 1,
                    fontSize: { xs: "0.95rem", sm: "1.15rem" },
                    color: "rgba(255,255,255,0.55)",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                  }}
                >
                  {formatLockSeconds(now)}
                </Box>
              </Typography>
            </Box>
            <Chip
              icon={<AutoAwesomeRoundedIcon />}
              label="Today's Workout"
              sx={{
                background: "rgba(255,255,255,0.08)",
                color: "#f8fafc",
                fontWeight: 700,
              }}
            />
            <Typography
              variant="h1"
              sx={{
                mt: 2,
                fontSize: "clamp(28px, 6vw, 40px)",
                lineHeight: 1.15,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textWrap: "balance",
              }}
            >
              {currentDay}
            </Typography>
          </Box>

          {showTimer ? (
            <Box
              sx={{
                flex: "0 0 38%",
                maxWidth: "38%",
                borderRadius: "20px",
                px: 1.2,
                py: 1.1,
                background:
                  "linear-gradient(180deg, rgba(12,16,20,0.9) 0%, rgba(8,10,12,0.95) 100%)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: stopwatchRunning
                  ? "0 0 10px rgba(34,197,94,0.16)"
                  : "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 120,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.6)",
                    fontWeight: 700,
                    textAlign: "center",
                  }}
                >
                  Timer
                </Typography>
                <Typography
                  sx={{
                    mt: 0.6,
                    fontSize: { xs: "1.35rem", sm: "1.5rem" },
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formatStopwatch(stopwatchMs)}
                </Typography>
              </Box>

              <Button
                onClick={() => {
                  if (stopwatchRunning) {
                    setStopwatchRunning(false);
                    setStopwatchMs(0);
                  } else {
                    setStopwatchRunning(true);
                  }
                }}
                variant="contained"
                sx={{
                  mt: 1,
                  minHeight: 30,
                  borderRadius: "10px",
                  background: stopwatchRunning ? "rgba(255,255,255,0.12)" : "#f3f5f7",
                  color: stopwatchRunning ? "#f8fafc" : "#0b1013",
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  "&:hover": {
                    background: stopwatchRunning ? "rgba(255,255,255,0.2)" : "#ffffff",
                  },
                }}
              >
                {stopwatchRunning ? "Stop & reset" : "Start"}
              </Button>
            </Box>
          ) : null}
        </Stack>
      </Box>

      <Stack spacing={1.2}>
        {items.length > 0 ? (
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography
              sx={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.45)", fontWeight: 600 }}
            >
              Exercises
            </Typography>
            <Stack spacing={0.4} alignItems="flex-end">
              <Typography sx={{ fontSize: "0.72rem", color: "rgba(255,255,255,0.4)" }}>
                Progress
              </Typography>
              <Typography sx={{ fontWeight: 700, color: progressColor }}>
                {completedCount} / {totalCount}
              </Typography>
              <Box
                sx={{
                  width: 72,
                  height: 4,
                  borderRadius: "999px",
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${Math.round(progressRatio * 100)}%`,
                    height: "100%",
                    background: progressColor,
                    transition: "width 200ms ease",
                  }}
                />
              </Box>
            </Stack>
          </Stack>
        ) : null}

        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            role="button"
            onClick={handlePrevious}
            sx={{
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              color: "#f8fafc",
              cursor: "pointer",
              userSelect: "none",
              "&:hover": { background: "rgba(255,255,255,0.16)" },
            }}
          >
            <ChevronLeftRoundedIcon />
          </Box>

          <Box
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            sx={{ flex: 1, display: "flex", flexDirection: "column" }}
          >
            {activeExercise ? (
              <Stack spacing={1.4} sx={{ flex: 1 }}>
                <ExerciseCard
                  name={activeExercise.name}
                  pr={
                    activeExercise.pr
                      ? `${activeExercise.pr.set.weight}${activeExercise.pr.set.unit} x ${activeExercise.pr.set.reps} (${formatShortDate(activeExercise.pr.date)})`
                      : "No PR tagged"
                  }
                  last={activeExercise.last}
                  insight=""
                  onStart={() => handleStartExercise(activeExercise.id)}
                  status={activeStatus}
                  expanded={!showCurrentSets}
                />
              </Stack>
            ) : (
              <Box
                sx={{
                  p: 2,
                  borderRadius: "20px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
                  No exercises scheduled for today.
                </Typography>
              </Box>
            )}
          </Box>

          <Box
            role="button"
            onClick={handleNext}
            sx={{
              width: 40,
              height: 40,
              display: "grid",
              placeItems: "center",
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              color: "#f8fafc",
              cursor: "pointer",
              userSelect: "none",
              "&:hover": { background: "rgba(255,255,255,0.16)" },
            }}
          >
            <ChevronRightRoundedIcon />
          </Box>
        </Stack>
      </Stack>

      <Stack spacing={1.2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontWeight: 700 }}>Current sets</Typography>
          <Chip
            label={showCurrentSets ? "Shown" : "Hidden"}
            onClick={() => setShowCurrentSets((prev) => !prev)}
            sx={{
              background: showCurrentSets ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.7)",
              fontWeight: 700,
              cursor: "pointer",
            }}
          />
        </Stack>

        <Collapse in={showCurrentSets} timeout={260} sx={{ width: "100%" }}>
          <Box
            sx={{
              p: 2,
              borderRadius: "24px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              transition: "all 240ms ease-in-out",
              transform: showCurrentSets ? "translateY(0px)" : "translateY(-6px)",
              opacity: showCurrentSets ? 1 : 0,
            }}
          >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography sx={{ mt: 0.6, color: "rgba(255,255,255,0.58)" }}>
                    {activeExercise ? activeExercise.name : "Select an exercise"}
                  </Typography>
                </Box>
                <Chip
                  label={activeStatus === "done" ? "Done" : `Set ${nextSetNumber}`}
                  size="small"
                  sx={{
                    background:
                      activeStatus === "done"
                        ? "rgba(34,197,94,0.12)"
                        : activeStatus === "in-progress"
                          ? "rgba(234,179,8,0.12)"
                          : "rgba(63,63,70,0.12)",
                    color:
                      activeStatus === "done"
                        ? "#4ade80"
                        : activeStatus === "in-progress"
                          ? "#facc15"
                          : "#a1a1aa",
                    fontWeight: 700,
                    transition: "all 220ms ease-in-out",
                  }}
                />
              </Stack>

              <Stack spacing={0.8} sx={{ mt: 1.5 }}>
                {activeSets.length === 0 ? (
                  <Typography sx={{ color: "rgba(255,255,255,0.56)" }}>
                    No sets logged yet today.
                  </Typography>
                ) : (
                  activeSets.map((set, index) => (
                    <Box
                      key={`${set.weight}-${set.reps}-${index}`}
                      sx={{
                        p: 1.1,
                        borderRadius: "16px",
                        background: "rgba(255,255,255,0.03)",
                        transition: "all 220ms ease-in-out",
                      }}
                    >
                      <Typography>
                        Set {index + 1}: {set.weight}{set.unit} x {set.reps}
                      </Typography>
                    </Box>
                  ))
                )}
              </Stack>
          </Box>
        </Collapse>
      </Stack>

      <Dialog
        open={switchDialogOpen}
        onClose={() => setSwitchDialogOpen(false)}
        PaperProps={{
          sx: {
            background:
              "linear-gradient(180deg, rgba(28,32,36,0.98) 0%, rgba(16,19,23,0.98) 100%)",
            borderRadius: "24px",
            color: "#f6f7fb",
            border: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Finish current exercise?</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
            {activeInProgress
              ? `You still have ${activeInProgress.name} in progress. Do you want to switch anyway?`
              : "You have an exercise in progress. Do you want to switch anyway?"}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setSwitchDialogOpen(false)}
            sx={{ color: "rgba(255,255,255,0.72)", textTransform: "none" }}
          >
            Stay
          </Button>
          <Button
            onClick={handleConfirmSwitch}
            variant="contained"
            sx={{
              background: "#f0f4f7",
              color: "#0b1013",
              textTransform: "none",
              fontWeight: 800,
              borderRadius: "16px",
            }}
          >
            Switch
          </Button>
        </DialogActions>
      </Dialog>

    </Stack>
  );
}

export default Today;
