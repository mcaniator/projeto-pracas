import { josefin_sans } from "@/lib/fonts";
import { createTheme } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface PaletteColor {
    lighter1?: string;
    lighter2?: string;
    lighter3?: string;
    lighter4?: string;
    lighter5?: string;
    lighter6?: string;
  }
  interface SimplePaletteColorOptions {
    lighter1?: string;
    lighter2?: string;
    lighter3?: string;
    lighter4?: string;
    lighter5?: string;
    lighter6?: string;
  }
}

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
      lighter1: "#AFCB8A",
      lighter2: "#C7DFAB",
      lighter3: "#D9EAC6",
      lighter4: "#E6F2D9",
      lighter5: "#F0F8E8",
      lighter6: "#F6FAF2",
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
    MuiPopper: {
      styleOverrides: {
        root: {
          zIndex: 2000,
        },
      },
    },
  },
});

export default muiTheme;
