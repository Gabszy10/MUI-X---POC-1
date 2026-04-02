import type { ReactNode } from "react";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AppsRoundedIcon from "@mui/icons-material/AppsRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import EqualizerRoundedIcon from "@mui/icons-material/EqualizerRounded";
import MoreHorizRoundedIcon from "@mui/icons-material/MoreHorizRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

const monthDots = [
  {
    label: "Jan",
    active: [1, 8, 17, 22],
  },
  {
    label: "Feb",
    active: [3, 10, 15],
  },
  {
    label: "Mar",
    active: [2],
  },
];

const navItems = [
  { icon: <AppsRoundedIcon fontSize="small" />, active: true },
  { icon: <CalendarMonthRoundedIcon fontSize="small" />, active: false },
  { icon: <EqualizerRoundedIcon fontSize="small" />, active: false },
  { icon: <ChatBubbleOutlineRoundedIcon fontSize="small" />, active: false },
];

function ActionButton({ children }: { children: ReactNode }) {
  return (
    <IconButton
      sx={{
        width: 58,
        height: 58,
        borderRadius: "22px",
        backgroundColor: "rgba(255,255,255,0.1)",
        color: "#f8f7fb",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
        "&:hover": {
          backgroundColor: "rgba(255,255,255,0.14)",
        },
      }}
    >
      {children}
    </IconButton>
  );
}

function MetricRing({ value }: { value: string }) {
  return (
    <Box
      sx={{
        width: 92,
        height: 92,
        borderRadius: "50%",
        display: "grid",
        placeItems: "center",
        background:
          "radial-gradient(circle at center, rgba(28,28,34,1) 55%, transparent 56%), conic-gradient(#f2f1f5 0 300deg, rgba(255,255,255,0.1) 300deg 360deg)",
        boxShadow:
          "inset 0 0 0 1px rgba(255,255,255,0.06), 0 16px 40px rgba(0,0,0,0.35)",
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: "linear-gradient(180deg, #202027 0%, #16161b 100%)",
          color: "#fff",
          fontSize: "2rem",
          fontWeight: 700,
        }}
      >
        {value}
      </Box>
    </Box>
  );
}

function DottedMonth({
  label,
  active,
}: {
  label: string;
  active: number[];
}) {
  return (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography
        sx={{
          color: "#f1eff4",
          fontSize: "1rem",
          fontWeight: 600,
          textAlign: "center",
          mb: 2.25,
        }}
      >
        {label}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 1.2,
          justifyItems: "center",
        }}
      >
        {Array.from({ length: 24 }, (_, index) => {
          const isActive = active.includes(index);
          return (
            <Box
              key={`${label}-${index}`}
              sx={{
                width: isActive ? 11 : 7,
                height: isActive ? 11 : 7,
                borderRadius: "50%",
                backgroundColor: isActive ? "#f6f5f8" : "rgba(255,255,255,0.14)",
                boxShadow: isActive
                  ? "0 0 18px rgba(255,255,255,0.32)"
                  : "none",
                opacity: isActive ? 1 : 0.62,
              }}
            />
          );
        })}
      </Box>
    </Box>
  );
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
        borderRadius: "32px",
        background:
          "linear-gradient(180deg, rgba(43,43,51,0.96) 0%, rgba(30,30,36,0.92) 100%)",
        border: "1px solid rgba(255,255,255,0.05)",
        boxShadow:
          "0 24px 60px rgba(0,0,0,0.38), inset 0 1px 0 rgba(255,255,255,0.04)",
        color: "#f8f7fb",
        overflow: "hidden",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

export default function GymDashboard() {
  return (
    <Box
      sx={{
        minHeight: "100svh",
        background:
          "radial-gradient(circle at top, rgba(36,36,44,0.4) 0%, rgba(11,11,14,0.96) 35%, #050507 100%)",
        color: "#fff",
        px: { xs: 2, sm: 3.5 },
        py: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 430,
          mx: "auto",
          minHeight: "calc(100svh - 32px)",
          display: "flex",
          flexDirection: "column",
          gap: 2.2,
          position: "relative",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pt: 1.5, pb: 0.5 }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "3rem", sm: "3.35rem" },
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: "-0.06em",
            }}
          >
            Workouts
          </Typography>

          <Stack direction="row" spacing={1.5}>
            <ActionButton>
              <TuneRoundedIcon />
            </ActionButton>
            <ActionButton>
              <AddRoundedIcon />
            </ActionButton>
          </Stack>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <DashboardCard sx={{ flex: 1 }}>
            <Box sx={{ p: 2.5 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <MetricRing value="1" />
                <MoreHorizRoundedIcon sx={{ color: "rgba(255,255,255,0.3)", fontSize: 34 }} />
              </Stack>

              <Box sx={{ mt: 5 }}>
                <Typography sx={{ fontSize: "1.95rem", lineHeight: 1.08, fontWeight: 700 }}>
                  Chest + tricep
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "1.4rem",
                    mt: 1,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Fridays
                </Typography>
              </Box>
            </Box>
          </DashboardCard>

          <DashboardCard sx={{ flex: 1 }}>
            <Box sx={{ p: 2.5, height: "100%" }}>
              <Stack direction="row" justifyContent="flex-end">
                <MoreHorizRoundedIcon sx={{ color: "rgba(255,255,255,0.26)", fontSize: 34 }} />
              </Stack>

              <Box sx={{ mt: 1.5 }}>
                <Typography
                  sx={{
                    fontSize: { xs: "4.2rem", sm: "4.6rem" },
                    lineHeight: 0.95,
                    fontWeight: 800,
                    letterSpacing: "-0.08em",
                  }}
                >
                  190
                  <Box
                    component="span"
                    sx={{
                      fontSize: "1.3rem",
                      color: "rgba(255,255,255,0.58)",
                      ml: 1.2,
                      letterSpacing: "-0.03em",
                    }}
                  >
                    lbs
                  </Box>
                </Typography>

                <Typography sx={{ mt: 7, fontSize: "1.9rem", fontWeight: 700 }}>
                  Body weight
                </Typography>
                <Typography sx={{ mt: 0.8, color: "rgba(255,255,255,0.46)", fontSize: "1.25rem" }}>
                  31 min ago
                </Typography>
              </Box>
            </Box>
          </DashboardCard>
        </Stack>

        <DashboardCard>
          <Box sx={{ p: 2.5 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2.5, sm: 2 }}
              justifyContent="space-between"
            >
              {monthDots.map((month) => (
                <DottedMonth key={month.label} label={month.label} active={month.active} />
              ))}
            </Stack>

            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-end"
              sx={{ mt: 4.5 }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <MetricRing value="2" />

                <Box>
                  <Typography sx={{ fontSize: "1.9rem", fontWeight: 700, lineHeight: 1.1 }}>
                    Back + bicep + legs
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.46)", fontSize: "1.25rem", mt: 0.8 }}>
                    Mondays
                  </Typography>
                </Box>
              </Stack>

              <MoreHorizRoundedIcon sx={{ color: "rgba(255,255,255,0.26)", fontSize: 34, mb: 1 }} />
            </Stack>
          </Box>
        </DashboardCard>

        <DashboardCard>
          <Stack direction={{ xs: "column", sm: "row" }} sx={{ minHeight: 150 }}>
            <Box sx={{ flex: 1, p: 2.5 }}>
              <Typography sx={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.08 }}>
                Volume lifted
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.46)", fontSize: "1.25rem", mt: 1 }}>
                Last 7 days
              </Typography>
            </Box>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{
                flex: 1,
                px: 2.5,
                borderTop: { xs: "1px solid rgba(255,255,255,0.08)", sm: "none" },
                borderLeft: { xs: "none", sm: "1px solid rgba(255,255,255,0.08)" },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "3.5rem", sm: "4rem" },
                  lineHeight: 1,
                  fontWeight: 800,
                  letterSpacing: "-0.08em",
                }}
              >
                3.200
                <Box
                  component="span"
                  sx={{
                    fontSize: "1.25rem",
                    color: "rgba(255,255,255,0.58)",
                    ml: 1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  lbs
                </Box>
              </Typography>

              <MoreHorizRoundedIcon sx={{ color: "rgba(255,255,255,0.26)", fontSize: 34 }} />
            </Stack>
          </Stack>
        </DashboardCard>

        <DashboardCard
          sx={{
            flex: 1,
            minHeight: 175,
            background:
              "linear-gradient(180deg, rgba(25,25,31,0.96) 0%, rgba(20,20,24,0.96) 100%)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: "7rem",
              lineHeight: 1,
              color: "rgba(255,255,255,0.12)",
              fontWeight: 200,
              transform: "translateY(8px)",
            }}
          >
            +
          </Typography>
        </DashboardCard>

        <Paper
          elevation={0}
          sx={{
            position: "sticky",
            bottom: 0,
            mt: "auto",
            borderRadius: "28px 28px 0 0",
            background: "rgba(10,10,13,0.96)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            boxShadow: "0 -10px 30px rgba(0,0,0,0.35)",
            backdropFilter: "blur(18px)",
          }}
        >
          <Stack direction="row" justifyContent="space-around" sx={{ py: 1.4 }}>
            {navItems.map((item, index) => (
              <IconButton
                key={index}
                sx={{
                  color: item.active ? "#fff" : "rgba(255,255,255,0.26)",
                }}
              >
                {item.icon}
              </IconButton>
            ))}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
