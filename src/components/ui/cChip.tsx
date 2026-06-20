import { Chip, ChipProps, Tooltip, TooltipProps } from "@mui/material";

type CChipProps = ChipProps & {
  tooltipProps?: TooltipProps;
  tooltip?: string;
};

const CChip = ({ tooltipProps, tooltip, ...rest }: CChipProps) => {
  const resolvedTooltipProps = {
    title: tooltip,
    ...tooltipProps,
  };
  const component = <Chip {...rest} />;
  if (!tooltip) return component;

  return (
    <Tooltip {...resolvedTooltipProps}>
      <Chip {...rest} />
    </Tooltip>
  );
};

export default CChip;
