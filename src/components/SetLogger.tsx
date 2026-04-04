import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useState } from "react";

import type { LoggedSet } from "../utils/workouts";

type SetLoggerProps = {
  exerciseName: string;
  setNumber: number;
  weight: number;
  reps: number;
  rir: number;
  showRir: boolean;
  unit: "kg" | "lb";
  previousSets: LoggedSet[];
  onSetWeight: (value: number) => void;
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
  showRir,
  unit,
  previousSets,
  onSetWeight,
  onAdjustReps,
  onSelectRir,
  onSelectUnit,
  onSave,
}: SetLoggerProps) {
  const [weightDraft, setWeightDraft] = useState(String(weight));
  const quickWeights = [
    Math.max(0, Number((weight - 5).toFixed(1))),
    Number(weight.toFixed(1)),
    Number((weight + 5).toFixed(1)),
    Number((weight + 10).toFixed(1)),
  ].filter((value, index, array) => array.indexOf(value) === index);

  const applyWeight = (nextValue: number) => {
    const clamped = Math.max(0, Number(nextValue.toFixed(1)));
    onSetWeight(clamped);
    setWeightDraft(String(clamped));
  };

  const handleWeightInput = (value: string) => {
    setWeightDraft(value);
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) {
      applyWeight(parsed);
    }
  };

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
          Weight
        </Typography>
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mt: 1.3 }}>
          <Button
            onClick={() => {
              const next = Math.max(0, Number((weight - 2.5).toFixed(1)));
              onSetWeight(next);
              setWeightDraft(String(next));
            }}
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
          <Box sx={{ flex: 1 }}>
            <TextField
              value={weightDraft}
              onChange={(event) => handleWeightInput(event.target.value)}
              onFocus={(event) => event.target.select()}
              onBlur={() => {
                const parsed = Number(weightDraft);
                if (Number.isNaN(parsed)) {
                  setWeightDraft(String(weight));
                  return;
                }
                applyWeight(parsed);
              }}
              type="number"
              fullWidth
              inputProps={{ inputMode: "decimal", min: 0, step: 0.5 }}
              sx={{
                "& .MuiInputBase-input": {
                  textAlign: "center",
                  fontSize: "1.8rem",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  paddingLeft: 0,
                  paddingRight: 0,
                  paddingTop: "10px",
                  paddingBottom: "10px",
                },
                "& input[type=number]": {
                  MozAppearance: "textfield",
                },
                "& input[type=number]::-webkit-outer-spin-button, & input[type=number]::-webkit-inner-spin-button": {
                  WebkitAppearance: "none",
                  margin: 0,
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "16px",
                  background: "rgba(0,0,0,0.2)",
                },
              }}
            />
            <Typography
              sx={{
                mt: 0.6,
                textAlign: "center",
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.55)",
              }}
            >
              {unit}
            </Typography>
          </Box>
          <Button
            onClick={() => {
              const next = Number((weight + 2.5).toFixed(1));
              onSetWeight(next);
              setWeightDraft(String(next));
            }}
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
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1.4 }}>
          {quickWeights.map((preset) => (
            <Button
              key={preset}
              onClick={() => applyWeight(preset)}
              sx={{
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 700,
                background: "rgba(255,255,255,0.06)",
                color: "#f8fafc",
                px: 2,
                "&:hover": {
                  background: "rgba(255,255,255,0.12)",
                },
              }}
            >
              {preset}
            </Button>
          ))}
        </Stack>
      </Paper>

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

      {showRir ? (
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
      ) : null}

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
