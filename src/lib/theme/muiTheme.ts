import { josefin_sans } from "@/lib/fonts";
import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  typography: {
    fontFamily: josefin_sans.style.fontFamily,
  },
  palette: {
    primary: {
      main: "#648547",
      light: "#8FAE6C",
      dark: "#3F5A2A",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#D32F2F",
      light: "#EF5350",
      dark: "#B71C1C",
      contrastText: "#FFFFFF",
    },
  },
  components: {
    MuiOutlinedInput: {
      defaultProps: {
        sx: {
          fontSize: 20,
        },
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        input: {
          fontSize: 20,
        },
      },
    },
    MuiInputLabel: {
      defaultProps: {
        sx: {
          fontSize: 20,
        },
      },
    },
  },
});

export default muiTheme;
