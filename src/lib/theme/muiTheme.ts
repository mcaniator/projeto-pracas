import { josefin_sans } from "@/lib/fonts";
import { ptBR as ptBRCore } from "@mui/material/locale";
import { createTheme } from "@mui/material/styles";
import { ptBR as dataGridptBR } from "@mui/x-data-grid/locales";
import { ptBR as datePickerptBR } from "@mui/x-date-pickers/locales";

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

const muiTheme = createTheme(
  {
    typography: {
      fontFamily: josefin_sans.style.fontFamily,
    },
    breakpoints: {
      values: {
        xs: 0,
        sm: 680,
        md: 768,
        lg: 1024,
        xl: 1280,
      },
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
      secondary: {
        main: "#0079AB",
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
        styleOverrides: {
          root: () => ({
            borderRadius: 16,
            backgroundColor: "white",
            fontSize: 20,
            "& fieldset legend": {
              display: "none",
            },
            "& fieldset": {
              backgroundColor: "white",
            },
            "& .MuiOutlinedInput-input": {
              zIndex: 1,
            },
            "& .MuiAutocomplete-endAdornment": {
              zIndex: 1,
            },
            "& .MuiInputAdornment-outlined": {
              zIndex: 1,
            },
            "&.MuiInputBase-sizeSmall .MuiOutlinedInput-input": {
              paddingBottom: "0px",
              paddingTop: "12px",
            },
          }),
          input: ({ theme }) => ({
            fontSize: 16,
            [theme.breakpoints.up("sm")]: {
              fontSize: 20,
            },
          }),
        },
      },
      MuiInputLabel: {
        defaultProps: {
          sx: {
            fontSize: 20,
            top: "5px",
          },
        },
      },
      MuiTextField: {
        defaultProps: {
          InputLabelProps: { shrink: true },
        },
      },
      MuiAutocomplete: {
        styleOverrides: {
          input: {
            paddingBottom: 0,
          },
          inputRoot: {
            "&.MuiInputBase-sizeSmall .MuiAutocomplete-input": {
              paddingBottom: 0,
              paddingTop: "5px",
            },
            "&.MuiOutlinedInput-root.MuiInputBase-sizeSmall": {
              paddingBottom: 0,
              paddingTop: "7px",
            },
          },
          option: {
            minHeight: 0,
            paddingTop: 4,
            paddingBottom: 4,
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
  },
  ptBRCore,
  dataGridptBR,
  datePickerptBR,
);

export default muiTheme;
