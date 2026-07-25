import { createTheme } from "@mui/material/styles"

export const muiTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#66027a",
    },
    background: {
      default: "#370142",
    },
    text: {
      primary: "#ffffff",
    },
  },
  components: {
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
            backgroundColor: "#ffffff",
            color: "#370142",
            borderColor: "#ffffff",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "#f2f2f2",
          },
        },
      },
    },
  },
})
