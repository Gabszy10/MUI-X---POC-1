import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AutoGraphRoundedIcon from "@mui/icons-material/AutoGraphRounded";
import EmojiEventsRoundedIcon from "@mui/icons-material/EmojiEventsRounded";
import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import HistoryRoundedIcon from "@mui/icons-material/HistoryRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import ModeEditOutlineRoundedIcon from "@mui/icons-material/ModeEditOutlineRounded";

import seedData from "../data/gymData.json";

type ExercisePlan = {
  exerciseId: string;
  name: string;
  targetLabel: string;
  repRange: [number, number];
  incrementKg: number;
  type: "main" | "backoff" | "support" | "accessory";
};

type TrainingDay = {
  id: string;
  label: string;
  name: string;
  focus: string;
  mainLiftExerciseId: string;
  exercises: ExercisePlan[];
};

type LoggedSet = {
  exerciseId: string;
  weightKg: number;
  reps: number;
  rpe: number;
};

type WorkoutSession = {
  id: string;
  date: string;
  dayId: string;
  notes: string;
  sets: LoggedSet[];
};

type GymData = {
  days: TrainingDay[];
  history: WorkoutSession[];
};

type ProgressionTarget = {
  weightKg: number;
  reps: number;
  reason: string;
};

const STORAGE_KEY = "gym-dashboard-json-db";

function createSessionId() {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `session-${Date.now()}`;
}

function formatSet(set: LoggedSet) {
  return `${set.weightKg}kg x ${set.reps} @ RPE ${set.rpe}`;
}

function estimateOneRepMax(set: LoggedSet) {
  return set.weightKg * (1 + set.reps / 30);
}

function roundToDisplay(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function sortSessionsDescending(history: WorkoutSession[]) {
  return [...history].sort((left, right) => right.date.localeCompare(left.date));
}

function formatDateWithDay(dateString: string) {
  const parsed = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return dateString;
  }
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function formatLockDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatLockTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function getLatestSet(history: WorkoutSession[], exerciseId: string) {
  const sessions = sortSessionsDescending(history);
  for (const session of sessions) {
    const match = [...session.sets]
      .reverse()
      .find((set) => set.exerciseId === exerciseId);
    if (match) {
      return { set: match, date: session.date };
    }
  }
  return null;
}

function getTopSetForExercise(history: WorkoutSession[], exerciseId: string) {
  const allSets = history.flatMap((session) =>
    session.sets
      .filter((set) => set.exerciseId === exerciseId)
      .map((set) => ({ ...set, date: session.date })),
  );

  if (allSets.length === 0) {
    return null;
  }

  return allSets.reduce((best, current) => {
    const bestScore = estimateOneRepMax(best);
    const currentScore = estimateOneRepMax(current);
    if (currentScore !== bestScore) {
      return currentScore > bestScore ? current : best;
    }
    if (current.weightKg !== best.weightKg) {
      return current.weightKg > best.weightKg ? current : best;
    }
    return current.reps > best.reps ? current : best;
  });
}

function getProgressionTarget(
  plan: ExercisePlan,
  latestSet: LoggedSet | null,
): ProgressionTarget {
  const [minReps, maxReps] = plan.repRange;

  if (!latestSet) {
    return {
      weightKg: plan.type === "accessory" ? plan.incrementKg * 4 : plan.incrementKg * 8,
      reps: minReps,
      reason: "First logged target for this lift.",
    };
  }

  if (latestSet.reps < maxReps) {
    return {
      weightKg: latestSet.weightKg,
      reps: Math.min(latestSet.reps + 1, maxReps),
      reason: "Add 1 rep before increasing load.",
    };
  }

  return {
    weightKg: latestSet.weightKg + plan.incrementKg,
    reps: minReps,
    reason: "Rep ceiling hit, so move the weight up.",
  };
}

function findOrCreateSession(
  history: WorkoutSession[],
  date: string,
  dayId: string,
) {
  const existing = history.find(
    (session) => session.date === date && session.dayId === dayId,
  );

  if (existing) {
    return { session: existing, created: false };
  }

  return {
    session: {
      id: createSessionId(),
      date,
      dayId,
      notes: "",
      sets: [],
    },
    created: true,
  };
}

function loadInitialData() {
  if (typeof window === "undefined") {
    return seedData as GymData;
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return seedData as GymData;
  }

  try {
    return JSON.parse(saved) as GymData;
  } catch {
    return seedData as GymData;
  }
}

function DashboardCard({
  children,
  sx = {},
}: {
  children: ReactNode;
  sx?: object;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "30px",
        background:
          "linear-gradient(180deg, rgba(31,34,39,0.98) 0%, rgba(18,21,25,0.96) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow:
          "0 24px 60px rgba(0,0,0,0.32), inset 0 1px 0 rgba(255,255,255,0.04)",
        color: "#f6f7fb",
        overflow: "hidden",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

export default function GymDashboard() {
  const [gymData, setGymData] = useState<GymData>(() => loadInitialData());
  const [selectedDayId, setSelectedDayId] = useState(gymData.days[0]?.id ?? "");
  const [logDialogOpen, setLogDialogOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [logDate, setLogDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [now, setNow] = useState(() => new Date());
  const [logDraft, setLogDraft] = useState({
    exerciseId: "",
    weightKg: "",
    reps: "",
    rpe: "",
  });
  const [noteDraft, setNoteDraft] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(gymData));
  }, [gymData]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const today = useMemo(
    () => new Date().toISOString().slice(0, 10),
    [],
  );

  const currentDay = useMemo(
    () => gymData.days.find((day) => day.id === selectedDayId) ?? gymData.days[0],
    [gymData.days, selectedDayId],
  );

  const mainLift = useMemo(
    () =>
      currentDay?.exercises.find(
        (exercise) => exercise.exerciseId === currentDay.mainLiftExerciseId,
      ) ?? currentDay?.exercises[0],
    [currentDay],
  );

  const todaySession = useMemo(() => {
    if (!currentDay) {
      return null;
    }
    return (
      gymData.history.find(
        (session) => session.date === today && session.dayId === currentDay.id,
      ) ?? null
    );
  }, [currentDay, gymData.history, today]);

  const latestDaySession = useMemo(() => {
    if (!currentDay) {
      return null;
    }
    return (
      sortSessionsDescending(
        gymData.history.filter((session) => session.dayId === currentDay.id),
      )[0] ?? null
    );
  }, [currentDay, gymData.history]);

  const exerciseSummaries = useMemo(() => {
    if (!currentDay) {
      return [];
    }

    return currentDay.exercises.map((exercise) => {
      const latest = getLatestSet(gymData.history, exercise.exerciseId);
      const pr = getTopSetForExercise(gymData.history, exercise.exerciseId);
      const progression = getProgressionTarget(exercise, latest?.set ?? null);
      const loggedToday = todaySession?.sets.filter(
        (set) => set.exerciseId === exercise.exerciseId,
      ) ?? [];

      return {
        exercise,
        latest,
        pr,
        progression,
        loggedToday,
      };
    });
  }, [currentDay, gymData.history, todaySession]);

  const totalSetsToday = todaySession?.sets.length ?? 0;
  const mainLiftSummary = exerciseSummaries.find(
    (summary) => summary.exercise.exerciseId === currentDay?.mainLiftExerciseId,
  );

  const recentNotes = useMemo(
    () =>
      sortSessionsDescending(gymData.history).filter((session) => session.notes.trim()),
    [gymData.history],
  );

  const handleOpenLogDialog = (exerciseId?: string) => {
    const preferredExercise =
      exerciseId ?? currentDay?.mainLiftExerciseId ?? currentDay?.exercises[0]?.exerciseId ?? "";

    const currentSummary = exerciseSummaries.find(
      (summary) => summary.exercise.exerciseId === preferredExercise,
    );

    setLogDraft({
      exerciseId: preferredExercise,
      weightKg: currentSummary ? String(currentSummary.progression.weightKg) : "",
      reps: currentSummary ? String(currentSummary.progression.reps) : "",
      rpe: "8",
    });
    setLogDate(today);
    setLogDialogOpen(true);
  };

  const handleSaveSet = () => {
    if (!currentDay || !logDraft.exerciseId) {
      return;
    }

    const weightKg = Number(logDraft.weightKg);
    const reps = Number(logDraft.reps);
    const rpe = Number(logDraft.rpe);

    if (
      Number.isNaN(weightKg) ||
      Number.isNaN(reps) ||
      Number.isNaN(rpe) ||
      weightKg <= 0 ||
      reps <= 0 ||
      rpe <= 0
    ) {
      return;
    }

    setGymData((prev) => {
      const { session, created } = findOrCreateSession(prev.history, logDate, currentDay.id);
      const updatedSession: WorkoutSession = {
        ...session,
        sets: [
          ...session.sets,
          {
            exerciseId: logDraft.exerciseId,
            weightKg,
            reps,
            rpe,
          },
        ],
      };

      return {
        ...prev,
        history: created
          ? [...prev.history, updatedSession]
          : prev.history.map((item) => (item.id === session.id ? updatedSession : item)),
      };
    });

    setLogDialogOpen(false);
  };

  const handleOpenNotesDialog = () => {
    setNoteDraft(todaySession?.notes ?? "");
    setNotesDialogOpen(true);
  };

  const handleSaveNotes = () => {
    if (!currentDay) {
      return;
    }

    setGymData((prev) => {
      const { session, created } = findOrCreateSession(prev.history, today, currentDay.id);
      const updatedSession: WorkoutSession = {
        ...session,
        notes: noteDraft.trim(),
      };

      return {
        ...prev,
        history: created
          ? [...prev.history, updatedSession]
          : prev.history.map((item) => (item.id === session.id ? updatedSession : item)),
      };
    });

    setNotesDialogOpen(false);
  };

  if (!currentDay) {
    return null;
  }

  return (
    <Box
      sx={{
        minHeight: "100svh",
        background:
          "radial-gradient(circle at top, rgba(56,72,81,0.34) 0%, rgba(10,13,16,0.98) 38%, #060708 100%)",
        color: "#fff",
        px: { xs: 2, sm: 3.5 },
        py: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1100,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2.2,
        }}
      >
        <Box
          sx={{
            px: { xs: 0.5, sm: 1 },
            pt: { xs: 0.5, sm: 1 },
          }}
        >
          <Typography
            sx={{
              fontSize: "1.05rem",
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
              fontSize: { xs: "3rem", sm: "3.6rem" },
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "#ffffff",
            }}
          >
            {formatLockTime(now)}
          </Typography>
        </Box>

        <DashboardCard
          sx={{
            background:
              "linear-gradient(135deg, rgba(42,56,64,0.98) 0%, rgba(18,23,28,0.98) 58%, rgba(14,17,20,0.98) 100%)",
          }}
        >
          <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              spacing={2.5}
            >
              <Box sx={{ maxWidth: 560 }}>
                <Chip
                  label="JSON-backed training dashboard"
                  sx={{
                    mb: 2,
                    background: "rgba(255,255,255,0.08)",
                    color: "#f6f7fb",
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                  }}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: "2.3rem", sm: "3.4rem" },
                    lineHeight: 0.95,
                    fontWeight: 800,
                    letterSpacing: "-0.06em",
                  }}
                >
                  {currentDay.label} {String.fromCharCode(8212)} {currentDay.name.toUpperCase()}
                </Typography>
                <Typography
                  sx={{
                    mt: 1.4,
                    fontSize: { xs: "1rem", sm: "1.2rem" },
                    color: "rgba(255,255,255,0.72)",
                    maxWidth: 500,
                  }}
                >
                  Open the app, see today&apos;s lift targets, log sets fast, and let the
                  next session suggest itself.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2.2 }}>
                  <Chip
                    icon={<FitnessCenterRoundedIcon />}
                    label={`Main lift: ${mainLift?.name ?? "N/A"}`}
                    sx={{
                      background: "rgba(255,255,255,0.08)",
                      color: "#f6f7fb",
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    icon={<InsightsRoundedIcon />}
                    label={currentDay.focus}
                    sx={{
                      background: "rgba(255,255,255,0.08)",
                      color: "#f6f7fb",
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              </Box>

              <Stack
                spacing={1.5}
                sx={{
                  width: { xs: "100%", md: 330 },
                  alignSelf: "stretch",
                  justifyContent: "center",
                }}
              >
                <DashboardCard sx={{ background: "rgba(8,10,12,0.3)" }}>
                  <Box sx={{ p: 2.4 }}>
                    <Typography sx={{ color: "rgba(255,255,255,0.62)", fontSize: "0.92rem" }}>
                      Today&apos;s main target
                    </Typography>
                    <Typography sx={{ mt: 0.8, fontSize: "1.8rem", fontWeight: 800, lineHeight: 1 }}>
                      {mainLiftSummary
                        ? `${roundToDisplay(mainLiftSummary.progression.weightKg)}kg x ${mainLiftSummary.progression.reps}`
                        : "No target yet"}
                    </Typography>
                    <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.62)" }}>
                      {mainLiftSummary?.progression.reason ?? "Add history to unlock progression."}
                    </Typography>
                  </Box>
                </DashboardCard>

                <Stack direction="row" spacing={1.5}>
                  <DashboardCard sx={{ flex: 1, background: "rgba(8,10,12,0.25)" }}>
                    <Box sx={{ p: 2.2 }}>
                      <Typography sx={{ color: "rgba(255,255,255,0.62)", fontSize: "0.92rem" }}>
                        Sets today
                      </Typography>
                      <Typography sx={{ mt: 0.6, fontSize: "2rem", fontWeight: 800 }}>
                        {totalSetsToday}
                      </Typography>
                    </Box>
                  </DashboardCard>
                  <DashboardCard sx={{ flex: 1, background: "rgba(8,10,12,0.25)" }}>
                    <Box sx={{ p: 2.2 }}>
                      <Typography sx={{ color: "rgba(255,255,255,0.62)", fontSize: "0.92rem" }}>
                        Last session
                      </Typography>
                      <Typography sx={{ mt: 0.6, fontSize: "1.15rem", fontWeight: 700 }}>
                        {latestDaySession ? formatDateWithDay(latestDaySession.date) : "No data"}
                      </Typography>
                    </Box>
                  </DashboardCard>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </DashboardCard>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          {gymData.days.map((day) => (
            <Chip
              key={day.id}
              label={`${day.label} ${String.fromCharCode(8226)} ${day.name}`}
              onClick={() => setSelectedDayId(day.id)}
              sx={{
                px: 1,
                py: 2.6,
                borderRadius: "999px",
                background:
                  day.id === currentDay.id ? "#f0f4f7" : "rgba(255,255,255,0.06)",
                color: day.id === currentDay.id ? "#0b1013" : "#f6f7fb",
                fontWeight: 700,
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            />
          ))}
        </Stack>

        <Stack direction={{ xs: "column", lg: "row" }} spacing={2.2} alignItems="stretch">
          <DashboardCard sx={{ flex: 1.45 }}>
            <Box sx={{ p: { xs: 2.4, sm: 3 } }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ sm: "center" }}
              >
                <Box>
                  <Typography sx={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>
                    Today&apos;s workout
                  </Typography>
                  <Typography sx={{ mt: 0.8, color: "rgba(255,255,255,0.58)" }}>
                    Targets come from your local JSON seed plus the sets you&apos;ve logged in
                    this browser.
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1.2}>
                  <Button
                    variant="outlined"
                    onClick={handleOpenNotesDialog}
                    startIcon={<ModeEditOutlineRoundedIcon />}
                    sx={{
                      borderColor: "rgba(255,255,255,0.2)",
                      color: "#f6f7fb",
                      textTransform: "none",
                      borderRadius: "16px",
                      px: 2,
                    }}
                  >
                    Notes
                  </Button>
                  <Button
                    variant="contained"
                    onClick={() => handleOpenLogDialog()}
                    startIcon={<FitnessCenterRoundedIcon />}
                    sx={{
                      background: "#f0f4f7",
                      color: "#0b1013",
                      textTransform: "none",
                      fontWeight: 700,
                      borderRadius: "16px",
                      px: 2.25,
                      "&:hover": { background: "#ffffff" },
                    }}
                  >
                    Log set
                  </Button>
                </Stack>
              </Stack>

              <Divider sx={{ my: 2.5, borderColor: "rgba(255,255,255,0.08)" }} />

              <Stack spacing={1.6}>
                {exerciseSummaries.map((summary) => (
                  <Box
                    key={summary.exercise.exerciseId}
                    sx={{
                      p: 2.1,
                      borderRadius: "24px",
                      background:
                        summary.exercise.type === "main"
                          ? "linear-gradient(135deg, rgba(69,88,97,0.26) 0%, rgba(255,255,255,0.04) 100%)"
                          : "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      spacing={1.8}
                      justifyContent="space-between"
                    >
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1 }}>
                          <Chip
                            label={summary.exercise.targetLabel}
                            size="small"
                            sx={{
                              background: "rgba(255,255,255,0.08)",
                              color: "#f6f7fb",
                              fontWeight: 700,
                            }}
                          />
                          <Chip
                            label={`${summary.exercise.repRange[0]}-${summary.exercise.repRange[1]} reps`}
                            size="small"
                            sx={{
                              background: "rgba(255,255,255,0.08)",
                              color: "rgba(255,255,255,0.8)",
                            }}
                          />
                        </Stack>
                        <Typography sx={{ fontSize: "1.45rem", fontWeight: 800, lineHeight: 1.1 }}>
                          {summary.exercise.name}
                        </Typography>
                        <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.76)" }}>
                          Today target:{" "}
                          <Box component="span" sx={{ fontWeight: 700, color: "#ffffff" }}>
                            {roundToDisplay(summary.progression.weightKg)}kg x{" "}
                            {summary.progression.reps}
                          </Box>
                        </Typography>
                        <Typography sx={{ mt: 0.4, color: "rgba(255,255,255,0.56)" }}>
                          {summary.latest
                            ? `Last time: ${formatSet(summary.latest.set)}`
                            : "No history yet for this lift."}
                        </Typography>
                        <Typography sx={{ mt: 0.3, color: "rgba(255,255,255,0.46)" }}>
                          {summary.progression.reason}
                        </Typography>
                      </Box>

                      <Stack spacing={1.1} sx={{ minWidth: { md: 280 } }}>
                        <DashboardCard sx={{ background: "rgba(255,255,255,0.03)" }}>
                          <Box sx={{ p: 1.7 }}>
                            <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.86rem" }}>
                              Logged today
                            </Typography>
                            <Typography sx={{ mt: 0.65, fontWeight: 700 }}>
                              {summary.loggedToday.length > 0
                                ? summary.loggedToday.map(formatSet).join(" • ")
                                : "No sets logged yet"}
                            </Typography>
                          </Box>
                        </DashboardCard>
                        <Button
                          variant="outlined"
                          onClick={() => handleOpenLogDialog(summary.exercise.exerciseId)}
                          sx={{
                            borderColor: "rgba(255,255,255,0.18)",
                            color: "#f6f7fb",
                            textTransform: "none",
                            borderRadius: "14px",
                            fontWeight: 700,
                          }}
                        >
                          Log this lift
                        </Button>
                      </Stack>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          </DashboardCard>

          <Stack spacing={2.2} sx={{ flex: 0.95 }}>
            <DashboardCard>
              <Box sx={{ p: { xs: 2.4, sm: 2.8 } }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <EmojiEventsRoundedIcon sx={{ color: "#f9d27b" }} />
                  <Typography sx={{ fontSize: "1.5rem", fontWeight: 800 }}>PR tracker</Typography>
                </Stack>
                <Stack spacing={1.3} sx={{ mt: 2.1 }}>
                  {exerciseSummaries
                    .filter((summary) => summary.pr)
                    .slice(0, 4)
                    .map((summary) => (
                      <Box
                        key={summary.exercise.exerciseId}
                        sx={{
                          p: 1.7,
                          borderRadius: "20px",
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <Typography sx={{ fontWeight: 700 }}>{summary.exercise.name}</Typography>
                        <Typography sx={{ mt: 0.7, color: "rgba(255,255,255,0.78)" }}>
                          {summary.pr ? `${summary.pr.weightKg}kg x ${summary.pr.reps}` : "No PR"}
                        </Typography>
                        <Typography sx={{ color: "rgba(255,255,255,0.5)" }}>
                          Est. 1RM:{" "}
                          {summary.pr
                            ? `${roundToDisplay(estimateOneRepMax(summary.pr))}kg`
                            : "N/A"}
                        </Typography>
                      </Box>
                    ))}
                </Stack>
              </Box>
            </DashboardCard>

            <DashboardCard>
              <Box sx={{ p: { xs: 2.4, sm: 2.8 } }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <AutoGraphRoundedIcon sx={{ color: "#98d7df" }} />
                  <Typography sx={{ fontSize: "1.5rem", fontWeight: 800 }}>
                    Last performance
                  </Typography>
                </Stack>
                <Typography sx={{ mt: 0.9, color: "rgba(255,255,255,0.55)" }}>
                  Your most recent session for this day split.
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    p: 1.8,
                    borderRadius: "22px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    {latestDaySession
                      ? formatDateWithDay(latestDaySession.date)
                      : "No session recorded yet"}
                  </Typography>
                  <Typography sx={{ mt: 0.9, color: "rgba(255,255,255,0.74)" }}>
                    {latestDaySession
                      ? latestDaySession.sets.map(formatSet).join(" • ")
                      : "Log a set and this panel becomes your quick reference."}
                  </Typography>
                </Box>
              </Box>
            </DashboardCard>

            <DashboardCard sx={{ flex: 1 }}>
              <Box sx={{ p: { xs: 2.4, sm: 2.8 } }}>
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <HistoryRoundedIcon sx={{ color: "#cbd0d5" }} />
                  <Typography sx={{ fontSize: "1.5rem", fontWeight: 800 }}>Notes</Typography>
                </Stack>
                <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.55)" }}>
                  Quick context that helps future decisions.
                </Typography>
                <Box
                  sx={{
                    mt: 2,
                    p: 1.8,
                    borderRadius: "22px",
                    minHeight: 110,
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <Typography sx={{ color: "rgba(255,255,255,0.86)" }}>
                    {todaySession?.notes || "No note for today yet. Add one after the session."}
                  </Typography>
                </Box>
                <Stack spacing={1.1} sx={{ mt: 2 }}>
                  {recentNotes.slice(0, 3).map((session) => (
                    <Box
                      key={session.id}
                      sx={{
                        p: 1.4,
                        borderRadius: "18px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <Typography sx={{ fontSize: "0.92rem", color: "rgba(255,255,255,0.52)" }}>
                        {formatDateWithDay(session.date)}
                      </Typography>
                      <Typography sx={{ mt: 0.45 }}>{session.notes}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </DashboardCard>
          </Stack>
        </Stack>
      </Box>

      <Dialog
        open={logDialogOpen}
        onClose={() => setLogDialogOpen(false)}
        PaperProps={{
          sx: {
            background: "linear-gradient(180deg, rgba(28,32,36,0.98) 0%, rgba(16,19,23,0.98) 100%)",
            borderRadius: "24px",
            color: "#f6f7fb",
            border: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Log set</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <Stack spacing={2} sx={{ mt: 1, minWidth: { xs: 260, sm: 360 } }}>
            <TextField
              label="Workout date"
              type="date"
              value={logDate}
              onChange={(event) => setLogDate(event.target.value)}
              fullWidth
              InputLabelProps={{
                sx: { color: "rgba(255,255,255,0.6)" },
                shrink: true,
              }}
              InputProps={{
                sx: {
                  color: "#f6f7fb",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "16px",
                },
              }}
              helperText={logDate ? formatDateWithDay(logDate) : ""}
              FormHelperTextProps={{ sx: { color: "rgba(255,255,255,0.5)" } }}
            />
            <TextField
              label="Exercise"
              select
              value={logDraft.exerciseId}
              onChange={(event) =>
                setLogDraft((prev) => ({ ...prev, exerciseId: event.target.value }))
              }
              fullWidth
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
              InputProps={{
                sx: {
                  color: "#f6f7fb",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "16px",
                },
              }}
            >
              {currentDay.exercises.map((exercise) => (
                <MenuItem key={exercise.exerciseId} value={exercise.exerciseId}>
                  {exercise.name} {String.fromCharCode(8226)} {exercise.targetLabel}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Weight (kg)"
              type="number"
              value={logDraft.weightKg}
              onChange={(event) =>
                setLogDraft((prev) => ({ ...prev, weightKg: event.target.value }))
              }
              fullWidth
              InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
              InputProps={{
                sx: {
                  color: "#f6f7fb",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: "16px",
                },
              }}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Reps"
                type="number"
                value={logDraft.reps}
                onChange={(event) =>
                  setLogDraft((prev) => ({ ...prev, reps: event.target.value }))
                }
                fullWidth
                InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
                InputProps={{
                  sx: {
                    color: "#f6f7fb",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "16px",
                  },
                }}
              />
              <TextField
                label="RPE"
                type="number"
                value={logDraft.rpe}
                onChange={(event) =>
                  setLogDraft((prev) => ({ ...prev, rpe: event.target.value }))
                }
                fullWidth
                InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
                InputProps={{
                  sx: {
                    color: "#f6f7fb",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: "16px",
                  },
                }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setLogDialogOpen(false)}
            sx={{ color: "rgba(255,255,255,0.72)", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveSet}
            variant="contained"
            sx={{
              background: "#f0f4f7",
              color: "#0b1013",
              textTransform: "none",
              fontWeight: 800,
              borderRadius: "16px",
            }}
          >
            Save set
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={notesDialogOpen}
        onClose={() => setNotesDialogOpen(false)}
        PaperProps={{
          sx: {
            background: "linear-gradient(180deg, rgba(28,32,36,0.98) 0%, rgba(16,19,23,0.98) 100%)",
            borderRadius: "24px",
            color: "#f6f7fb",
            border: "1px solid rgba(255,255,255,0.08)",
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Workout notes</DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <TextField
            multiline
            minRows={4}
            label="How did it feel?"
            value={noteDraft}
            onChange={(event) => setNoteDraft(event.target.value)}
            fullWidth
            InputLabelProps={{ sx: { color: "rgba(255,255,255,0.6)" } }}
            InputProps={{
              sx: {
                color: "#f6f7fb",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "16px",
              },
            }}
            sx={{ mt: 1, minWidth: { xs: 260, sm: 380 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setNotesDialogOpen(false)}
            sx={{ color: "rgba(255,255,255,0.72)", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveNotes}
            variant="contained"
            sx={{
              background: "#f0f4f7",
              color: "#0b1013",
              textTransform: "none",
              fontWeight: 800,
              borderRadius: "16px",
            }}
          >
            Save notes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
