import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import { Box, Button, Chip, Stack, Typography } from "@mui/material";

type ExerciseCardProps = {
  name: string;
  pr: string;
  last?: string;
  insight?: string;
  onStart: () => void;
  status: "done" | "in-progress" | "ready";
  showHistory?: boolean;
  expanded?: boolean;
};

function ExerciseCard({
  name,
  pr,
  last,
  insight,
  onStart,
  status,
  showHistory = true,
  expanded = false,
}: ExerciseCardProps) {
  const statusStyles =
    status === "done"
      ? {
          label: "Done",
          background: "rgba(34,197,94,0.12)",
          color: "#4ade80",
        }
      : status === "in-progress"
        ? {
            label: "In progress",
            background: "rgba(234,179,8,0.12)",
            color: "#facc15",
          }
        : {
            label: "Ready",
            background: "rgba(63,63,70,0.12)",
            color: "#a1a1aa",
          };

  return (
    <Box
      sx={{
        p: 2.2,
        borderRadius: "24px",
        background:
          "linear-gradient(180deg, rgba(20,24,29,0.98) 0%, rgba(13,16,20,0.98) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 20px 40px rgba(0,0,0,0.22)",
        minHeight: expanded ? 320 : "auto",
        maxHeight: expanded ? "none" : "auto",
        flex: expanded ? 1 : "initial",
        display: "flex",
        flexDirection: "column",
        transition: "all 300ms ease-in-out",
      }}
    >
      <Stack spacing={expanded ? 1.25 : 1} sx={{ flex: 1 }}>
        <Stack direction="column" spacing={0.75} alignItems="flex-start">
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              letterSpacing: "-0.02em",
              lineHeight: 1.2,
            }}
          >
            {name}
          </Typography>
          <Chip
            label={statusStyles.label}
            size="small"
            sx={{
              alignSelf: "flex-start",
              background: statusStyles.background,
              color: statusStyles.color,
              fontWeight: 600,
              fontSize: "0.72rem",
              borderRadius: "999px",
              px: 1.2,
              py: 0.35,
              height: "auto",
              mt: '10px !important',
            }}
          />
        </Stack>

        <Stack spacing={expanded ? 1 : 1}>
          <Box>
            <Typography sx={{ color: "rgba(255,255,255,0.45)", fontSize: "0.85rem" }}>
              PR
            </Typography>
            <Typography sx={{ mt: 0.35, color: "rgba(255,255,255,0.7)" }}>{pr}</Typography>
          </Box>
          <Box>
            <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.9rem" }}>
              Last
            </Typography>
            <Typography sx={{ mt: 0.35, fontWeight: 600, color: "rgba(255,255,255,0.78)" }}>
              {last ?? "No history"}
            </Typography>
            {insight ? (
              <Typography sx={{ mt: 0.4, fontSize: "0.75rem", color: "rgba(255,255,255,0.45)" }}>
                {insight}
              </Typography>
            ) : null}
          </Box>
        </Stack>

        {expanded ? <Box sx={{ flex: 1 }} /> : null}

        <Button
          variant="contained"
          onClick={onStart}
          endIcon={<PlayArrowRoundedIcon />}
          fullWidth
          sx={{
            mt: expanded ? (showHistory ? 0.5 : 1) : "20px !important",
            minHeight: 52,
            background: "linear-gradient(135deg, #8bd3a8 0%, #70c696 100%)",
            color: "#08110a",
            py: 1.4,
            "&:hover": {
              background: "linear-gradient(135deg, #9be0b4 0%, #7ed0a1 100%)",
            },
          }}
        >
          Start
        </Button>

        {expanded ? <Box sx={{ mt: 0.5 }} /> : null}
      </Stack>
    </Box>
  );
}

export default ExerciseCard;
