import CIconChip from "@components/ui/cIconChip";
import { IconButtonOwnProps } from "@mui/material";
import { IconHelp } from "@tabler/icons-react";

type CHelpChipProps = {
  sx?: IconButtonOwnProps["sx"];
  tooltip: string;
};

const CHelpChip = ({ sx, tooltip }: CHelpChipProps) => {
  return <CIconChip icon={<IconHelp />} tooltip={tooltip} sx={sx} />;
};

export default CHelpChip;
