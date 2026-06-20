import { Chip, ChipProps, Tooltip, TooltipProps } from "@mui/material";

type CChipProps = ChipProps & {
  tooltipProps?: TooltipProps;
  tooltip?: string;
};

const CChip = ({ tooltipProps, tooltip, ...rest }: CChipProps) => {
  const resolvedTooltipProps = {
    enterTouchDelay: 0,
    title: tooltip,
    arrow: true,
    ...tooltipProps,
  };
  const component = <Chip {...rest} />;
  if (!resolvedTooltipProps) return component;

  return (
    <Tooltip {...resolvedTooltipProps}>
      <Chip {...rest} />
    </Tooltip>
  );
};

export default CChip;
