import { josefin_sans } from "@/lib/fonts";
import { createTheme } from "@mui/material/styles";

const muiTheme = createTheme({
  typography: {
    fontFamily: josefin_sans.style.fontFamily,
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
