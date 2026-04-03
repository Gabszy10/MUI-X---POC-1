import { keyframes } from "@mui/system";
import { Box, Button, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";

const pulse = keyframes`
  0% {
    text-shadow: 0 0 6px rgba(74, 222, 128, 0.08);
    opacity: 1;
  }
  50% {
    text-shadow: 0 0 12px rgba(74, 222, 128, 0.14);
    opacity: 0.9;
  }
  100% {
    text-shadow: 0 0 6px rgba(74, 222, 128, 0.08);
    opacity: 1;
  }
`;

function formatTime(totalMs: number) {
  const totalSeconds = Math.floor(totalMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((totalMs % 1000) / 10);
  const paddedMinutes = String(minutes).padStart(2, "0");
  const paddedSeconds = String(seconds).padStart(2, "0");
  const paddedCenti = String(centiseconds).padStart(2, "0");
  return `${paddedMinutes}:${paddedSeconds}.${paddedCenti}`;
}

function Timer() {
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) {
      return;
    }

    const interval = window.setInterval(() => {
      setElapsedMs((prev) => prev + 100);
    }, 100);

    return () => window.clearInterval(interval);
  }, [running]);

  const timerText = useMemo(() => formatTime(elapsedMs), [elapsedMs]);

  const handleToggle = () => setRunning((prev) => !prev);
  const handleReset = () => {
    setElapsedMs(0);
    setRunning(false);
  };
  const handleAddThirty = () => setElapsedMs((prev) => prev + 30000);

  return (
    <Box
      sx={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: 0,
        py: 0,
        background: "linear-gradient(180deg, #06070a 0%, #0b1016 55%, #090e13 100%)",
      }}
    >
      <Stack spacing={1} alignItems="center" sx={{ width: "100%", px: 2 }}>
        <Typography
          sx={{
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            fontSize: "0.68rem",
            color: "rgba(161,161,170,0.75)",
          }}
        >
          Rest Timer
        </Typography>
      </Stack>

      <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ mt: 5, mb: 4 }}>
        <Typography
          sx={{
            fontSize: { xs: "3.4rem", sm: "4.6rem" },
            fontWeight: 700,
            letterSpacing: "0.04em",
            color: running ? "#e5e7eb" : "rgba(229,231,235,0.75)",
            animation: running ? `${pulse} 1.7s ease-in-out infinite` : "none",
            transition: "color 200ms ease",
            display: "inline-block",
            borderRadius: "16px",
            boxShadow: running ? "0 0 12px rgba(34,197,94,0.16)" : "none",
          }}
        >
          {timerText}
        </Typography>
      </Stack>

      <Stack spacing={1.2} alignItems="center" sx={{ width: "100%", px: 2 }}>
        <Stack direction="row" spacing={1.2} justifyContent="center" sx={{ width: "100%" }}>
          <Button
            variant="contained"
            onClick={handleToggle}
            sx={{
              flex: 1,
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: 600,
              minHeight: 52,
              background: running
                ? "rgba(248,250,252,0.1)"
                : "linear-gradient(135deg, #8bd3a8 0%, #70c696 100%)",
              color: running ? "#f8fafc" : "#08110a",
              boxShadow: "none",
              "&:hover": {
                background: running
                  ? "rgba(248,250,252,0.18)"
                  : "linear-gradient(135deg, #9be0b4 0%, #7ed0a1 100%)",
              },
              "&:active": {
                transform: "scale(0.97)",
              },
              transition: "transform 120ms ease",
            }}
          >
            {running ? "Pause" : "Start"}
          </Button>
          <Button
            variant="outlined"
            onClick={handleAddThirty}
            sx={{
              flex: 1,
              borderRadius: "999px",
              textTransform: "none",
              fontWeight: 600,
              minHeight: 52,
              color: "rgba(248,250,252,0.85)",
              borderColor: "rgba(148,163,184,0.35)",
              "&:hover": {
                borderColor: "rgba(148,163,184,0.6)",
                background: "rgba(148,163,184,0.08)",
              },
              "&:active": {
                transform: "scale(0.97)",
              },
              transition: "transform 120ms ease",
            }}
          >
            +30 sec
          </Button>
        </Stack>
        <Button
          onClick={handleReset}
          sx={{
            borderRadius: "999px",
            textTransform: "none",
            fontWeight: 600,
            minHeight: 44,
            px: 3,
            color: "rgba(161,161,170,0.85)",
            "&:hover": {
              background: "rgba(148,163,184,0.08)",
            },
            "&:active": {
              transform: "scale(0.97)",
            },
            transition: "transform 120ms ease",
          }}
        >
          Reset
        </Button>
      </Stack>
    </Box>
  );
}

export default Timer;
