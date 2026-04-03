import FitnessCenterRoundedIcon from "@mui/icons-material/FitnessCenterRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import TimerRoundedIcon from "@mui/icons-material/TimerRounded";
import { BottomNavigation, BottomNavigationAction, Box, Paper } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

const navItems = [
  { label: "Today", path: "/", icon: <FitnessCenterRoundedIcon /> },
  { label: "Timer", path: "/timer", icon: <TimerRoundedIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsRoundedIcon /> },
];

function getNavigationValue(pathname: string) {
  if (pathname.startsWith("/timer")) {
    return "/timer";
  }
  if (pathname.startsWith("/settings")) {
    return "/settings";
  }
  return "/";
}

function MobileAppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const isTimer = location.pathname.startsWith("/timer");

  return (
    <Box className="phone-frame">
      <Paper className="phone-surface" elevation={0}>
        <Box className={`phone-content${isTimer ? " phone-content--fullscreen" : ""}`}>
          <Outlet />
        </Box>

        <Paper
          elevation={0}
          sx={{
            p: 1,
            borderRadius: "24px 24px 0 0",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(11,15,19,0.98)",
            backdropFilter: "blur(18px)",
          }}
        >
          <BottomNavigation
            showLabels
            value={getNavigationValue(location.pathname)}
            onChange={(_event, nextValue) => navigate(nextValue)}
            sx={{
              background: "transparent",
              "& .MuiBottomNavigationAction-root": {
                color: "rgba(255,255,255,0.48)",
                minWidth: 0,
              },
              "& .Mui-selected": {
                color: "#8bd3a8",
              },
            }}
          >
            {navItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                value={item.path}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      </Paper>
    </Box>
  );
}

export default MobileAppLayout;
