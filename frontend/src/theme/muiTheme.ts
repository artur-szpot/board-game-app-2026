import { alpha, createTheme } from "@mui/material/styles";

export const muiTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#8f4cc6",
    },
    secondary: {
      main: "#1f3f8f",
    },
    background: {
      default: "#370142",
      paper: "#2b0d45",
    },
    text: {
      primary: "#ffffff",
      secondary: "#e7d8f5",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          fontSize: "1.2em",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
        a: {
          textDecoration: "none",
          color: "#ffffff",
        },
        ".form-screen-card": {
          background:
            "linear-gradient(150deg, rgb(255 255 255 / 18%), rgb(255 255 255 / 6%)), rgb(38 8 60 / 82%)",
          border: `1px solid ${alpha("#ffffff", 0.18)}`,
        },
        ".form-screen-card h2": {
          color: "#f6efff",
        },
        ".form-field-label": {
          color: "#f3e5ff",
        },
        ".main-actions .MuiButton-root": {
          border: `1px solid ${alpha("#ffffff", 0.25)}`,
          backgroundColor: alpha("#ffffff", 0.08),
          color: "#ffffff",
        },
        ".main-actions .MuiButton-root.Mui-disabled": {
          color: alpha("#ffffff", 0.65),
        },
        ".data-item": {
          border: `1px solid ${alpha("#ffffff", 0.18)}`,
          backgroundColor: alpha("#ffffff", 0.08),
          color: "#ffffff",
        },
        ".data-item .data-item-base .MuiIconButton-root": {
          color: alpha("#ffffff", 0.88),
          border: `1px solid ${alpha("#ffffff", 0.2)}`,
          borderRadius: 8,
        },
        ".data-item .data-item-base .MuiIconButton-root:hover": {
          backgroundColor: alpha("#ffffff", 0.14),
        },
        ".navbar.MuiAppBar-root": {
          backgroundColor: "#1a2f6f",
          color: "#ecf2ff",
          backgroundImage: "none",
          borderBottom: `1px solid ${alpha("#ecf2ff", 0.24)}`,
        },
        ".navbar .MuiButton-root": {
          color: "inherit",
        },
        ".navbar .MuiButton-root:hover": {
          backgroundColor: alpha("#ffffff", 0.12),
        },
        ".footer.MuiAppBar-root": {
          backgroundColor: "#16295f",
          color: "#e8efff",
          backgroundImage: "none",
          borderTop: `1px solid ${alpha("#e8efff", 0.22)}`,
        },
        ".footer .MuiIconButton-root:hover": {
          backgroundColor: alpha("#ffffff", 0.12),
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 14,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: "#d7abd9",
          color: "#271436",
          backgroundImage: "none",
          borderBottom: `1px solid ${alpha("#271436", 0.22)}`,
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: 64,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: "inherit",
          textDecoration: "none",
          "&:hover": {
            color: "#3a1f52",
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          color: "inherit",
          "&:hover": {
            backgroundColor: alpha("#271436", 0.1),
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: alpha("#ffffff", 0.72),
          "&.Mui-focused": {
            color: "#ffffff",
          },
          "&.MuiInputLabel-shrink": {
            color: alpha("#ffffff", 0.86),
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: alpha("#ffffff", 0.06),
          borderRadius: 10,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha("#ffffff", 0.22),
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: alpha("#ffffff", 0.42),
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1f3f8f",
          },
        },
        input: {
          color: "#ffffff",
          "&::placeholder": {
            color: alpha("#ffffff", 0.6),
            opacity: 1,
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          '&[type="number"]': {
            appearance: "textfield",
            MozAppearance: "textfield",
          },
          '&[type="number"]::-webkit-inner-spin-button, &[type="number"]::-webkit-outer-spin-button':
            {
              appearance: "none",
              margin: 0,
            },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9,
          textTransform: "none",
          fontWeight: 600,
        },
        contained: {
          backgroundColor: "#1f3f8f",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#1a3578",
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: `1px solid ${alpha("#ffffff", 0.18)}`,
          background: alpha("#ffffff", 0.08),
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          margin: 4,
          "&:hover": {
            backgroundColor: alpha("#ffffff", 0.14),
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: 3,
          backgroundColor: "#1f3f8f",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          color: alpha("#ffffff", 0.75),
          "&:hover": {
            color: "#ffffff",
            backgroundColor: alpha("#ffffff", 0.08),
          },
          "&.Mui-selected": {
            color: "#ffffff",
            backgroundColor: alpha("#1f3f8f", 0.42),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          color: "#ffffff",
          borderColor: "rgba(255, 255, 255, 0.45)",
          backgroundColor: "transparent",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.12)",
          },
          "&.Mui-selected": {
            backgroundColor: "#1f3f8f",
            color: "#ffffff",
            borderColor: "#1f3f8f",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "#1a3578",
          },
        },
      },
    },
  },
});
