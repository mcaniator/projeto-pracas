import {
  Checkbox,
  CheckboxProps,
  FormControlLabel,
  SxProps,
  Theme,
} from "@mui/material";

type CCheckboxProps = CheckboxProps & {
  label?: string;
  formControlLabelSx?: SxProps<Theme>;
};

function CCheckbox(props: CCheckboxProps) {
  const { sx, formControlLabelSx, ...rest } = props;
  const baseSx = {
    borderRadius: 2,
  };
  return (
    <FormControlLabel
      label={props.label}
      sx={formControlLabelSx}
      control={<Checkbox sx={{ ...baseSx, ...sx }} {...rest} />}
    />
  );
}

export default CCheckbox;
