import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getExerciseLibrary,
  saveExerciseLibrary,
  type LibraryExercise,
} from "../utils/exerciseLibrary";
import { pruneScheduleWithLibrary, workoutOptions, type WorkoutType } from "../utils/settings";

function ExerciseCategory() {
  const navigate = useNavigate();
  const params = useParams();
  const [library, setLibrary] = useState<LibraryExercise[]>(() => getExerciseLibrary());
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<{ id: number | null; name: string; type: WorkoutType }>(
    { id: null, name: "", type: "push" },
  );

  const categories = useMemo(
    () => workoutOptions.filter((option) => option.value !== "rest"),
    [],
  );
  const activeType = categories.find((option) => option.value === params.type)?.value as
    | WorkoutType
    | undefined;

  const exercises = useMemo(
    () => library.filter((exercise) => exercise.type === activeType),
    [library, activeType],
  );

  const handleOpenAdd = () => {
    setDraft({ id: null, name: "", type: activeType ?? "push" });
    setModalOpen(true);
  };

  const handleOpenEdit = (exercise: LibraryExercise) => {
    setDraft({ id: exercise.id, name: exercise.name, type: exercise.type });
    setModalOpen(true);
  };

  const handleSave = () => {
    const name = draft.name.trim();
    if (!name) {
      return;
    }
    let nextLibrary = [...library];
    if (draft.id === null) {
      const nextId = nextLibrary.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;
      nextLibrary = [...nextLibrary, { id: nextId, name, type: draft.type }];
    } else {
      nextLibrary = nextLibrary.map((entry) =>
        entry.id === draft.id ? { ...entry, name, type: draft.type } : entry,
      );
    }
    setLibrary(nextLibrary);
    saveExerciseLibrary(nextLibrary);
    pruneScheduleWithLibrary(nextLibrary);
    setModalOpen(false);
  };

  const handleDelete = () => {
    if (draft.id === null) {
      return;
    }
    const nextLibrary = library.filter((entry) => entry.id !== draft.id);
    setLibrary(nextLibrary);
    saveExerciseLibrary(nextLibrary);
    pruneScheduleWithLibrary(nextLibrary);
    setModalOpen(false);
  };

  if (!activeType) {
    return (
      <Stack spacing={2}>
        <Button
          onClick={() => navigate("/library")}
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ alignSelf: "flex-start", color: "#f8fafc", px: 0, minHeight: 40 }}
        >
          Back to library
        </Button>
        <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>Category not found.</Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={2.2}>
      <Button
        onClick={() => navigate("/library")}
        startIcon={<ArrowBackRoundedIcon />}
        sx={{ alignSelf: "flex-start", color: "#f8fafc", px: 0, minHeight: 40 }}
      >
        Back to library
      </Button>

      <Box
        sx={{
          p: 2.2,
          borderRadius: "24px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontWeight: 700, fontSize: "1.2rem", textTransform: "capitalize" }}>
            {activeType}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleOpenAdd}
            sx={{
              borderRadius: "12px",
              minHeight: 36,
              px: 2,
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
            + Add Exercise
          </Button>
        </Stack>

        <Stack spacing={1} sx={{ mt: 2 }}>
          {exercises.length === 0 ? (
            <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>No exercises yet.</Typography>
          ) : (
            exercises.map((exercise) => (
              <Button
                key={exercise.id}
                onClick={() => handleOpenEdit(exercise)}
                sx={{
                  justifyContent: "flex-start",
                  textTransform: "none",
                  color: "rgba(255,255,255,0.8)",
                  fontWeight: 600,
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.03)",
                  px: 1.6,
                  py: 1.1,
                  "&:hover": {
                    background: "rgba(255,255,255,0.08)",
                  },
                }}
              >
                {exercise.name}
              </Button>
            ))
          )}
        </Stack>
      </Box>

      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
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
          {draft.id === null ? "Add exercise" : "Edit exercise"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <TextField
              label="Exercise name"
              value={draft.name}
              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
              fullWidth
            />
            <FormControl fullWidth size="small">
              <Select
                value={draft.type}
                onChange={(event) =>
                  setDraft((prev) => ({ ...prev, type: event.target.value as WorkoutType }))
                }
              >
                {categories.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          {draft.id !== null ? (
            <Button
              onClick={handleDelete}
              sx={{ color: "rgba(248,113,113,0.9)", textTransform: "none", fontWeight: 700 }}
            >
              Delete
            </Button>
          ) : null}
          <Box sx={{ flex: 1 }} />
          <Button
            onClick={() => setModalOpen(false)}
            sx={{ color: "rgba(255,255,255,0.72)", textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
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

export default ExerciseCategory;
