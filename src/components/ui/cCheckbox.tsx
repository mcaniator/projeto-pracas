import { Checkbox, CheckboxProps } from "@mui/material";

type CCheckboxProps = CheckboxProps;

function CCheckbox(props: CCheckboxProps) {
  const { sx, ...rest } = props;
  const baseSx = {
    borderRadius: 2,
  };
  return <Checkbox sx={{ ...baseSx, ...sx }} {...rest} />;
}

export default CCheckbox;
