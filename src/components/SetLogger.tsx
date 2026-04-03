import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {
  Box,
  Button,
  Paper,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import type { LoggedSet } from "../utils/workouts";

type SetLoggerProps = {
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  rir: number;
  unit: "kg" | "lb";
  previousSets: LoggedSet[];
  onAdjustWeight: (change: number) => void;
  onAdjustReps: (change: number) => void;
  onSelectRir: (value: number) => void;
  onSelectUnit: (value: "kg" | "lb") => void;
  onSave: () => void;
};

function ControlBlock({
  label,
  value,
  suffix,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: number;
  suffix?: string;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: "24px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <Typography sx={{ color: "rgba(255,255,255,0.58)", textAlign: "center" }}>
        {label}
      </Typography>
      <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 1.3 }}>
        <Button
          onClick={onDecrease}
          variant="outlined"
          sx={{
            minWidth: 56,
            width: 56,
            borderColor: "rgba(255,255,255,0.12)",
            color: "#f8fafc",
          }}
        >
          <RemoveRoundedIcon />
        </Button>
        <Box sx={{ flex: 1, textAlign: "center" }}>
          <Typography sx={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>
            {value}
            {suffix ? (
              <Box component="span" sx={{ ml: 0.5, fontSize: "1rem", color: "rgba(255,255,255,0.58)" }}>
                {suffix}
              </Box>
            ) : null}
          </Typography>
        </Box>
        <Button
          onClick={onIncrease}
          variant="outlined"
          sx={{
            minWidth: 56,
            width: 56,
            borderColor: "rgba(255,255,255,0.12)",
            color: "#f8fafc",
          }}
        >
          <AddRoundedIcon />
        </Button>
      </Stack>
    </Paper>
  );
}

function SetLogger({
  exerciseName,
  setNumber,
  weight,
  reps,
  rir,
  unit,
  previousSets,
  onAdjustWeight,
  onAdjustReps,
  onSelectRir,
  onSelectUnit,
  onSave,
}: SetLoggerProps) {
  return (
    <Stack spacing={2}>
      <Box sx={{ textAlign: "center" }}>
        <Typography sx={{ color: "rgba(255,255,255,0.56)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Log set
        </Typography>
        <Typography variant="h1" sx={{ mt: 1, fontSize: { xs: "2.4rem", sm: "2.8rem" } }}>
          {exerciseName}
        </Typography>
        <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.68)" }}>
          Set {setNumber}
        </Typography>
      </Box>

      <ControlBlock
        label="Weight"
        value={weight}
        suffix={unit}
        onDecrease={() => onAdjustWeight(-2.5)}
        onIncrease={() => onAdjustWeight(2.5)}
      />

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: "24px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.58)", textAlign: "center" }}>
          Units
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={unit}
          onChange={(_event, value) => {
            if (value !== null) {
              onSelectUnit(value);
            }
          }}
          fullWidth
          sx={{ mt: 1.5 }}
        >
          {["kg", "lb"].map((value) => (
            <ToggleButton
              key={value}
              value={value}
              sx={{
                borderRadius: "16px !important",
                border: "1px solid rgba(255,255,255,0.08) !important",
                color: "#f8fafc",
                textTransform: "uppercase",
                fontWeight: 700,
                "&.Mui-selected": {
                  background: "rgba(139,211,168,0.16)",
                  color: "#8bd3a8",
                },
              }}
            >
              {value}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Paper>

      <ControlBlock
        label="Reps"
        value={reps}
        onDecrease={() => onAdjustReps(-1)}
        onIncrease={() => onAdjustReps(1)}
      />

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: "24px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.58)", textAlign: "center" }}>
          Reps in reserve (RIR)
        </Typography>
        <ToggleButtonGroup
          exclusive
          value={rir}
          onChange={(_event, value) => {
            if (value !== null) {
              onSelectRir(value);
            }
          }}
          fullWidth
          sx={{ mt: 1.5, display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1 }}
        >
          {[0, 1, 2, 3].map((value) => (
            <ToggleButton
              key={value}
              value={value}
              sx={{
                borderRadius: "16px !important",
                border: "1px solid rgba(255,255,255,0.08) !important",
                color: "#f8fafc",
                "&.Mui-selected": {
                  background: "rgba(139,211,168,0.16)",
                  color: "#8bd3a8",
                },
              }}
            >
              {value}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Paper>

      <Button
        variant="contained"
        onClick={onSave}
        fullWidth
        sx={{
          py: 1.5,
          background: "linear-gradient(135deg, #8bd3a8 0%, #70c696 100%)",
          color: "#08110a",
        }}
      >
        Save set
      </Button>

      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: "24px",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Typography sx={{ fontWeight: 700 }}>Previous sets</Typography>
        <Stack spacing={1.1} sx={{ mt: 1.4 }}>
          {previousSets.length === 0 ? (
            <Typography sx={{ color: "rgba(255,255,255,0.56)" }}>
              No sets logged yet today.
            </Typography>
          ) : (
            previousSets.map((set, index) => (
              <Box
                key={`${set.weight}-${set.reps}-${index}`}
                sx={{
                  p: 1.25,
                  borderRadius: "18px",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <Typography>
                  Set {index + 1}: {set.weight}{set.unit} x {set.reps} {typeof set.rir === "number" ? `• RIR ${set.rir}` : set.rpe ? `• RPE ${set.rpe}` : ""}
                </Typography>
              </Box>
            ))
          )}
        </Stack>
      </Paper>
    </Stack>
  );
}

export default SetLogger;
