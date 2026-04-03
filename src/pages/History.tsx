import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import { Box, Chip, Stack, Typography } from "@mui/material";

import { getWorkouts } from "../utils/workouts";

function History() {
  const workouts = getWorkouts().slice().reverse();

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          p: 2.4,
          borderRadius: "28px",
          background: "linear-gradient(180deg, rgba(18,22,27,0.98) 0%, rgba(12,15,18,0.98) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <Chip
          icon={<InsightsRoundedIcon />}
          label="History"
          sx={{
            background: "rgba(255,255,255,0.08)",
            color: "#f8fafc",
            fontWeight: 700,
          }}
        />
        <Typography variant="h1" sx={{ mt: 2, fontSize: "2.1rem" }}>
          Recent workouts
        </Typography>
        <Typography sx={{ mt: 1, color: "rgba(255,255,255,0.64)" }}>
          Simple local history from the `workouts` key.
        </Typography>
      </Box>

      <Stack spacing={1.2}>
        {workouts.length === 0 ? (
          <Box
            sx={{
              p: 2.2,
              borderRadius: "24px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Typography>No workouts saved yet.</Typography>
          </Box>
        ) : (
          workouts.map((workout, index) => (
            <Box
              key={`${workout.exercise}-${workout.date}-${index}`}
              sx={{
                p: 2,
                borderRadius: "24px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <Typography sx={{ fontWeight: 700 }}>{workout.exercise}</Typography>
              <Typography sx={{ mt: 0.5, color: "rgba(255,255,255,0.56)" }}>
                {workout.date}
              </Typography>
              <Typography sx={{ mt: 1 }}>
                {workout.sets
                  .map((set) => {
                    const intensity =
                      typeof set.rir === "number"
                        ? ` • RIR ${set.rir}`
                        : set.rpe
                          ? ` • RPE ${set.rpe}`
                          : "";
                    return `${set.weight}${set.unit} x ${set.reps}${intensity}`;
                  })
                  .join(" • ")}
              </Typography>
            </Box>
          ))
        )}
      </Stack>
    </Stack>
  );
}

export default History;
