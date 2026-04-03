import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import { Box, Chip, Stack, Typography } from "@mui/material";

function Settings() {
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
          This space is ready for future timers, units, and progression preferences.
        </Typography>
      </Box>
    </Stack>
  );
}

export default Settings;
