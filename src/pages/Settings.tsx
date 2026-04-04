import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getSchedule,
  getDefaultExercisesForType,
  getShowRir,
  getShowSession,
  getShowTimer,
  saveSchedule,
  setShowRir,
  setShowSession,
  setShowTimer,
  weekdayOrder,
  workoutOptions,
  type DaySchedule,
  type Weekday,
  type WorkoutType,
} from "../utils/settings";
import { resetWorkoutProgressForDate } from "../utils/workouts";
import { getExerciseLibrary, type LibraryExercise } from "../utils/exerciseLibrary";

function Settings() {
  const [showTimer, setShowTimerState] = useState(true);
  const [showSession, setShowSessionState] = useState(true);
  const [showRir, setShowRirState] = useState(false);
  const [schedule, setSchedule] = useState<Record<Weekday, DaySchedule>>(getSchedule);
  const [editDay, setEditDay] = useState<Weekday | null>(null);
  const [selectedExercises, setSelectedExercises] = useState<number[]>([]);
  const [library, setLibrary] = useState<LibraryExercise[]>(() => getExerciseLibrary());
  const navigate = useNavigate();

  const activeDay = editDay ? schedule[editDay] : null;
  const availableExercises = useMemo(() => {
    if (!activeDay) {
      return [];
    }
    return library.filter((exercise) => exercise.type === activeDay.type);
  }, [activeDay, library]);

  useEffect(() => {
    setShowTimerState(getShowTimer());
    setShowSessionState(getShowSession());
    setShowRirState(getShowRir());
    setLibrary(getExerciseLibrary());
  }, []);

  const handleToggleTimer = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setShowTimerState(checked);
    setShowTimer(checked);
  };

  const handleToggleSession = (
    _event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean,
  ) => {
    setShowSessionState(checked);
    setShowSession(checked);
  };

  const handleToggleRir = (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setShowRirState(checked);
    setShowRir(checked);
  };

  const handleScheduleChange = (day: Weekday, value: WorkoutType) => {
    const prevType = schedule[day].type;
    const defaults = workoutOptions
      .find((option) => option.value === value)
      ? getDefaultExercisesForType(value)
      : [];
    const next = {
      ...schedule,
      [day]: {
        type: value,
        exercises: defaults,
      },
    };
    setSchedule(next);
    saveSchedule(next);

    if (prevType !== value) {
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
      const todayKey = weekdayMap[weekdayIndex];
      if (todayKey === day) {
        resetWorkoutProgressForDate(new Date().toISOString().slice(0, 10));
        window.localStorage.removeItem("today-exercise-index");
      }
    }
  };

  const handleOpenEdit = (day: Weekday) => {
    setLibrary(getExerciseLibrary());
    setEditDay(day);
    setSelectedExercises(schedule[day].exercises ?? []);
  };

  const handleToggleExercise = (id: number) => {
    setSelectedExercises((prev) =>
      prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id],
    );
  };

  const handleSaveExercises = () => {
    if (!editDay) {
      return;
    }
    const next = {
      ...schedule,
      [editDay]: {
        ...schedule[editDay],
        exercises: selectedExercises,
      },
    };
    setSchedule(next);
    saveSchedule(next);
    setEditDay(null);
  };

  return (
    <Stack spacing={2.2}>
      <Box
        sx={{
          p: 2.4,
          borderRadius: "28px",
          background: "linear-gradient(180deg, rgba(18,22,27,0.98) 0%, rgba(12,15,18,0.98) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Chip
          icon={<SettingsRoundedIcon />}
          label="Settings"
          sx={{
            background: "rgba(255,255,255,0.08)",
            color: "#f8fafc",
            fontWeight: 700,
          }}
        />
        <Typography variant="h1" sx={{ mt: 2, fontSize: "2.1rem" }}>
          Keep it simple
        </Typography>
        <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.64)" }}>
          Personalize your experience and plan the week ahead.
        </Typography>
      </Box>

      <Box
        sx={{
          p: 2.2,
          borderRadius: "24px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>Preferences</Typography>
        <Typography sx={{ mt: 0.6, color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
          Manage what shows on the home screen.
        </Typography>

        <Stack spacing={1.2} sx={{ mt: 2 }}>
          <FormControlLabel
            control={<Switch checked={showTimer} onChange={handleToggleTimer} />}
            label={<Typography sx={{ fontWeight: 600 }}>Show Timer on Home</Typography>}
            sx={{ alignItems: "flex-start", ml: 0 }}
          />
          <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", ml: 0.5 }}>
            Display rest timer on the main screen
          </Typography>
          <FormControlLabel
            control={<Switch checked={showSession} onChange={handleToggleSession} />}
            label={<Typography sx={{ fontWeight: 600 }}>Show Session on Home</Typography>}
            sx={{ alignItems: "flex-start", ml: 0, mt: 1 }}
          />
          <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", ml: 0.5 }}>
            Display workout session duration on the home screen
          </Typography>
          <FormControlLabel
            control={<Switch checked={showRir} onChange={handleToggleRir} />}
            label={<Typography sx={{ fontWeight: 600 }}>Enable RIR (Reps in Reserve)</Typography>}
            sx={{ alignItems: "flex-start", ml: 0, mt: 1 }}
          />
          <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.85rem", ml: 0.5 }}>
            Track how many reps you had left in a set
          </Typography>
        </Stack>
      </Box>

      <Box
        sx={{
          p: 2.2,
          borderRadius: "24px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>Exercise Library</Typography>
            <Typography sx={{ mt: 0.4, color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
              Manage exercises by category
            </Typography>
          </Box>
          <Button
            onClick={() => navigate("/library")}
            endIcon={<ChevronRightRoundedIcon />}
            sx={{
              textTransform: "none",
              fontWeight: 700,
              color: "rgba(248,250,252,0.9)",
            }}
          >
            Open
          </Button>
        </Stack>
      </Box>

      <Box
        sx={{
          p: 2.2,
          borderRadius: "24px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>Workout Schedule</Typography>
        <Typography sx={{ mt: 0.6, color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>
          Define your training focus for each day.
        </Typography>

        <Stack spacing={1.4} sx={{ mt: 2 }}>
          {weekdayOrder.map((day) => (
            <Box
              key={day.key}
              sx={{
                display: "grid",
                alignItems: "center",
                gap: 1.5,
                gridTemplateColumns: "96px minmax(0, 1fr) 70px",
              }}
            >
              <Typography
                sx={{
                  width: 96,
                  color: "rgba(255,255,255,0.7)",
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {day.label}
              </Typography>
              <FormControl
                size="small"
                sx={{
                  width: "100%",
                  minWidth: 0,
                }}
              >
                <Select
                  value={schedule[day.key].type}
                  onChange={(event) =>
                    handleScheduleChange(day.key, event.target.value as WorkoutType)
                  }
                  sx={{
                    background: "rgba(12,16,20,0.9)",
                    borderRadius: "12px",
                    "& .MuiSelect-select": { py: 1.1 },
                  }}
                >
                  {workoutOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                onClick={() => handleOpenEdit(day.key)}
                sx={{
                  width: 70,
                  borderRadius: "12px",
                  minHeight: 40,
                  px: 0,
                  textTransform: "none",
                  fontWeight: 700,
                  color: "rgba(248,250,252,0.9)",
                  borderColor: "rgba(255,255,255,0.18)",
                  "&:hover": {
                    borderColor: "rgba(255,255,255,0.32)",
                    background: "rgba(255,255,255,0.04)",
                  },
                }}
              >
                Edit
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>

      <Dialog
        open={Boolean(editDay)}
        onClose={() => setEditDay(null)}
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
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editDay ? `Select exercises for ${weekdayOrder.find((d) => d.key === editDay)?.label}` : ""}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 2 }}>
            {activeDay
              ? `Workout type: ${activeDay.type.charAt(0).toUpperCase()}${activeDay.type.slice(1)}`
              : ""}
          </Typography>
          <Stack spacing={1}>
            {availableExercises.length === 0 ? (
              <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
                No exercises available for this type.
              </Typography>
            ) : (
              availableExercises.map((exercise) => (
                <FormControlLabel
                  key={exercise.id}
                  control={
                    <Checkbox
                      checked={selectedExercises.includes(exercise.id)}
                      onChange={() => handleToggleExercise(exercise.id)}
                    />
                  }
                  label={exercise.name}
                />
              ))
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setEditDay(null)}
            sx={{ color: "rgba(255,255,255,0.72)", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveExercises}
            variant="contained"
            sx={{
              background: "#f0f4f7",
              color: "#0b1013",
              textTransform: "none",
              fontWeight: 800,
              borderRadius: "16px",
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

    </Stack>
  );
}

export default Settings;
