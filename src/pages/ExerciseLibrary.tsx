import LibraryBooksRoundedIcon from "@mui/icons-material/LibraryBooksRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
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
import { useNavigate } from "react-router-dom";

import {
  getExerciseLibrary,
  saveExerciseLibrary,
  type LibraryExercise,
} from "../utils/exerciseLibrary";
import { pruneScheduleWithLibrary, workoutOptions, type WorkoutType } from "../utils/settings";

function ExerciseLibrary() {
  const navigate = useNavigate();
  const [library, setLibrary] = useState<LibraryExercise[]>(() => getExerciseLibrary());
  const [modalOpen, setModalOpen] = useState(false);
  const [draft, setDraft] = useState<{ name: string; type: WorkoutType }>({
    name: "",
    type: "push",
  });

  const categories = useMemo(
    () => workoutOptions.filter((option) => option.value !== "rest"),
    [],
  );

  const handleSave = () => {
    const name = draft.name.trim();
    if (!name) {
      return;
    }
    const nextId = library.reduce((max, entry) => Math.max(max, entry.id), 0) + 1;
    const nextLibrary = [...library, { id: nextId, name, type: draft.type }];
    setLibrary(nextLibrary);
    saveExerciseLibrary(nextLibrary);
    pruneScheduleWithLibrary(nextLibrary);
    setModalOpen(false);
    setDraft({ name: "", type: "push" });
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
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h1" sx={{ fontSize: "2rem" }}>
              Exercise Library
            </Typography>
            <Typography sx={{ mt: 0.6, color: "rgba(255,255,255,0.6)" }}>
              Organize your movements by category.
            </Typography>
          </Box>
          <LibraryBooksRoundedIcon />
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
          <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>Categories</Typography>
          <Button
            variant="outlined"
            onClick={() => setModalOpen(true)}
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
          {categories.map((category) => (
            <Button
              key={category.value}
              onClick={() => navigate(`/library/${category.value}`)}
              endIcon={<ChevronRightRoundedIcon />}
              sx={{
                justifyContent: "space-between",
                textTransform: "none",
                fontWeight: 700,
                color: "rgba(248,250,252,0.9)",
                background: "rgba(255,255,255,0.04)",
                borderRadius: "14px",
                px: 2,
                py: 1.4,
                "&:hover": {
                  background: "rgba(255,255,255,0.08)",
                },
              }}
            >
              {category.label}
            </Button>
          ))}
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
        <DialogTitle sx={{ fontWeight: 800 }}>Add exercise</DialogTitle>
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
        <DialogActions sx={{ px: 3, pb: 3 }}>
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

export default ExerciseLibrary;
