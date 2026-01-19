import { Checkbox, CheckboxProps, FormControlLabel } from "@mui/material";

type CCheckboxProps = CheckboxProps & {
  label?: string;
};

function CCheckbox(props: CCheckboxProps) {
  const { sx, ...rest } = props;
  const baseSx = {
    borderRadius: 2,
  };
  return (
    <FormControlLabel
      label={props.label}
      control={<Checkbox sx={{ ...baseSx, ...sx }} {...rest} />}
    />
  );
}

export default CCheckbox;
