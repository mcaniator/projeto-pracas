import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { AccordionSummary, AccordionSummaryProps } from "@mui/material";
import React from "react";

type CAccordionSummaryProps = AccordionSummaryProps;

const CAccordionSummary = React.forwardRef<
  HTMLDivElement,
  CAccordionSummaryProps
>((props, ref) => {
  const { children, sx, expandIcon = <ExpandMoreIcon />, ...rest } = props;
  const baseSx = {
    backgroundColor: "primary.lighter4",
    "&:hover": {
      backgroundColor: "primary.lighter3",
    },
    "& .MuiAccordionSummary-content.Mui-expanded": {
      margin: "4px 0px",
    },
    "& .MuiAccordionSummary-content": {
      margin: "4px 0px",
    },
  };
  return (
    <AccordionSummary
      ref={ref}
      sx={{ ...sx, ...baseSx }}
      expandIcon={expandIcon}
      {...rest}
    >
      {children}
    </AccordionSummary>
  );
});

CAccordionSummary.displayName = "CAccordionSummary";

export default CAccordionSummary;
