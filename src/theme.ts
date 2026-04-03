import { createTheme } from "@mui/material/styles";

const appTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#8bd3a8",
    },
    secondary: {
      main: "#7dd3fc",
    },
    background: {
      default: "#09090b",
      paper: "#111318",
    },
    text: {
      primary: "#f8fafc",
      secondary: "rgba(226,232,240,0.68)",
    },
  },
  shape: {
    borderRadius: 20,
  },
  typography: {
    fontFamily: '"SF Pro Display", "SF Pro Text", "Segoe UI", sans-serif',
    h1: {
      fontSize: "2.5rem",
      fontWeight: 800,
      letterSpacing: "-0.06em",
    },
    h2: {
      fontSize: "1.5rem",
      fontWeight: 700,
      letterSpacing: "-0.03em",
    },
    button: {
      textTransform: "none",
      fontWeight: 700,
    },
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          minHeight: 48,
          transform: "scale(1)",
          transition: "transform 120ms ease-out",
          "&:not(.Mui-disabled):active": {
            transform: "scale(0.97)",
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          transform: "scale(1)",
          transition: "transform 120ms ease-out",
          "&:not(.Mui-disabled):active": {
            transform: "scale(0.97)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 24,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          transition: "box-shadow 160ms ease, transform 160ms ease, border-color 160ms ease",
          "&.Mui-focused": {
            boxShadow: "0 0 10px rgba(34,197,94,0.16)",
            transform: "scale(1.01)",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(34,197,94,0.6)",
          },
        },
      },
    },
  },
});

export default appTheme;
