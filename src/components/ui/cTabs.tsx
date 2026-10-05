import { Box, Tabs, TabsProps } from "@mui/material";

type TabsBorderPosition = "top" | "right" | "bottom" | "left";

export type CTabsProps = TabsProps & {
  borderPosition?: TabsBorderPosition;
};

const borderPropertyByPosition: Record<TabsBorderPosition, string> = {
  top: "borderTop",
  right: "borderRight",
  bottom: "borderBottom",
  left: "borderLeft",
};

const CTabs = ({
  borderPosition,
  orientation = "horizontal",
  ...tabsProps
}: CTabsProps) => {
  const resolvedBorderPosition =
    borderPosition ?? (orientation === "vertical" ? "right" : "bottom");

  return (
    <Box
      sx={{
        [borderPropertyByPosition[resolvedBorderPosition]]: 1,
        borderColor: "divider",
      }}
    >
      <Tabs orientation={orientation} {...tabsProps} />
    </Box>
  );
};

export default CTabs;
